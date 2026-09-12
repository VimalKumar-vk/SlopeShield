import { useEffect, useState } from "react";
import { api } from "../services/api";

function LiveRisk({ locationId = 1 }) {
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveRisk() {
      try {
        const data = await api.getLiveRiskData(locationId);

        console.log("LIVE RISK API RESPONSE:", data);

        if (!cancelled) {
          setRiskData(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load live risk:", err);

        if (!cancelled) {
          setError("Unable to load live risk data");
        }
      }
    }

    loadLiveRisk();

    const interval = setInterval(loadLiveRisk, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [locationId]);

  // Loading
  if (!riskData && !error) {
    return (
      <div className="live-risk-card">
        <h2>Live AI Risk Assessment</h2>
        <p>Loading AI risk assessment...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="live-risk-card">
        <div className="card-header">
          <div>
            <h2>Live AI Risk Assessment</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // BACKEND RESPONSE MAPPING
  // =====================================================

  const riskLevel = riskData.risk_level || "Low";
  const riskScore = riskData.risk_score ?? 0;

  // IMPORTANT:
  // Backend sends "environment", not "environmental"
  const environment = riskData.environment || {};

  const rainfall24h = environment.rainfall_24h ?? 0;
  const rainfall72h = environment.rainfall_72h ?? 0;
  const soilMoisture = environment.soil_moisture ?? 0;
  const vegetationIndex = environment.vegetation_index ?? null;

  const temperature = environment.temperature ?? null;
  const humidity = environment.humidity ?? null;
  const windSpeed = environment.wind_speed ?? null;

  const riskLevelClass = riskLevel.toLowerCase();

  return (
    <div className="live-risk-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="card-header">
        <div>
          <h2>Live AI Risk Assessment</h2>

          <p>
            Real-time landslide risk calculation
          </p>
        </div>

        <span className={`risk-badge ${riskLevelClass}`}>
          {riskLevel.toUpperCase()}
        </span>
      </div>

      {/* =================================================
          RISK SCORE + ENVIRONMENT
      ================================================= */}

      <div className="live-risk-content">

        {/* Risk Score */}

        <div className="live-risk-score">
          <h1>{riskScore}</h1>

          <span>
            Risk Score
          </span>
        </div>

        {/* Environmental Parameters */}

        <div className="live-risk-environment">

          <div>
            <span>🌧 Rainfall 24h</span>

            <strong>
              {rainfall24h} mm
            </strong>
          </div>

          <div>
            <span>☔ Rainfall 72h</span>

            <strong>
              {rainfall72h} mm
            </strong>
          </div>

          <div>
            <span>💧 Soil Moisture</span>

            <strong>
              {soilMoisture} %
            </strong>
          </div>

          <div>
            <span>🌿 NDVI</span>

            <strong>
              {vegetationIndex !== null
                ? vegetationIndex
                : "--"}
            </strong>
          </div>

        </div>
      </div>

      {/* =================================================
          ADDITIONAL LIVE DATA
      ================================================= */}

      <div className="live-risk-extra">

        <div>
          <span>🌡 Temperature</span>

          <strong>
            {temperature !== null
              ? `${temperature} °C`
              : "--"}
          </strong>
        </div>

        <div>
          <span>💦 Humidity</span>

          <strong>
            {humidity !== null
              ? `${humidity} %`
              : "--"}
          </strong>
        </div>

        <div>
          <span>💨 Wind Speed</span>

          <strong>
            {windSpeed !== null
              ? `${windSpeed} km/h`
              : "--"}
          </strong>
        </div>

      </div>

      {/* =================================================
          LOCATION
      ================================================= */}

      <div className="live-risk-location">

        <span>
          📍 {riskData.location}
        </span>

        <span>
          {riskData.latitude}, {riskData.longitude}
        </span>

      </div>

      {/* =================================================
          SOURCE
      ================================================= */}

      <small>
        {riskData.source ||
          "Open-Meteo + Sentinel-2 NDVI"}
      </small>

    </div>
  );
}

export default LiveRisk;