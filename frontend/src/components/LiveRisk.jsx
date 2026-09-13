import { useEffect, useState } from "react";
import { api } from "../services/api";

function LiveRisk({ locationId = 1 }) {
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLiveRisk() {
      try {
        const data = await api.getLiveRiskData(locationId);

        setRiskData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load live risk:", err);

        setError("Unable to load live risk data");
      }
    }

    loadLiveRisk();

    const interval = setInterval(
      loadLiveRisk,
      60000
    );

    return () => clearInterval(interval);
  }, [locationId]);

  if (error) {
    return (
      <div className="live-risk-card">
        {error}
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="live-risk-card">
        Loading AI risk assessment...
      </div>
    );
  }

  const riskLevelClass =
    riskData.risk_level.toLowerCase();

  return (
    <div className="live-risk-card">
      <div className="card-header">
        <div>
          <h2>Live AI Risk Assessment</h2>

          <p>
            Real-time landslide risk calculation
          </p>
        </div>

        <span
          className={`risk-badge ${riskLevelClass}`}
        >
          {riskData.risk_level.toUpperCase()}
        </span>
      </div>

      <div className="live-risk-content">
        <div className="live-risk-score">
          <h1>{riskData.risk_score}</h1>

          <span>Risk Score</span>
        </div>

        <div className="live-risk-environment">
          <div>
            <span>🌧 Rainfall</span>
            <strong>
              {riskData.environment.rainfall} mm
            </strong>
          </div>

          <div>
            <span>☔ Precipitation</span>
            <strong>
              {riskData.environment.precipitation} mm
            </strong>
          </div>

          <div>
            <span>💧 Humidity</span>
            <strong>
              {riskData.environment.humidity} %
            </strong>
          </div>

          <div>
            <span>💨 Wind Speed</span>
            <strong>
              {riskData.environment.wind_speed} km/h
            </strong>
          </div>
        </div>
      </div>

      <small>
        {riskData.source}
      </small>
    </div>
  );
}

export default LiveRisk;