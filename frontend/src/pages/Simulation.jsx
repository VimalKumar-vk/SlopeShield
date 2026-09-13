import { useState } from "react";

function Simulation() {
  const [rainfall, setRainfall] = useState(120);
  const [slope, setSlope] = useState(35);
  const [soilMoisture, setSoilMoisture] = useState(72);

  const riskScore = Math.min(
    100,
    Math.round(rainfall * 0.3 + slope * 0.8 + soilMoisture * 0.5)
  );

  let riskLevel = "LOW";

  if (riskScore >= 70) {
    riskLevel = "HIGH";
  } else if (riskScore >= 45) {
    riskLevel = "MODERATE";
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">AI PREDICTION LAB</p>
          <h1>Risk Simulation</h1>
          <p className="page-subtitle">
            Simulate environmental conditions and estimate landslide risk.
          </p>
        </div>
      </div>

      <div className="simulation-grid">
        <div className="dashboard-card simulation-controls">
          <h2>Simulation Parameters</h2>

          <div className="slider-group">
            <div className="slider-header">
              <span>Rainfall Intensity</span>
              <strong>{rainfall} mm</strong>
            </div>

            <input
              type="range"
              min="0"
              max="250"
              value={rainfall}
              onChange={(event) => setRainfall(Number(event.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span>Slope Angle</span>
              <strong>{slope}°</strong>
            </div>

            <input
              type="range"
              min="0"
              max="70"
              value={slope}
              onChange={(event) => setSlope(Number(event.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span>Soil Moisture</span>
              <strong>{soilMoisture}%</strong>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={soilMoisture}
              onChange={(event) =>
                setSoilMoisture(Number(event.target.value))
              }
            />
          </div>
        </div>

        <div className="dashboard-card simulation-result">
          <p className="page-eyebrow">SIMULATION RESULT</p>

          <div className="simulation-score">
            <span>{riskScore}</span>
            <small>/ 100</small>
          </div>

          <h2
            className={`simulation-risk ${riskLevel.toLowerCase()}`}
          >
            {riskLevel} RISK
          </h2>

          <p>
            The AI model estimates landslide susceptibility based on the
            selected environmental parameters.
          </p>

          <div className="simulation-status">
            <span>Rainfall</span>
            <strong>{rainfall} mm</strong>
          </div>

          <div className="simulation-status">
            <span>Slope</span>
            <strong>{slope}°</strong>
          </div>

          <div className="simulation-status">
            <span>Soil Moisture</span>
            <strong>{soilMoisture}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Simulation;