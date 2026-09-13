import { useEffect, useState } from "react";
import { api } from "../services/api";

function Locations() {
  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchedLocation, setSearchedLocation] =
    useState(null);

  const [weather, setWeather] =
    useState(null);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [loadingSearch, setLoadingSearch] =
    useState(false);

  const [loadingWeather, setLoadingWeather] =
    useState(false);

  const [error, setError] =
    useState("");

  const locations = [
    {
      name: "Aizawl Hills",
      state: "Mizoram",
      risk: "High",
      sensors: 18,
    },
    {
      name: "Shillong Ridge",
      state: "Meghalaya",
      risk: "Moderate",
      sensors: 14,
    },
    {
      name: "Kohima Region",
      state: "Nagaland",
      risk: "Moderate",
      sensors: 12,
    },
    {
      name: "Gangtok Hills",
      state: "Sikkim",
      risk: "Low",
      sensors: 9,
    },
  ];


  // ==================================================
  // GET WEATHER
  // ==================================================

  const loadWeather = async (
    latitude,
    longitude
  ) => {
    try {
      setLoadingWeather(true);
      setError("");

      const data =
        await api.getWeatherByCoordinates(
          latitude,
          longitude
        );

      setWeather(data);

    } catch (err) {
      console.error(
        "Weather error:",
        err
      );

      setError(
        "Unable to load weather data."
      );

    } finally {
      setLoadingWeather(false);
    }
  };


  // ==================================================
  // GET CURRENT LOCATION
  // ==================================================

  const getLiveLocation = async () => {
    try {
      setLoadingLocation(true);
      setError("");

      const location =
        await api.getCurrentLocation();

      setCurrentLocation(location);

      await loadWeather(
        location.latitude,
        location.longitude
      );

    } catch (err) {
      console.error(
        "Location error:",
        err
      );

      setError(
        err.message ||
        "Unable to get your current location."
      );

    } finally {
      setLoadingLocation(false);
    }
  };


  // ==================================================
  // SEARCH LOCATION
  // ==================================================

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setError(
        "Please enter a location."
      );
      return;
    }

    try {
      setLoadingSearch(true);
      setError("");
      setWeather(null);

      const location =
        await api.searchLocation(
          searchQuery.trim()
        );

      setSearchedLocation(location);

      await loadWeather(
        location.latitude,
        location.longitude
      );

    } catch (err) {
      console.error(
        "Search error:",
        err
      );

      setError(
        err.message ||
        "Location not found."
      );

    } finally {
      setLoadingSearch(false);
    }
  };


  // ==================================================
  // CURRENT LOCATION ON PAGE LOAD
  // ==================================================

  useEffect(() => {
    getLiveLocation();
  }, []);


  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="page-container">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            MONITORING NETWORK
          </p>

          <h1>
            Monitored Locations
          </h1>

          <p className="page-subtitle">
            Search any location and view
            real-time weather information.
          </p>

        </div>

      </div>


      {/* ==================================================
          SEARCH BAR
      ================================================== */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "20px",
          padding: "22px",
        }}
      >

       <h2
  style={{
    marginTop: 0,
    fontWeight: "700",
    color: "#60a5fa",
  }}
>
  🔎 Search Location
</h2>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <input
  type="text"
  value={searchQuery}
  onChange={(event) =>
    setSearchQuery(event.target.value)
  }
  placeholder="Enter city, state or country..."
  style={{
    flex: 1,
    minWidth: "250px",
    padding: "13px 18px",
    borderRadius: "25px",
    border: "1px solid #60a5fa",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "16px",
    outline: "none",
    fontWeight: "500",
    boxSizing: "border-box",
  }}
/>

        <button
  type="submit"
  className="action-button"
  disabled={loadingSearch}
  style={{
    borderRadius: "25px",
    color: "#ffffff",
    border: "1px solid #60a5fa",
    background: "#2563eb",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: loadingSearch ? "not-allowed" : "pointer",
  }}
>
  {loadingSearch
    ? "Searching..."
    : "🔎 Search"}
