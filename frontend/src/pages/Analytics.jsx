function Analytics() {
  const metrics = [
    { name: "Prediction Accuracy", value: "94.8%" },
    { name: "Sensor Availability", value: "98.2%" },
    { name: "Model Confidence", value: "91.6%" },
    { name: "Data Quality", value: "96.4%" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">AI INTELLIGENCE</p>
          <h1>Risk Analytics</h1>
          <p className="page-subtitle">
            Analyze environmental patterns and AI prediction performance.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {metrics.map((metric) => (
          <div className="stat-card" key={metric.name}>
            <p>{metric.name}</p>
            <h2>{metric.value}</h2>
            <span>Updated from latest monitoring data</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Risk Trend</h2>
              <p>Predicted regional risk over time</p>
            </div>
          </div>

          <div className="chart-placeholder">
            <div className="chart-bars">
              <span style={{ height: "35%" }}></span>
              <span style={{ height: "48%" }}></span>
              <span style={{ height: "42%" }}></span>
              <span style={{ height: "65%" }}></span>
              <span style={{ height: "72%" }}></span>
              <span style={{ height: "58%" }}></span>
              <span style={{ height: "82%" }}></span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Model Performance</h2>
              <p>AI landslide prediction system</p>
            </div>
          </div>

          <div className="model-metrics">
            {metrics.map((metric) => (
              <div className="metric-row" key={metric.name}>
                <span>{metric.name}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;