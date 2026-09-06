function Dashboard() {
  const stats = [
    {
      title: "Overall Risk",
      value: "MODERATE",
      description: "Current regional landslide risk",
      icon: "⚠️",
    },
    {
      title: "Active Alerts",
      value: "12",
      description: "Alerts requiring monitoring",
      icon: "🔔",
    },
    {
      title: "High Risk Zones",
      value: "7",
      description: "Zones under close observation",
      icon: "📍",
    },
    {
      title: "Rainfall",
      value: "84 mm",
      description: "Rainfall recorded in last 24 hours",
      icon: "🌧️",
    },
  ];

  const alerts = [
    {
      location: "Aizawl Hills",
      risk: "High",
      rainfall: "112 mm",
      status: "Immediate Monitoring",
    },
    {
      location: "Kohima Region",
      risk: "Moderate",
      rainfall: "76 mm",
      status: "Active Monitoring",
    },
    {
      location: "Shillong Ridge",
      risk: "Low",
      rainfall: "42 mm",
      status: "Stable",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">SLOPESHIELD COMMAND CENTER</p>
          <h1>Risk Intelligence Dashboard</h1>
          <p className="page-subtitle">
            Real-time AI-based landslide monitoring for North East India.
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          LIVE MONITORING
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-icon">{stat.icon}</div>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
            <span>{stat.description}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card risk-overview">
          <div className="card-header">
            <div>
              <h2>Regional Risk Overview</h2>
              <p>AI-generated risk assessment</p>
            </div>
            <span className="risk-badge moderate">MODERATE</span>
          </div>

          <div className="risk-visual">
            <div className="risk-circle">
              <div className="risk-score">68</div>
              <div className="risk-label">Risk Score</div>
            </div>

            <div className="risk-details">
              <div className="risk-row">
                <span>Rainfall Intensity</span>
                <strong>High</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill high-fill"></div>
              </div>

              <div className="risk-row">
                <span>Soil Saturation</span>
                <strong>Moderate</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill medium-fill"></div>
              </div>

              <div className="risk-row">
                <span>Slope Instability</span>
                <strong>Elevated</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill high-fill"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card weather-card">
          <div className="card-header">
            <div>
              <h2>Environmental Conditions</h2>
              <p>Latest sensor and weather data</p>
            </div>
          </div>

          <div className="weather-main">
            <div>
              <div className="weather-icon">🌧️</div>
              <h2>Heavy Rainfall</h2>
              <p>North East Region</p>
            </div>

            <div className="weather-data">
              <div>
                <span>Humidity</span>
                <strong>87%</strong>
              </div>
              <div>
                <span>Temperature</span>
                <strong>24°C</strong>
              </div>
              <div>
                <span>Wind</span>
                <strong>18 km/h</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card alerts-table-card">
        <div className="card-header">
          <div>
            <h2>Priority Risk Locations</h2>
            <p>Locations requiring active monitoring</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Risk Level</th>
                <th>Rainfall</th>
                <th>System Status</th>
              </tr>
            </thead>

            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.location}>
                  <td>{alert.location}</td>
                  <td>
                    <span
                      className={`risk-badge ${alert.risk.toLowerCase()}`}
                    >
                      {alert.risk}
                    </span>
                  </td>
                  <td>{alert.rainfall}</td>
                  <td>{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;