</button>

        </form>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

   {error && (
  <div
    className="dashboard-card"
    style={{
      marginBottom: "20px",
      padding: "15px 18px",
      border: "2px solid #ef4444",
      borderLeft: "6px solid #ef4444",
      borderRadius: "10px",
      background: "rgba(239, 68, 68, 0.15)",
      color: "#ffffff",
      fontWeight: "600",
      boxShadow:
        "0 0 10px #ef4444, 0 0 25px rgba(239,68,68,0.8), inset 0 0 15px rgba(239,68,68,0.2)",
      animation: "errorGlow 1.2s ease-in-out infinite alternate",
    }}
  >
    ⚠️ {error}
  </div>
)}


      {/* ==================================================
          SEARCHED LOCATION WEATHER
      ================================================== */}

      {searchedLocation && weather && (

        <div
          className="dashboard-card"
          style={{
            marginBottom: "20px",
            padding: "25px",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <p
                style={{
                  margin: 0,
                  opacity: 0.7,
                  fontSize: "13px",
                }}
              >
                📍 SEARCHED LOCATION
              </p>

              <h2
                style={{
                  margin:
                    "8px 0",
                }}
              >
                {searchedLocation.displayName}
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: 0.7,
                }}
              >
                Latitude:{" "}
                {searchedLocation.latitude.toFixed(5)}
                {" | "}
                Longitude:{" "}
                {searchedLocation.longitude.toFixed(5)}
              </p>

            </div>

            <button
              className="action-button"
              onClick={() =>
                loadWeather(
                  searchedLocation.latitude,
                  searchedLocation.longitude
                )
              }
              disabled={loadingWeather}
            >
              🔄 Refresh Weather
            </button>

          </div>


          {/* WEATHER */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "15px",
              marginTop: "25px",
            }}
          >

            <div className="stat-card">

              <div className="stat-icon">
                🌡️
              </div>

              <p>
                Celsius
              </p>

              <h2>
                {weather.temperatureCelsius !==
                null
                  ? `${weather.temperatureCelsius} °C`
                  : "--"}
              </h2>

              <span>
                Current Temperature
              </span>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                🌡️
              </div>

              <p>
                Fahrenheit
              </p>

              <h2>
                {weather.temperatureFahrenheit !==
                null
                  ? `${weather.temperatureFahrenheit.toFixed(
                      1
                    )} °F`
                  : "--"}
              </h2>

              <span>
                Current Temperature
              </span>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                💧
              </div>

              <p>
                Humidity
              </p>

              <h2>
                {weather.humidity !== null
                  ? `${weather.humidity}%`
                  : "--"}
              </h2>

              <span>
                Relative Humidity
              </span>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                🌬️
              </div>

              <p>
                Wind Speed
              </p>

              <h2>
                {weather.windSpeed !== null
                  ? `${weather.windSpeed} km/h`
                  : "--"}
              </h2>

              <span>
                Current Wind
              </span>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          LIVE CURRENT LOCATION
      ================================================== */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "20px",
          padding: "22px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >

          <div>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                opacity: 0.7,
              }}
            >
              📍 LIVE CURRENT LOCATION
            </p>

            <h2
              style={{
                margin:
                  "6px 0",
              }}
            >
              {loadingLocation
                ? "Detecting your location..."
                : currentLocation
                ? currentLocation.city
                : "Location unavailable"}
            </h2>

            {currentLocation && (
              <p
                style={{
                  margin: 0,
                  opacity: 0.75,
                }}
              >
                {currentLocation.state},{" "}
                {currentLocation.country}
              </p>
            )}

          </div>


          <button
            className="action-button"
            onClick={
              getLiveLocation
            }
            disabled={
              loadingLocation
            }
          >
            {loadingLocation
              ? "Getting Location..."
              : "📍 Get My Location"}
          </button>

        </div>

      </div>


      {/* ==================================================
          MONITORED LOCATIONS
      ================================================== */}

      <div className="location-grid">

        {locations.map(
          (location) => (

            <div
              className="dashboard-card location-card"
              key={location.name}
            >

              <div className="location-icon">
                📍
              </div>

              <h2>
                {location.name}
              </h2>

              <p>
                {location.state}
              </p>


              <div className="location-info">

                <div>

                  <span>
                    Risk Level
                  </span>

                  <strong
                    className={`risk-text ${location.risk.toLowerCase()}`}
                  >
                    {location.risk}
                  </strong>

                </div>


                <div>

                  <span>
                    Active Sensors
                  </span>

                  <strong>
                    {location.sensors}
                  </strong>

                </div>

              </div>


              <button
                className="action-button"
                onClick={() => {
                  setSearchQuery(
                    `${location.name}, ${location.state}`
                  );
                }}
              >
                Search Weather
              </button>

            </div>

          )
        )}

      </div>

    </div>
  );
}

export default Locations;