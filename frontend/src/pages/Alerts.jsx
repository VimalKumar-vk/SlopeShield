function Alerts() {
  const alerts = [
    {
      id: "AL-001",
      location: "Aizawl Hills, Mizoram",
      level: "HIGH",
      message: "Heavy rainfall and high soil saturation detected.",
      time: "5 minutes ago",
    },
    {
      id: "AL-002",
      location: "Kohima Region, Nagaland",
      level: "MODERATE",
      message: "Slope movement indicators are above the normal threshold.",
      time: "18 minutes ago",
    },
    {
      id: "AL-003",
      location: "Shillong Ridge, Meghalaya",
      level: "LOW",
      message: "Environmental conditions remain stable.",
      time: "42 minutes ago",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">EARLY WARNING SYSTEM</p>
          <h1>Active Alerts</h1>
          <p className="page-subtitle">
            Monitor and manage AI-generated landslide warnings.
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          ALERT SYSTEM ACTIVE
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <p>Critical Alerts</p>
          <h2>2</h2>
          <span>Immediate action required</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <p>High Priority</p>
          <h2>5</h2>
          <span>Close monitoring required</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <p>Total Active</p>
          <h2>12</h2>
          <span>Current monitoring alerts</span>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div className="dashboard-card alert-item" key={alert.id}>
            <div className={`alert-indicator ${alert.level.toLowerCase()}`}></div>

            <div className="alert-content">
              <div className="alert-top">
                <span className="alert-id">{alert.id}</span>
                <span className={`risk-badge ${alert.level.toLowerCase()}`}>
                  {alert.level}
                </span>
              </div>

              <h2>{alert.location}</h2>
              <p>{alert.message}</p>

              <span className="alert-time">🕒 {alert.time}</span>
            </div>

            <button className="action-button">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;