import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

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
        10,
        {
          animate: true,
        }
      );
    }
  }, [searchLocation, map]);

  return null;
}


// ============================================================
// RISK HELPERS
// ============================================================

function getRiskLevel(risk) {
  const value = String(
    risk?.risk?.risk_level ||
      risk?.risk_level ||
      risk?.risk ||
      risk?.level ||
      ""
  ).toUpperCase();

  if (value.includes("CRITICAL")) {
    return "CRITICAL";
  }

  if (value.includes("HIGH")) {
    return "HIGH";
  }

  if (
    value.includes("MODERATE") ||
    value.includes("MEDIUM")
  ) {
    return "MODERATE";
  }

  if (value.includes("LOW")) {
    return "LOW";
  }

  return "UNKNOWN";
}


function getRiskScore(risk) {
  return (
    risk?.risk?.risk_score ??
    risk?.risk_score ??
    null
  );
}


function getRiskClass(risk) {
  const level = getRiskLevel(risk);

  if (level === "CRITICAL") {
    return "critical";
  }

  if (level === "HIGH") {
    return "high";
  }

  if (level === "MODERATE") {
    return "moderate";
  }

  if (level === "LOW") {
    return "low";
  }

  return "unknown";
}


function getRiskColor(risk) {
  const level = getRiskLevel(risk);

  if (level === "CRITICAL") {
    return "#ff3158";
  }

  if (level === "HIGH") {
    return "#ff7a25";
  }

  if (level === "MODERATE") {
    return "#ffb52e";
  }

  if (level === "LOW") {
    return "#20e6a0";
  }

  return "#60a5fa";
}


// ============================================================
// CUSTOM MAP MARKER
// ============================================================

