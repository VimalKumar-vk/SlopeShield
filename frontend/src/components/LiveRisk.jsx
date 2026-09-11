import { useEffect, useState } from "react";
import { api } from "../services/api";

function LiveRisk({ locationId = 1 }) {
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveRisk() {
      try {
        setError(null);

        const location = await api.getLocation(locationId);

        if (!location) {
          throw new Error("Location not found");
        }

        const data = await api.predictRiskByCoordinates(
          location.latitude,
          location.longitude
        );

        if (!cancelled) {
          setRiskData(data);
        }
      } catch (err) {
        console.error("Failed to load live risk:", err);

        if (!cancelled) {
          setError("Unable to load live AI risk data");
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

  if (!riskData) {
    return (
      <div className="live-risk-card">
        <h2>Live AI Risk Assessment</h2>
        <p>Loading AI risk assessment...</p>
      </div>
    );
  }

  const riskLevel = riskData.risk?.risk_level || "LOW";
  const riskScore = riskData.risk?.risk_score ?? 0;
  const environmental = riskData.environmental || {};
  const vegetationIndex = environmental.vegetation_index;

  const riskLevelClass = riskLevel.toLowerCase();

  return (
    <div className="live-risk-card">
      <div className="card-header">
        <div>
          <h2>Live AI Risk Assessment</h2>
          <p>Real-time landslide risk calculation</p>
        </div>

        <span className={`risk-badge ${riskLevelClass}`}>
          {riskLevel.toUpperCase()}
        </span>
      </div>

      <div className="live-risk-content">
        <div className="live-risk-score">
          <h1>{riskScore}</h1>
          <span>Risk Score</span>
        </div>

        <div className="live-risk-environment">
          <div>
            <span>🌧 Rainfall 24h</span>
            <strong>{environmental.rainfall_24h ?? "--"} mm</strong>
          </div>

          <div>
            <span>☔ Rainfall 72h</span>
            <strong>{environmental.rainfall_72h ?? "--"} mm</strong>
          </div>

          <div>
            <span>💧 Soil Moisture</span>
            <strong>{environmental.soil_moisture ?? "--"} %</strong>
          </div>

          <div>
            <span>🌿 NDVI</span>
            <strong>{vegetationIndex ?? "--"}</strong>
          </div>
        </div>
      </div>

      <small>
        {riskData.source || "Open-Meteo + Sentinel-2 NDVI"}
      </small>
    </div>
  );
}

export default LiveRisk;