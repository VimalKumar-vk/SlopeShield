function Locations() {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">MONITORING NETWORK</p>
          <h1>Monitored Locations</h1>
          <p className="page-subtitle">
            Landslide-prone regions under active AI monitoring.
          </p>
        </div>
      </div>

      <div className="location-grid">
        {locations.map((location) => (
          <div className="dashboard-card location-card" key={location.name}>
            <div className="location-icon">📍</div>

            <h2>{location.name}</h2>
            <p>{location.state}</p>

            <div className="location-info">
              <div>
                <span>Risk Level</span>
                <strong
                  className={`risk-text ${location.risk.toLowerCase()}`}
                >
                  {location.risk}
                </strong>
              </div>

              <div>
                <span>Active Sensors</span>
                <strong>{location.sensors}</strong>
              </div>
            </div>

            <button className="action-button">Open Location</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Locations;