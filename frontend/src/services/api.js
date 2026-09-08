const API_BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export const api = {
  getAnalyticsOverview: () =>
    request("/analytics/overview"),

  getRiskDistribution: () =>
    request("/analytics/risk-distribution"),

  getRiskTrends: () =>
    request("/analytics/risk-trends"),

  getLocations: () =>
    request("/locations"),

  getAlerts: () =>
    request("/alerts"),

  getActiveAlerts: () =>
    request("/alerts/active"),

  getRiskOverview: () =>
    request("/risk/overview"),

  getRiskLocations: () =>
    request("/risk/locations"),

  getEnvironmentalReadings: () =>
    request("/readings"),

  // Live real-world weather data
  getLiveEnvironmentData: (locationId) =>
    request(`/readings/${locationId}/live`),

  getLiveRiskData: (locationId) =>
    request(`/readings/${locationId}/live-risk`),
};