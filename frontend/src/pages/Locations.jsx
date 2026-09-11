import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Locations() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [riskLocations, setRiskLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      try {
        setLoading(true);
        setError(null);

        const [locationData, riskData] = await Promise.all([
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
          "Failed to load monitored locations:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load monitored locations from backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLocations();

    const refreshInterval = setInterval(
      loadLocations,
      60000
    );

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, []);

  function getRiskForLocation(locationId) {
    return riskLocations.find(
      (risk) =>
        Number(risk.location_id) === Number(locationId) ||
        Number(risk.locationId) === Number(locationId)
    );
  }

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

    return "NO DATA";
  }

  function getRiskScore(risk) {
    return (
      risk?.risk?.risk_score ??
      risk?.risk_score ??
      null
    );
  }

  function getSensorCount(location) {
    return (
      location?.active_sensors ??
      location?.activeSensors ??
      location?.sensor_count ??
      location?.sensorCount ??
      location?.sensors ??
      null
    );
  }

  function getRiskClass(riskLevel) {
    const value = riskLevel.toLowerCase();

    if (value === "critical") {
      return "critical";
    }

    if (value === "high") {
      return "high";
    }

    if (value === "moderate") {
      return "moderate";
    }

    if (value === "low") {
      return "low";
    }

    return "";
  }

  function handleOpenLocation() {
    navigate("/risk-map");
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">
              MONITORING NETWORK
            </p>

            <h1>Monitored Locations</h1>

            <p className="page-subtitle">
              Loading live monitored locations and risk status.
            </p>
          </div>
        </div>

        <div className="dashboard-card location-loading-card">
          <div className="loading-pulse"></div>

          <h2>Loading monitoring network...</h2>

          <p>
            Fetching locations and latest AI risk assessments.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">
              MONITORING NETWORK
            </p>

            <h1>Monitored Locations</h1>

            <p className="page-subtitle">
              Landslide-prone regions under active AI monitoring.
            </p>
          </div>
        </div>

        <div className="dashboard-card location-error-card">
          <div className="location-error-icon">
            !
          </div>

          <h2>Monitoring data unavailable</h2>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            MONITORING NETWORK
          </p>

          <h1>Monitored Locations</h1>

          <p className="page-subtitle">
            Live locations connected to the SlopeShield risk engine.
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          LIVE NETWORK
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="dashboard-card location-empty-card">
          <div className="location-empty-icon">
            📍
          </div>

          <h2>No monitored locations</h2>

          <p>
            No locations are currently available in the monitoring network.
          </p>
        </div>
      ) : (
        <div className="location-grid">
          {locations.map((location) => {
            const risk = getRiskForLocation(location.id);

            const riskLevel = getRiskLevel(risk);
            const riskClass = getRiskClass(riskLevel);
            const riskScore = getRiskScore(risk);
            const sensorCount = getSensorCount(location);

            return (
              <div
                className={`dashboard-card location-card ${riskClass}`}
                key={location.id}
              >
                <div className="location-card-top">
                  <div className="location-icon">
                    📍
                  </div>

                  <span
                    className={`risk-badge ${riskClass}`}
                  >
                    {riskLevel}
                  </span>
                </div>

                <h2>
                  {location.name || "Unnamed Location"}
                </h2>

                <p>
                  {location.district || "Unknown District"}
                  {location.district && location.state
                    ? ", "
                    : ""}
                  {location.state || ""}
                </p>

                <div className="location-info">
                  <div>
                    <span>Risk Score</span>

                    <strong>
                      {riskScore !== null
                        ? Number(riskScore).toFixed(2)
                        : "--"}
                    </strong>
                  </div>

                  <div>
                    <span>Active Sensors</span>

                    <strong>
                      {sensorCount !== null
                        ? sensorCount
                        : "Live"}
                    </strong>
                  </div>
                </div>

                <div className="location-coordinates">
                  <span>COORDINATES</span>

                  <strong>
                    {location.latitude !== undefined
                      ? Number(location.latitude).toFixed(4)
                      : "--"}
                    {" , "}
                    {location.longitude !== undefined
                      ? Number(location.longitude).toFixed(4)
                      : "--"}
                  </strong>
                </div>

                <button
                  className="action-button"
                  onClick={handleOpenLocation}
                >
                  View on Risk Map
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Locations;