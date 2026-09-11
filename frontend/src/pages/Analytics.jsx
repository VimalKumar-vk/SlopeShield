import { useEffect, useState } from "react";
import { api } from "../services/api";

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setError(null);

        const [overviewData, distributionData, trendsData] =
          await Promise.all([
            api.getAnalyticsOverview(),
            api.getRiskDistribution(),
            api.getRiskTrends(),
          ]);

        if (cancelled) return;

        setOverview(overviewData);
        setDistribution(distributionData);
        setTrends(trendsData?.trends || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);

        if (!cancelled) {
          setError("Unable to load analytics data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    const interval = setInterval(loadAnalytics, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">AI INTELLIGENCE</p>
            <h1>Risk Analytics</h1>
            <p className="page-subtitle">
              Loading live monitoring analytics...
            </p>
          </div>

          <div className="live-status">
            <span className="live-dot"></span>
            ANALYTICS LIVE
          </div>
        </div>

        <div className="dashboard-card">
          <p>Connecting to the SlopeShield analytics engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">AI INTELLIGENCE</p>
            <h1>Risk Analytics</h1>
            <p className="page-subtitle">{error}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <p>
            Please make sure the SlopeShield backend is running and try again.
          </p>
        </div>
      </div>
    );
  }

  const riskScore = Number(overview?.average_risk_score ?? 0);

  const riskLevel =
    riskScore >= 90
      ? "CRITICAL"
      : riskScore >= 70
        ? "HIGH"
        : riskScore >= 40
          ? "MODERATE"
          : "LOW";

  const riskClass = riskLevel.toLowerCase();

  const low = Number(distribution?.low ?? 0);
  const moderate = Number(distribution?.moderate ?? 0);
  const high = Number(distribution?.high ?? 0);
  const critical = Number(distribution?.critical ?? 0);

  const totalRiskLocations = low + moderate + high + critical;

  const metrics = [
    {
      name: "Average Risk Score",
      value: riskScore.toFixed(2),
      description: "Latest average across monitored locations",
      icon: "◈",
      className: riskClass,
    },
    {
      name: "Monitored Locations",
      value: overview?.total_locations ?? 0,
      description: "Locations currently monitored",
      icon: "⌖",
      className: "blue",
    },
    {
      name: "Active Alerts",
      value: overview?.active_alerts ?? 0,
      description: "Currently active warnings",
      icon: "⚠",
      className: "alert",
    },
    {
      name: "Current Risk Level",
      value: riskLevel,
      description: "Based on current average risk",
      icon: "◆",
      className: riskClass,
    },
  ];

  const distributionItems = [
    {
      label: "Low",
      value: low,
      className: "low",
    },
    {
      label: "Moderate",
      value: moderate,
      className: "moderate",
    },
    {
      label: "High",
      value: high,
      className: "high",
    },
    {
      label: "Critical",
      value: critical,
      className: "critical",
    },
  ];

  const maxTrendScore =
    trends.length > 0
      ? Math.max(
          ...trends.map((item) =>
            Number(item.average_risk_score ?? 0)
          ),
          100
        )
      : 100;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">AI INTELLIGENCE</p>
          <h1>Risk Analytics</h1>
          <p className="page-subtitle">
            Analyze live environmental monitoring and AI risk assessments.
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          ANALYTICS LIVE
        </div>
      </div>

      {/* Main Metrics */}
      <div className="stats-grid">
        {metrics.map((metric) => (
          <div className="stat-card" key={metric.name}>
            <div className="stat-icon">{metric.icon}</div>

            <p>{metric.name}</p>

            <h2 className={`analytics-value ${metric.className}`}>
              {metric.value}
            </h2>

            <span>{metric.description}</span>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="dashboard-grid">
        {/* Risk Trend */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Risk Trend</h2>
              <p>
                Average risk score from stored assessments
              </p>
            </div>

            <span className="analytics-tag">LIVE DATA</span>
          </div>

          {trends.length === 0 ? (
            <div className="chart-placeholder">
              <div className="empty-chart-icon">⌁</div>
              <p>No historical risk data available yet.</p>
              <span>
                More assessments will appear here automatically.
              </span>
            </div>
          ) : (
            <div className="analytics-chart">
              <div className="chart-scale">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className="chart-area">
                <div className="chart-grid-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="chart-bars">
                  {trends.map((item, index) => {
                    const score = Number(
                      item.average_risk_score ?? 0
                    );

                    const height = Math.max(
                      (score / maxTrendScore) * 100,
                      5
                    );

                    return (
                      <div
                        className="chart-bar-wrapper"
                        key={`${item.date}-${index}`}
                        title={`${item.date}: ${score.toFixed(2)}`}
                      >
                        <div
                          className={`chart-bar ${score >= 75
                            ? "critical"
                            : score >= 50
                              ? "high"
                              : score >= 25
                                ? "moderate"
                                : "low"
                            }`}
                          style={{ height: `${height}%` }}
                        ></div>

                        <span className="chart-date">
                          {item.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Risk Distribution</h2>
              <p>
                Current risk level across monitored locations
              </p>
            </div>

            <span className="analytics-tag">
              {totalRiskLocations} ZONES
            </span>
          </div>

          <div className="risk-distribution-list">
            {distributionItems.map((item) => {
              const percentage =
                totalRiskLocations > 0
                  ? (item.value / totalRiskLocations) * 100
                  : 0;

              return (
                <div
                  className="risk-distribution-item"
                  key={item.label}
                >
                  <div className="distribution-heading">
                    <span className={`risk-dot ${item.className}`}></span>

                    <span>{item.label}</span>

                    <strong>{item.value}</strong>
                  </div>

                  <div className="distribution-track">
                    <div
                      className={`distribution-fill ${item.className}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalRiskLocations === 0 && (
            <p className="analytics-empty">
              No risk distribution data available.
            </p>
          )}
        </div>
      </div>

      {/* Model Performance */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Model Performance</h2>
            <p>
              Current validation status of the landslide prediction model
            </p>
          </div>

          <span className="analytics-tag">
            VALIDATION STATUS
          </span>
        </div>

        <div className="model-metrics">
          <div className="metric-row">
            <span>Prediction Accuracy</span>
            <strong className="status-neutral">
              Not validated
            </strong>
          </div>

          <div className="metric-row">
            <span>Model Confidence</span>
            <strong className="status-neutral">
              Not validated
            </strong>
          </div>

          <div className="metric-row">
            <span>Sensor Availability</span>
            <strong className="status-live">
              Live data required
            </strong>
          </div>

          <div className="metric-row">
            <span>Data Quality</span>
            <strong className="status-live">
              Live validation required
            </strong>
          </div>
        </div>

        <div className="analytics-note">
          <span>●</span>
          Model performance metrics will be displayed after sufficient
          validated training and field data are available.
        </div>
      </div>
    </div>
  );
}

export default Analytics;