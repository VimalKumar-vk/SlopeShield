const API_BASE_URL = "https://slopeshield-backend.onrender.com/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export const api = {
  // ==================================================
  // ANALYTICS
  // ==================================================

  getAnalyticsOverview: () =>
    request("/analytics/overview"),

  getRiskDistribution: () =>
    request("/analytics/risk-distribution"),

  getRiskTrends: () =>
    request("/analytics/risk-trends"),


  // ==================================================
  // LOCATIONS
  // ==================================================

  getLocations: () =>
    request("/locations"),

  getLocation: (locationId) =>
    request(`/locations/${locationId}`),

  getLocationLatest: (locationId) =>
    request(`/locations/${locationId}/latest`),

  getLocationHistory: (locationId) =>
    request(`/locations/${locationId}/history`),


  // ==================================================
  // WORLDWIDE LOCATION SEARCH
  // ==================================================

  geocodeLocation: (query) =>
    request(
      `/geocode?q=${encodeURIComponent(query)}`
    ),


  // ==================================================
  // ALERTS
  // ==================================================

  getAlerts: () =>
    request("/alerts"),

  getActiveAlerts: () =>
    request("/alerts/active"),

  acknowledgeAlert: (alertId) =>
    request(`/alerts/${alertId}/acknowledge`, {
      method: "POST",
    }),

    resolveAlert: (alertId) =>
  request(`/alerts/${alertId}/resolve`, {
    method: "PUT",
  }),


  // ==================================================
  // RISK
  // ==================================================

getRiskOverview: () =>
  request("/risk/overview"),

getRiskLocations: () =>
  request("/risk/locations"),

getRiskLocation: (locationId) =>
  request(`/risk/locations/${locationId}`),

predictRisk: (riskData) =>
  request("/risk/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(riskData),
  }),

predictRiskByCoordinates: (latitude, longitude) =>
  request(
    `/risk/predict-by-coordinates?latitude=${latitude}&longitude=${longitude}`
  ),

  // ==================================================
  // ENVIRONMENTAL READINGS
  // ==================================================

  getEnvironmentalReadings: () =>
    request("/readings"),

  getLocationReadings: (locationId) =>
    request(`/readings/${locationId}`),

  getLatestLocationReading: (locationId) =>
    request(`/readings/${locationId}/latest`),

  createReading: (readingData) =>
    request("/readings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(readingData),
    }),

  updateReading: (readingId, readingData) =>
    request(`/readings/${readingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(readingData),
    }),

  deleteReading: (readingId) =>
    request(`/readings/${readingId}`, {
      method: "DELETE",
    }),


  // ==================================================
  // WEATHER
  // ==================================================

  getLocationWeather: (locationId) =>
    request(`/weather/${locationId}`),


  // ==================================================
  // SIMULATION
  // ==================================================

  runSimulation: (simulationData) =>
    request("/simulation/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(simulationData),
    }),

  getSimulationHistory: () =>
    request("/simulation/history"),

  resetSimulation: () =>
    request("/simulation/reset", {
      method: "POST",
    }),


  // ==================================================
  // HEALTH
  // ==================================================

  getHealth: () =>
    request("/health"),
  // Live real-world weather data
  getLiveEnvironmentData: (locationId) =>
    request(`/readings/${locationId}/live`),

  getLiveRiskData: (locationId) =>
    request(`/readings/${locationId}/live-risk`),
};