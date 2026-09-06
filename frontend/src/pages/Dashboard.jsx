import { useEffect, useState } from "react";
import { api } from "../services/api";

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