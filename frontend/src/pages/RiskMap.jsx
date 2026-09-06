function RiskMap() {
  const zones = [
    { name: "High Risk Zone", value: "7", className: "high" },
    { name: "Moderate Risk Zone", value: "14", className: "moderate" },
    { name: "Low Risk Zone", value: "23", className: "low" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">GIS RISK INTELLIGENCE</p>
          <h1>Landslide Risk Map</h1>
          <p className="page-subtitle">
            Geographic visualization of predicted landslide susceptibility.
          </p>
        </div>
      </div>

      <div className="risk-map-layout">
        <div className="dashboard-card map-placeholder">
          <div className="map-grid">
            <div className="map-zone zone-high">HIGH RISK</div>
            <div className="map-zone zone-moderate">MODERATE</div>
            <div className="map-zone zone-low">LOW RISK</div>
            <div className="map-zone zone-moderate">MONITOR</div>
          </div>

          <div className="map-center-marker">📍</div>

          <p className="map-note">
            GIS map integration will display real-time satellite, terrain and
            sensor data.
          </p>
        </div>

        <div className="map-sidebar">
          <div className="dashboard-card">
            <h2>Risk Distribution</h2>

            {zones.map((zone) => (
              <div className="zone-stat" key={zone.name}>
                <div>
                  <span className={`zone-dot ${zone.className}`}></span>
                  {zone.name}
                </div>

                <strong>{zone.value}</strong>
              </div>
            ))}
          </div>

          <div className="dashboard-card">
            <h2>Map Layers</h2>

            <div className="layer-list">
              <label>
                <input type="checkbox" defaultChecked />
                Landslide Risk
              </label>

              <label>
                <input type="checkbox" defaultChecked />
                Rainfall Intensity
              </label>

              <label>
                <input type="checkbox" />
                Soil Moisture
              </label>

              <label>
                <input type="checkbox" />
                Sensor Network
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskMap;