import { useEffect, useState } from "react";
import { api } from "../services/api";
import LiveWeather from "../components/LiveWeather";
import LiveRisk from "../components/LiveRisk";

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await api.getAnalyticsOverview();
        setOverview(data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        {error}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="page-container">
        No dashboard data available.
      </div>
    );
  }

  const riskScore = overview.average_risk_score;

  const riskLevel =
    riskScore >= 75
      ? "Critical"
      : riskScore >= 50
      ? "High"
      : riskScore >= 25
      ? "Moderate"
      : "Low";

  const stats = [
    {
      title: "Overall Risk",
      value: riskLevel.toUpperCase(),
      description: `Average risk score: ${riskScore}`,
      icon: "⚠️",
    },
    {
      title: "Active Alerts",
      value: overview.active_alerts,
      description: "Alerts requiring monitoring",
      icon: "🔔",
    },
    {
      title: "High Risk Zones",
      value: overview.high_risk_locations,
      description: "Zones under close observation",
      icon: "📍",
    },
    {
      title: "Critical Zones",
      value: overview.critical_locations,
      description: `Across ${overview.total_locations} monitored locations`,
      icon: "🚨",
    },
  ];

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            SLOPESHIELD COMMAND CENTER
          </p>

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

            <div className="stat-icon">
              {stat.icon}
            </div>

            <p>{stat.title}</p>

            <h2>{stat.value}</h2>

            <span>{stat.description}</span>

          </div>
        ))}
      </div>

      <div className="dashboard-card risk-overview">

        <div className="card-header">

          <div>
            <h2>Regional Risk Overview</h2>
            <p>AI-generated risk assessment</p>
          </div>

          <span
            className={`risk-badge ${riskLevel.toLowerCase()}`}
          >
            {riskLevel.toUpperCase()}
          </span>

        </div>

        <div className="risk-visual">

          <div className="risk-circle">

            <div className="risk-score">
              {riskScore}
            </div>

            <div className="risk-label">
              Risk Score
            </div>

          </div>

        </div>

      </div>

      <div className="dashboard-grid">

        <LiveWeather locationId={1} />

        <LiveRisk locationId={1} />

      </div>

    </div>
  );
}

export default Dashboard;