import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { api } from "../services/api";


// ============================================================
// MAP SEARCH / MOVE HELPER
// ============================================================

function MapSearch({ searchLocation }) {
  const map = useMap();

  useEffect(() => {
    if (
      searchLocation &&
      searchLocation.latitude !== undefined &&
      searchLocation.longitude !== undefined
    ) {
      map.setView(
        [
          Number(searchLocation.latitude),
          Number(searchLocation.longitude),
        ],
        10
      );
    }
  }, [searchLocation, map]);

  return null;
}


// ============================================================
// RISK MAP
// ============================================================

function RiskMap() {

  // ----------------------------------------------------------
  // DATABASE LOCATIONS
  // ----------------------------------------------------------

  const [locations, setLocations] = useState([]);

  const [riskLocations, setRiskLocations] = useState([]);


  // ----------------------------------------------------------
  // WORLDWIDE SEARCHED LOCATIONS
  // ----------------------------------------------------------

  const [searchedLocations, setSearchedLocations] = useState([]);


  // ----------------------------------------------------------
  // SELECTED LOCATION
  // ----------------------------------------------------------

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [selectedRisk, setSelectedRisk] = useState(null);


  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  const [search, setSearch] = useState("");

  const [searching, setSearching] = useState(false);


  // ----------------------------------------------------------
  // LOADING / ERROR
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // ----------------------------------------------------------
  // MAP LAYERS
  // ----------------------------------------------------------

  const [layers, setLayers] = useState({
    risk: true,
    rainfall: false,
    soil: false,
    sensors: false,
  });


  // ==========================================================
  // LOAD DATABASE DATA
  // ==========================================================

  useEffect(() => {

    async function loadMapData() {

      try {

        setLoading(true);
        setError(null);

        const [
          locationData,
          riskData,
        ] = await Promise.all([
          api.getLocations(),
          api.getRiskLocations(),
        ]);

        setLocations(
          Array.isArray(locationData)
            ? locationData
            : []
        );

        setRiskLocations(
          Array.isArray(riskData)
            ? riskData
            : []
        );

      } catch (err) {

        console.error(
          "Risk map API error:",
          err
        );

        setError(
          "Unable to load database risk data."
        );

      } finally {

        setLoading(false);

      }

    }

    loadMapData();

  }, []);


  // ==========================================================
  // GET DATABASE RISK
  // ==========================================================

  const getRiskForLocation = (locationId) => {

    return riskLocations.find(
      (risk) =>
        Number(risk.location_id) ===
          Number(locationId) ||
        Number(risk.locationId) ===
          Number(locationId)
    );

  };


  // ==========================================================
  // GET RISK CLASS
  // ==========================================================

  const getRiskClass = (risk) => {

    const value = String(
      risk?.risk_level ||
      risk?.risk?.risk_level ||
      risk?.risk ||
      risk?.level ||
      ""
    ).toLowerCase();


    if (
      value.includes("critical") ||
      value.includes("high")
    ) {
      return "high";
    }


    if (
      value.includes("moderate") ||
      value.includes("medium")
    ) {
      return "moderate";
    }


    return "low";

  };


  // ==========================================================
  // GET RISK LEVEL
  // ==========================================================

  const getRiskLevel = (risk) => {

    return (
      risk?.risk?.risk_level ||
      risk?.risk_level ||
      risk?.risk ||
      risk?.level ||
      "UNKNOWN"
    );

  };


  // ==========================================================
  // GET RISK SCORE
  // ==========================================================

  const getRiskScore = (risk) => {

    return (
      risk?.risk?.risk_score ??
      risk?.risk_score ??
      null
    );

  };


  // ==========================================================
  // MAP CENTER
  // ==========================================================

  const getMapCenter = () => {

    // Selected worldwide location
    if (
      selectedLocation &&
      selectedLocation.latitude !== undefined &&
      selectedLocation.longitude !== undefined
    ) {

      return [
        Number(selectedLocation.latitude),
        Number(selectedLocation.longitude),
      ];

    }


    // Database location
    if (locations.length > 0) {

      const first = locations[0];

      if (
        first.latitude !== undefined &&
        first.longitude !== undefined
      ) {

        return [
          Number(first.latitude),
          Number(first.longitude),
        ];

      }

    }


    // World center
    return [20, 0];

  };


  const center = getMapCenter();


  // ==========================================================
  // WORLDWIDE RISK DISTRIBUTION
  // ==========================================================
  //
  // IMPORTANT:
  // Database risks + searched live risks
  //
  // ==========================================================

  const searchedRiskClasses =
    searchedLocations
      .map((location) => location.riskClass)
      .filter(Boolean);


  const databaseRiskClasses =
    riskLocations.map((risk) =>
      getRiskClass(risk)
    );


  const allRiskClasses = [
    ...databaseRiskClasses,
    ...searchedRiskClasses,
  ];


  const highRiskCount =
    allRiskClasses.filter(
      (risk) => risk === "high"
    ).length;


  const moderateRiskCount =
    allRiskClasses.filter(
      (risk) => risk === "moderate"
    ).length;


  const lowRiskCount =
    allRiskClasses.filter(
      (risk) => risk === "low"
    ).length;


  // ==========================================================
  // TOGGLE LAYER
  // ==========================================================

  const toggleLayer = (layer) => {

    setLayers((previous) => ({
      ...previous,
      [layer]: !previous[layer],
    }));

  };


  // ==========================================================
  // WORLDWIDE SEARCH
  // ==========================================================

  const handleSearch = async () => {

    const query = search.trim();


    if (!query) {

      return;

    }


    try {

      setSearching(true);
      setError(null);


      // ------------------------------------------------------
      // STEP 1
      // LOCATION NAME → LATITUDE / LONGITUDE
      // ------------------------------------------------------

      const geocoded =
        await api.geocodeLocation(query);


      if (
        !Array.isArray(geocoded) ||
        geocoded.length === 0
      ) {

        alert(
          "Location not found. Try another city, district, country or place."
        );

        return;

      }


      // ------------------------------------------------------
      // FIRST SEARCH RESULT
      // ------------------------------------------------------

      const place = geocoded[0];


      const latitude =
        Number(place.latitude);

      const longitude =
        Number(place.longitude);


      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {

        alert(
          "Invalid coordinates returned by location service."
        );

        return;

      }


      // ------------------------------------------------------
      // LOCATION INFORMATION
      // ------------------------------------------------------

      const searchedLocation = {

        id:
          `world-${Date.now()}`,

        name:
          place.name ||
          query,

        district:
          place.address?.city ||
          place.address?.town ||
          place.address?.municipality ||
          place.address?.county ||
          "",

        state:
          place.address?.state ||
          "",

        country:
          place.address?.country ||
          "",

        latitude,
        longitude,

        elevation:
          null,

        riskClass:
          null,

        riskData:
          null,

      };


      // ------------------------------------------------------
      // STEP 2
      // LIVE RISK BY COORDINATES
      // ------------------------------------------------------

      const riskData =
        await api.predictRiskByCoordinates(
          latitude,
          longitude
        );


      // ------------------------------------------------------
      // RISK CLASS
      // ------------------------------------------------------

      const riskClass =
        getRiskClass(riskData);


      searchedLocation.riskClass =
        riskClass;


      searchedLocation.riskData =
        riskData;


      // ------------------------------------------------------
      // SAVE SEARCH
      // ------------------------------------------------------

      setSearchedLocations(
        (previous) => {

          const filtered =
            previous.filter(
              (item) =>
                !(
                  Math.abs(
                    Number(item.latitude) -
                    latitude
                  ) < 0.0001 &&
                  Math.abs(
                    Number(item.longitude) -
                    longitude
                  ) < 0.0001
                )
            );


          return [
            searchedLocation,
            ...filtered,
          ];

        }
      );


      // ------------------------------------------------------
      // SELECT LOCATION
      // ------------------------------------------------------

      setSelectedLocation(
        searchedLocation
      );


      // ------------------------------------------------------
      // SELECT RISK
      // ------------------------------------------------------

      setSelectedRisk(
        riskData
      );


      // ------------------------------------------------------
      // CLEAR SEARCH INPUT
      // ------------------------------------------------------

      setSearch("");

    } catch (err) {

      console.error(
        "Worldwide search error:",
        err
      );

      alert(
        "Unable to get live location risk data."
      );

    } finally {

      setSearching(false);

    }

  };


  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleSearchKeyDown = (event) => {

    if (event.key === "Enter") {

      handleSearch();

    }

  };


  // ==========================================================
  // SELECT RECENT SEARCH
  // ==========================================================

  const handleSearchedLocationClick =
    async (location) => {

      setSelectedLocation(location);


      // If risk data is already stored
      if (location.riskData) {

        setSelectedRisk(
          location.riskData
        );

        return;

      }


      // Otherwise request fresh live data
      try {

        setSearching(true);


        const riskData =
          await api.predictRiskByCoordinates(
            Number(location.latitude),
            Number(location.longitude)
          );


        setSelectedRisk(
          riskData
        );


      } catch (err) {

        console.error(
          "Recent location risk error:",
          err
        );

        alert(
          "Unable to refresh live risk data."
        );

      } finally {

        setSearching(false);

      }

    };


  // ==========================================================
  // SELECT DATABASE LOCATION
  // ==========================================================

  const handleDatabaseLocationClick =
    (location) => {

      setSelectedLocation(
        location
      );


      const risk =
        getRiskForLocation(
          location.id
        );


      setSelectedRisk(
        risk || null
      );

    };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="page-container">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            GIS RISK INTELLIGENCE
          </p>

          <h1>
            Landslide Risk Map
          </h1>

          <p className="page-subtitle">
            Worldwide geographic visualization
            of real-time environmental conditions
            and landslide risk.
          </p>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >

        <input
          type="text"
          placeholder="Search any location worldwide..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={
            handleSearchKeyDown
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid #ccc",
            fontSize: "14px",
          }}
        />


        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            padding:
              "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor:
              searching
                ? "not-allowed"
                : "pointer",
            fontWeight: "600",
          }}
        >

          {searching
            ? "Checking..."
            : "Search"}

        </button>

      </div>


      {/* ======================================================
          LIVE RISK ASSESSMENT
      ====================================================== */}

      {selectedRisk && (

        <div
          className="dashboard-card"
          style={{
            marginBottom: "16px",
          }}
        >

          <h2>
            Live Risk Assessment
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(150px,1fr))",
              gap: "16px",
              marginTop: "15px",
            }}
          >

            {/* LOCATION */}

            <div>

              <strong>
                Location
              </strong>

              <br />

              {selectedLocation?.name ||
                "Unknown"}

            </div>


            {/* COORDINATES */}

            <div>

              <strong>
                Coordinates
              </strong>

              <br />

              {selectedRisk.latitude ??
                selectedLocation?.latitude ??
                "N/A"}

              ,

              {" "}

              {selectedRisk.longitude ??
                selectedLocation?.longitude ??
                "N/A"}

            </div>


            {/* RISK SCORE */}

            <div>

              <strong>
                Risk Score
              </strong>

              <br />

              {getRiskScore(
                selectedRisk
              ) !== null
                ? Number(
                    getRiskScore(
                      selectedRisk
                    )
                  ).toFixed(2)
                : "N/A"}

            </div>


            {/* RISK LEVEL */}

            <div>

              <strong>
                Risk Level
              </strong>

              <br />

              <strong>

                {getRiskLevel(
                  selectedRisk
                )}

              </strong>

            </div>


            {/* RAINFALL 24 */}

            <div>

              <strong>
                Rainfall 24h
              </strong>

              <br />

              {selectedRisk.environmental
                ?.rainfall_24h ??
                "N/A"}

              {" "}mm

            </div>


            {/* RAINFALL 72 */}

            <div>

              <strong>
                Rainfall 72h
              </strong>

              <br />

              {selectedRisk.environmental
                ?.rainfall_72h ??
                "N/A"}

              {" "}mm

            </div>


            {/* SOIL MOISTURE */}

            <div>

              <strong>
                Soil Moisture
              </strong>

              <br />

              {selectedRisk.environmental
                ?.soil_moisture ??
                "N/A"}

              {" "}%

            </div>


            {/* TEMPERATURE */}

            <div>

              <strong>
                Temperature
              </strong>

              <br />

              {selectedRisk.environmental
                ?.temperature ??
                "N/A"}

              {" "}°C

            </div>


            {/* HUMIDITY */}

            <div>

              <strong>
                Humidity
              </strong>

              <br />

              {selectedRisk.environmental
                ?.humidity ??
                "N/A"}

              {" "}%

            </div>


            {/* CURRENT RAIN */}

            <div>

              <strong>
                Current Rain
              </strong>

              <br />

              {selectedRisk.environmental
                ?.current_rain ??
                "N/A"}

              {" "}mm

            </div>


            {/* SOURCE */}

            <div>

              <strong>
                Data Source
              </strong>

              <br />

              {selectedRisk.source ||
                "Open-Meteo"}

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          MAIN LAYOUT
      ====================================================== */}

      <div className="risk-map-layout">


        {/* ====================================================
            MAP
        ==================================================== */}

        <div
          className="dashboard-card"
          style={{
            padding: 0,
            overflow: "hidden",
            minHeight: "500px",
            position: "relative",
          }}
        >


          {/* LOADING */}

          {loading && (

            <div
              style={{
                padding: "15px",
                position: "absolute",
                zIndex: 1000,
                background: "white",
              }}
            >

              Loading map data...

            </div>

          )}


          {/* ERROR */}

          {error && (

            <div
              style={{
                padding: "15px",
                position: "absolute",
                zIndex: 1000,
                background: "white",
              }}
            >

              {error}

            </div>

          )}


          <MapContainer
            center={center}
            zoom={3}
            scrollWheelZoom={true}
            style={{
              height: "500px",
              width: "100%",
            }}
          >


            {/* =================================================
                OPEN STREET MAP
            ================================================= */}

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {/* =================================================
                MOVE MAP
            ================================================= */}

            <MapSearch
              searchLocation={
                selectedLocation
              }
            />


            {/* =================================================
                DATABASE MARKERS
            ================================================= */}

            {layers.risk &&

              locations.map(
                (location) => {

                  if (
                    location.latitude ===
                      undefined ||
                    location.longitude ===
                      undefined
                  ) {

                    return null;

                  }


                  const risk =
                    getRiskForLocation(
                      location.id
                    );


                  return (

                    <Marker
                      key={
                        `database-${location.id}`
                      }
                      position={[
                        Number(
                          location.latitude
                        ),
                        Number(
                          location.longitude
                        ),
                      ]}
                    >

                      <Popup>

                        <div>

                          <strong>
                            {location.name}
                          </strong>

                          <br />

                          District:
                          {" "}
                          {location.district ||
                            "N/A"}

                          <br />

                          State:
                          {" "}
                          {location.state ||
                            "N/A"}

                          <br />

                          Coordinates:
                          {" "}
                          {location.latitude},
                          {" "}
                          {location.longitude}

                          <br />

                          Risk:
                          {" "}

                          <strong>

                            {getRiskLevel(
                              risk
                            )}

                          </strong>

                          {getRiskScore(
                            risk
                          ) !== null && (

                            <>
                              <br />

                              Risk Score:
                              {" "}

                              {Number(
                                getRiskScore(
                                  risk
                                )
                              ).toFixed(2)}

                            </>

                          )}

                        </div>

                      </Popup>

                    </Marker>

                  );

                }
              )

            }


            {/* =================================================
                WORLDWIDE SEARCH MARKERS
            ================================================= */}

            {layers.risk &&

              searchedLocations.map(
                (location) => {

                  const isSelected =
                    selectedLocation?.id ===
                    location.id;


                  const riskData =
                    location.riskData;


                  return (

                    <Marker
                      key={
                        location.id
                      }
                      position={[
                        Number(
                          location.latitude
                        ),
                        Number(
                          location.longitude
                        ),
                      ]}
                    >

                      <Popup>

                        <div>

                          <strong>
                            {location.name}
                          </strong>

                          <br />

                          {location.district && (

                            <>
                              City/District:
                              {" "}
                              {location.district}
                              <br />
                            </>

                          )}


                          {location.state && (

                            <>
                              State:
                              {" "}
                              {location.state}
                              <br />
                            </>

                          )}


                          {location.country && (

                            <>
                              Country:
                              {" "}
                              {location.country}
                              <br />
                            </>

                          )}


                          Coordinates:
                          {" "}
                          {location.latitude},
                          {" "}
                          {location.longitude}

                          <br />

                          Live Risk:
                          {" "}

                          <strong>

                            {getRiskLevel(
                              riskData
                            )}

                          </strong>


                          {getRiskScore(
                            riskData
                          ) !== null && (

                            <>
                              <br />

                              Risk Score:
                              {" "}

                              {Number(
                                getRiskScore(
                                  riskData
                                )
                              ).toFixed(2)}

                            </>

                          )}


                          {riskData?.environmental
                            ?.rainfall_24h !==
                            undefined && (

                            <>
                              <br />

                              Rainfall 24h:
                              {" "}

                              {
                                riskData
                                  .environmental
                                  .rainfall_24h
                              }

                              {" "}mm

                            </>

                          )}

                        </div>

                      </Popup>

                    </Marker>

                  );

                }
              )

            }

          </MapContainer>

        </div>


        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <div className="map-sidebar">


          {/* ==================================================
              RISK DISTRIBUTION
          ================================================== */}

          <div className="dashboard-card">

            <h2>
              Risk Distribution
            </h2>


            <div className="zone-stat">

              <div>

                <span className="zone-dot high"></span>

                High Risk Zone

              </div>

              <strong>
                {highRiskCount}
              </strong>

            </div>


            <div className="zone-stat">

              <div>

                <span className="zone-dot moderate"></span>

                Moderate Risk Zone

              </div>

              <strong>
                {moderateRiskCount}
              </strong>

            </div>


            <div className="zone-stat">

              <div>

                <span className="zone-dot low"></span>

                Low Risk Zone

              </div>

              <strong>
                {lowRiskCount}
              </strong>

            </div>

          </div>


          {/* ==================================================
              MAP LAYERS
          ================================================== */}

          <div className="dashboard-card">

            <h2>
              Map Layers
            </h2>


            <div className="layer-list">

              <label>

                <input
                  type="checkbox"
                  checked={
                    layers.risk
                  }
                  onChange={() =>
                    toggleLayer(
                      "risk"
                    )
                  }
                />

                Landslide Risk

              </label>


              <label>

                <input
                  type="checkbox"
                  checked={
                    layers.rainfall
                  }
                  onChange={() =>
                    toggleLayer(
                      "rainfall"
                    )
                  }
                />

                Rainfall Intensity

              </label>


              <label>

                <input
                  type="checkbox"
                  checked={
                    layers.soil
                  }
                  onChange={() =>
                    toggleLayer(
                      "soil"
                    )
                  }
                />

                Soil Moisture

              </label>


              <label>

                <input
                  type="checkbox"
                  checked={
                    layers.sensors
                  }
                  onChange={() =>
                    toggleLayer(
                      "sensors"
                    )
                  }
                />

                Sensor Network

              </label>

            </div>

          </div>


          {/* ==================================================
              RECENT SEARCHES
          ================================================== */}

          {searchedLocations.length > 0 && (

            <div className="dashboard-card">

              <h2>
                Recent Searches
              </h2>


              {searchedLocations.map(
                (location) => (

                  <div
                    key={
                      location.id
                    }
                    style={{
                      padding:
                        "10px 0",
                      borderBottom:
                        "1px solid #eee",
                      cursor:
                        "pointer",
                    }}
                    onClick={() =>
                      handleSearchedLocationClick(
                        location
                      )
                    }
                  >

                    <strong>
                      {location.name}
                    </strong>

                    <br />

                    <small>

                      {location.country ||
                        location.state ||
                        "Worldwide"}

                    </small>

                    <br />

                    <small>

                      Risk:
                      {" "}

                      {getRiskLevel(
                        location.riskData
                      )}

                    </small>

                  </div>

                )
              )}

            </div>

          )}


          {/* ==================================================
              DATABASE LOCATIONS
          ================================================== */}

          <div className="dashboard-card">

            <h2>
              Monitored Locations
            </h2>


            {locations.length === 0 ? (

              <p>
                No database locations available.
              </p>

            ) : (

              locations.map(
                (location) => {

                  const risk =
                    getRiskForLocation(
                      location.id
                    );


                  return (

                    <div
                      key={
                        location.id
                      }
                      style={{
                        padding:
                          "10px 0",
                        borderBottom:
                          "1px solid #eee",
                        cursor:
                          "pointer",
                      }}
                      onClick={() =>
                        handleDatabaseLocationClick(
                          location
                        )
                      }
                    >

                      <strong>
                        {location.name}
                      </strong>

                      <br />

                      <small>

                        {location.district ||
                          ""}
                        {location.district &&
                          location.state
                          ? ", "
                          : ""}
                        {location.state ||
                          ""}

                      </small>

                      <br />

                      <small>

                        Risk:
                        {" "}

                        {getRiskLevel(
                          risk
                        )}

                      </small>

                    </div>

                  );

                }
              )

            )}

          </div>

        </div>

      </div>

    </div>

  );

}


export default RiskMap;