function createRiskIcon(risk, selected = false) {
  const color = getRiskColor(risk);

  const size = selected ? 25 : 20;

  const glow = selected
    ? `0 0 0 5px ${color}22, 0 0 22px ${color}aa`
    : `0 0 15px ${color}88`;

  return L.divIcon({
    className: "slopeshield-risk-marker",
    html: `
      <div
        style="
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${color};
          border:3px solid rgba(255,255,255,0.92);
          box-shadow:${glow};
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
        "
      >
        <div
          style="
            width:5px;
            height:5px;
            border-radius:50%;
            background:#07101e;
          "
        ></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
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
  // SEARCHED LOCATIONS
  // ----------------------------------------------------------

  const [searchedLocations, setSearchedLocations] = useState([]);


  // ----------------------------------------------------------
  // SELECTED LOCATION
  // ----------------------------------------------------------

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [selectedRisk, setSelectedRisk] =
    useState(null);


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
  // LOAD LIVE DATABASE DATA
  // ==========================================================

  useEffect(() => {

    let cancelled = false;

    async function loadMapData(showLoading = false) {

      try {

        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        const [
          locationData,
          riskData,
        ] = await Promise.all([
          api.getLocations(),
          api.getRiskLocations(),
        ]);

        if (cancelled) {
          return;
        }

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

        if (!cancelled) {
          setError(
            "Unable to load live database risk data."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    }


    loadMapData(true);


    const refreshInterval = setInterval(
      () => loadMapData(false),
      60000
    );


    return () => {

      cancelled = true;

      clearInterval(refreshInterval);

    };

  }, []);


  // ==========================================================
  // FIND DATABASE RISK
  // ==========================================================

  function getRiskForLocation(locationId) {

    return riskLocations.find(
      (risk) =>
        Number(risk.location_id) ===
          Number(locationId) ||
        Number(risk.locationId) ===
          Number(locationId)
    );
  }


  // ==========================================================
  // RISK COUNTS
  // ==========================================================

  const riskDistribution = useMemo(() => {

    const counts = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      unknown: 0,
    };


    riskLocations.forEach((risk) => {

      const level =
        getRiskLevel(risk).toLowerCase();

      if (counts[level] !== undefined) {
        counts[level] += 1;
      } else {
        counts.unknown += 1;
      }

    });


    searchedLocations.forEach((location) => {

      const level =
        getRiskLevel(location.riskData).toLowerCase();

      if (counts[level] !== undefined) {
        counts[level] += 1;
      }

    });


    return counts;

  }, [
    riskLocations,
    searchedLocations,
  ]);


  // ==========================================================
  // TOGGLE MAP LAYER
  // ==========================================================

  function toggleLayer(layer) {

    setLayers((previous) => ({
      ...previous,
      [layer]: !previous[layer],
    }));

  }


  // ==========================================================
  // MAP CENTER
  // ==========================================================

  const mapCenter = useMemo(() => {

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


    return [23.5, 92.5];

  }, [
    selectedLocation,
    locations,
  ]);


  // ==========================================================
  // WORLDWIDE SEARCH
  // ==========================================================

  async function handleSearch() {

    const query = search.trim();

    if (!query || searching) {
      return;
    }


    try {

      setSearching(true);

      setError(null);


      // ------------------------------------------------------
      // GEOCODING
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
      // SEARCHED LOCATION OBJECT
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
      // LIVE AI RISK
      // ------------------------------------------------------

      const riskData =
        await api.predictRiskByCoordinates(
          latitude,
          longitude
        );


      searchedLocation.riskData =
        riskData;


      searchedLocation.riskClass =
        getRiskClass(riskData);


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
          ].slice(0, 5);

        }
      );


      // ------------------------------------------------------
      // SELECT
      // ------------------------------------------------------

      setSelectedLocation(
        searchedLocation
      );

      setSelectedRisk(
        riskData
      );


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

  }


  // ==========================================================
  // SEARCH ENTER KEY
  // ==========================================================

  function handleSearchKeyDown(event) {

    if (event.key === "Enter") {
      handleSearch();
    }

  }


  // ==========================================================
  // SELECT SEARCHED LOCATION
  // ==========================================================

  async function handleSearchedLocationClick(
    location
  ) {

    setSelectedLocation(location);


    if (location.riskData) {

      setSelectedRisk(
        location.riskData
      );

      return;

    }


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


      setSearchedLocations(
        (previous) =>
          previous.map(
            (item) =>
              item.id === location.id
                ? {
                    ...item,
                    riskData,
                    riskClass:
                      getRiskClass(
                        riskData
                      ),
                  }
                : item
          )
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

  }


  // ==========================================================
  // SELECT DATABASE LOCATION
  // ==========================================================

  async function handleDatabaseLocationClick(
    location
  ) {

    setSelectedLocation(location);


    const existingRisk =
      getRiskForLocation(
        location.id
      );


    if (existingRisk) {

      setSelectedRisk(
        existingRisk
      );

      return;

    }


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
        "Database location risk error:",
        err
      );

      alert(
        "Unable to load live risk data."
      );

    } finally {

      setSearching(false);

    }

  }


  // ==========================================================
  // SELECTED RISK ENVIRONMENT
  // ==========================================================

  const selectedEnvironmental =
    selectedRisk?.environmental || {};


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="page-container">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            GIS RISK INTELLIGENCE
          </p>

          <h1>
            Landslide Risk Map
          </h1>

          <p className="page-subtitle">
            Live geographic monitoring of environmental
            conditions and AI-generated landslide risk.
          </p>

        </div>


        <div className="live-status">

          <span className="live-dot"></span>

          LIVE RISK MONITORING

        </div>

      </div>


      {/* ====================================================
          SEARCH
      ==================================================== */}

      <div className="dashboard-card risk-map-search">

        <div className="risk-map-search-icon">
          🔎
        </div>

        <input
          type="text"
          placeholder="Search any city, district or location worldwide..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={handleSearchKeyDown}
        />

        <button
          className="action-button"
          onClick={handleSearch}
          disabled={searching}
        >
          {searching
            ? "Analyzing..."
            : "Analyze Location"}
        </button>

      </div>


      {/* ====================================================
          SELECTED LIVE ASSESSMENT
      ==================================================== */}

      {selectedRisk && (

        <div className="dashboard-card risk-map-assessment">

          <div className="card-header">

            <div>

              <p className="page-eyebrow">
                LIVE AI ASSESSMENT
              </p>

              <h2>
                {selectedLocation?.name ||
                  "Selected Location"}
              </h2>

              <p>
                Real-time environmental intelligence
                and landslide risk calculation.
              </p>

            </div>


            <span
              className={`risk-badge ${getRiskClass(
                selectedRisk
              )}`}
            >
              {getRiskLevel(selectedRisk)}
            </span>

          </div>


          <div className="risk-assessment-grid">

            <div className="risk-assessment-score">

              <span>
                RISK SCORE
              </span>

              <strong>
                {getRiskScore(selectedRisk) !== null
                  ? Number(
                      getRiskScore(selectedRisk)
                    ).toFixed(1)
                  : "--"}
              </strong>

              <small>
                / 100
              </small>

            </div>


            <div className="risk-assessment-item">

              <span>
                Rainfall 24h
              </span>

              <strong>
                {selectedEnvironmental.rainfall_24h ??
                  "--"}{" "}
                mm
              </strong>

            </div>


            <div className="risk-assessment-item">

              <span>
                Rainfall 72h
              </span>

              <strong>
                {selectedEnvironmental.rainfall_72h ??
                  "--"}{" "}
                mm
              </strong>

            </div>


            <div className="risk-assessment-item">

              <span>
                Soil Moisture
              </span>

              <strong>
                {selectedEnvironmental.soil_moisture ??
                  "--"}{" "}
                %
              </strong>

            </div>


            <div className="risk-assessment-item">

              <span>
                NDVI
              </span>

              <strong>
                {selectedEnvironmental.vegetation_index ??
                  "--"}
              </strong>

            </div>


            <div className="risk-assessment-item">

              <span>
                Temperature
              </span>

              <strong>
                {selectedEnvironmental.temperature ??
                  "--"}{" "}
                °C
              </strong>

            </div>


            <div className="risk-assessment-item">

              <span>
                Humidity
              </span>

              <strong>
                {selectedEnvironmental.humidity ??
                  "--"}{" "}
                %
              </strong>

            </div>


            <div className="risk-assessment-source">

              <span>
                DATA SOURCE
              </span>

              <strong>
                {selectedRisk.source ||
                  "Open-Meteo + Sentinel-2 NDVI"}
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* ====================================================
          MAIN MAP LAYOUT
      ==================================================== */}

      <div className="risk-map-layout">


        {/* ==================================================
            MAP
        ================================================== */}

        <div className="dashboard-card risk-map-card">

          {loading && (

            <div className="map-status-overlay">

              <div className="loading-pulse"></div>

              <span>
                Loading live risk network...
              </span>

            </div>

          )}


          {error && (

            <div className="map-status-overlay map-error">

              <span>
                {error}
              </span>

            </div>

          )}


          <MapContainer
            center={mapCenter}
            zoom={6}
            scrollWheelZoom={true}
            style={{
              height: "540px",
              width: "100%",
            }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <MapSearch
              searchLocation={
                selectedLocation
              }
            />


            {/* ================================================
                DATABASE RISK MARKERS
            ================================================ */}

            {layers.risk &&
              locations.map((location) => {

                if (
                  location.latitude === undefined ||
                  location.longitude === undefined
                ) {
                  return null;
                }


                const risk =
                  getRiskForLocation(
                    location.id
                  );


                const isSelected =
                  selectedLocation?.id ===
                  location.id;


                return (

                  <Marker
                    key={`database-${location.id}`}
                    position={[
                      Number(location.latitude),
                      Number(location.longitude),
                    ]}
                    icon={createRiskIcon(
                      risk,
                      isSelected
                    )}
                    eventHandlers={{
                      click: () =>
                        handleDatabaseLocationClick(
                          location
                        ),
                    }}
                  >

                    <Popup>

                      <div className="map-popup">

                        <div className="map-popup-title">

                          <strong>
                            {location.name}
                          </strong>

                          <span
                            className={`risk-badge ${getRiskClass(
                              risk
                            )}`}
                          >
                            {getRiskLevel(risk)}
                          </span>

                        </div>


                        <div className="map-popup-row">

                          <span>
                            District
                          </span>

                          <strong>
                            {location.district ||
                              "N/A"}
                          </strong>

                        </div>


                        <div className="map-popup-row">

                          <span>
                            State
                          </span>

                          <strong>
                            {location.state ||
                              "N/A"}
                          </strong>

                        </div>


                        <div className="map-popup-row">

                          <span>
                            Risk Score
                          </span>

                          <strong>
                            {getRiskScore(risk) !== null
                              ? Number(
                                  getRiskScore(risk)
                                ).toFixed(2)
                              : "--"}
                          </strong>

                        </div>


                        <div className="map-popup-row">

                          <span>
                            Coordinates
                          </span>

                          <strong>
                            {Number(
                              location.latitude
                            ).toFixed(4)}
                            {", "}
                            {Number(
                              location.longitude
                            ).toFixed(4)}
                          </strong>

                        </div>

                      </div>

                    </Popup>

                  </Marker>

                );

              })}


            {/* ================================================
                SEARCHED LOCATION MARKERS
            ================================================ */}

            {layers.risk &&
              searchedLocations.map(
                (location) => {

                  const riskData =
                    location.riskData;


                  const isSelected =
                    selectedLocation?.id ===
                    location.id;


                  return (

                    <Marker
                      key={location.id}
                      position={[
                        Number(location.latitude),
                        Number(location.longitude),
                      ]}
                      icon={createRiskIcon(
                        riskData,
                        isSelected
                      )}
                      eventHandlers={{
                        click: () =>
                          handleSearchedLocationClick(
                            location
                          ),
                      }}
                    >

                      <Popup>

                        <div className="map-popup">

                          <div className="map-popup-title">

                            <strong>
                              {location.name}
                            </strong>

                            <span
                              className={`risk-badge ${getRiskClass(
                                riskData
                              )}`}
                            >
                              {getRiskLevel(
                                riskData
                              )}
                            </span>

                          </div>


                          {location.country && (

                            <div className="map-popup-row">

                              <span>
                                Country
                              </span>

                              <strong>
                                {location.country}
                              </strong>

                            </div>

                          )}


                          <div className="map-popup-row">

                            <span>
                              Risk Score
                            </span>

                            <strong>
                              {getRiskScore(
                                riskData
                              ) !== null
                                ? Number(
                                    getRiskScore(
                                      riskData
                                    )
                                  ).toFixed(2)
                                : "--"}
                            </strong>

                          </div>


                          <div className="map-popup-row">

                            <span>
                              Rainfall 24h
                            </span>

                            <strong>
                              {riskData?.environmental
                                ?.rainfall_24h ??
                                "--"}{" "}
                              mm
                            </strong>

                          </div>


                          <div className="map-popup-row">

                            <span>
                              NDVI
                            </span>

                            <strong>
                              {riskData?.environmental
                                ?.vegetation_index ??
                                "--"}
                            </strong>

                          </div>

                        </div>

                      </Popup>

                    </Marker>

                  );

                }
              )}

          </MapContainer>

        </div>


        {/* ==================================================
            MAP SIDEBAR
        ================================================== */}

        <div className="map-sidebar">


          {/* ================================================
              RISK DISTRIBUTION
          ================================================ */}

          <div className="dashboard-card map-panel">

            <div className="card-header">

              <div>

                <h2>
                  Risk Distribution
                </h2>

                <p>
                  Live monitoring network
                </p>

              </div>

            </div>


            <div className="risk-distribution-list">


              <div className="zone-stat critical-zone">

                <div>

                  <span className="zone-dot critical"></span>

                  Critical Risk

                </div>

                <strong>
                  {riskDistribution.critical}
                </strong>

              </div>


              <div className="zone-stat high-zone">

                <div>

                  <span className="zone-dot high"></span>

                  High Risk

                </div>

                <strong>
                  {riskDistribution.high}
                </strong>

              </div>


              <div className="zone-stat moderate-zone">

                <div>

                  <span className="zone-dot moderate"></span>

                  Moderate Risk

                </div>

                <strong>
                  {riskDistribution.moderate}
                </strong>

              </div>


              <div className="zone-stat low-zone">

                <div>

                  <span className="zone-dot low"></span>

                  Low Risk

                </div>

                <strong>
                  {riskDistribution.low}
                </strong>

              </div>

            </div>

          </div>


          {/* ================================================
              MAP LAYERS
          ================================================ */}

          <div className="dashboard-card map-panel">

            <div className="card-header">

              <div>

                <h2>
                  Map Layers
                </h2>

                <p>
                  Visualization controls
                </p>

              </div>

            </div>


            <div className="layer-list">

              <label>

                <input
                  type="checkbox"
                  checked={layers.risk}
                  onChange={() =>
                    toggleLayer("risk")
                  }
                />

                <span>
                  Landslide Risk
                </span>

              </label>


              <label>

                <input
                  type="checkbox"
                  checked={layers.rainfall}
                  onChange={() =>
                    toggleLayer("rainfall")
                  }
                />

                <span>
                  Rainfall Intensity
                </span>

              </label>


              <label>

                <input
                  type="checkbox"
                  checked={layers.soil}
                  onChange={() =>
                    toggleLayer("soil")
                  }
                />

                <span>
                  Soil Moisture
                </span>

              </label>


              <label>

                <input
                  type="checkbox"
                  checked={layers.sensors}
                  onChange={() =>
                    toggleLayer("sensors")
                  }
                />

                <span>
                  Sensor Network
                </span>

              </label>

            </div>

          </div>


          {/* ================================================
              SEARCHED LOCATIONS
          ================================================ */}

          {searchedLocations.length > 0 && (

            <div className="dashboard-card map-panel">

              <div className="card-header">

                <div>

                  <h2>
                    Recent Searches
                  </h2>

                  <p>
                    Live analyzed locations
                  </p>

                </div>

              </div>


              <div className="recent-search-list">

                {searchedLocations.map(
                  (location) => (

                    <button
                      className={`recent-search-item ${
                        selectedLocation?.id ===
                        location.id
                          ? "selected"
                          : ""
                      }`}
                      key={location.id}
                      onClick={() =>
                        handleSearchedLocationClick(
                          location
                        )
                      }
                    >

                      <span>

                        <strong>
                          {location.name}
                        </strong>

                        <small>
                          {location.country ||
                            location.state ||
                            "Worldwide"}
                        </small>

                      </span>


                      <span
                        className={`risk-badge ${getRiskClass(
                          location.riskData
                        )}`}
                      >
                        {getRiskLevel(
                          location.riskData
                        )}
                      </span>

                    </button>

                  )
                )}

              </div>

            </div>

          )}


          {/* ================================================
              MONITORED LOCATIONS
          ================================================ */}

          <div className="dashboard-card map-panel">

            <div className="card-header">

              <div>

                <h2>
                  Monitored Locations
                </h2>

                <p>
                  Database monitoring network
                </p>

              </div>

            </div>


            {locations.length === 0 ? (

              <p className="map-empty">
                No monitored locations available.
              </p>

            ) : (

              <div className="database-location-list">

                {locations.map(
                  (location) => {

                    const risk =
                      getRiskForLocation(
                        location.id
                      );


                    return (

                      <button
                        className={`database-location-item ${
                          selectedLocation?.id ===
                          location.id
                            ? "selected"
                            : ""
                        }`}
                        key={location.id}
                        onClick={() =>
                          handleDatabaseLocationClick(
                            location
                          )
                        }
                      >

                        <span className="database-location-main">

                          <span
                            className={`zone-dot ${getRiskClass(
                              risk
                            )}`}
                          ></span>

                          <span>

                            <strong>
                              {location.name}
                            </strong>

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

                          </span>

                        </span>


                        <span
                          className={`risk-badge ${getRiskClass(
                            risk
                          )}`}
                        >
                          {getRiskLevel(risk)}
                        </span>

                      </button>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}


export default RiskMap;