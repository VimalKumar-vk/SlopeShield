const API_BASE_URL =
  "https://slopeshield-backend.onrender.com/api";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    options
  );

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
  // LIVE CURRENT LOCATION
  // ==================================================

  getCurrentLocation: () =>
    new Promise((resolve, reject) => {

      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          try {

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`
            );

            if (!response.ok) {
              throw new Error(
                "Unable to get location name."
              );
            }

            const data =
              await response.json();

            resolve({

              latitude,
              longitude,

              city:
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.municipality ||
                "Unknown",

              state:
                data.address?.state ||
                "Unknown",

              country:
                data.address?.country ||
                "Unknown",

              displayName:
                data.display_name ||
                "Unknown Location",

            });

          } catch (error) {

            reject(error);

          }

        },

        (error) => {

          if (error.code === 1) {
            reject(
              new Error(
                "Location permission denied."
              )
            );
          } else if (error.code === 2) {
            reject(
              new Error(
                "Location information is unavailable."
              )
            );
          } else if (error.code === 3) {
            reject(
              new Error(
                "Location request timed out."
              )
            );
          } else {
            reject(
              new Error(
                "Unable to get your current location."
              )
            );
          }

        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }

      );

    }),
    // ==================================================
// SEARCH LOCATION
// ==================================================

searchLocation: async (query) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      query
    )}&limit=1`
  );

  if (!response.ok) {
    throw new Error("Unable to search location.");
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found.");
  }

  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    displayName: data[0].display_name,
  };
},

// ==================================================
// WEATHER BY COORDINATES
// ==================================================

getWeatherByCoordinates: async (
  latitude,
  longitude
) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`
  );

  if (!response.ok) {
    throw new Error("Unable to get weather data.");
  }

  const data = await response.json();

  const celsius =
    data.current?.temperature_2m ?? null;

  const fahrenheit =
    celsius !== null
      ? (celsius * 9) / 5 + 32
      : null;

  return {
    temperatureCelsius: celsius,
    temperatureFahrenheit: fahrenheit,
    humidity:
      data.current?.relative_humidity_2m ?? null,
    windSpeed:
      data.current?.wind_speed_10m ?? null,
    time:
      data.current?.time ?? null,
  };
},


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

  predictRiskByCoordinates: (
    latitude,
    longitude
  ) =>
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

  updateReading: (
    readingId,
    readingData
  ) =>
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
  // LIVE WEATHER / ENVIRONMENT
  // ==================================================

  getLiveEnvironmentData: (locationId) =>
    request(`/readings/${locationId}/live`),

  getLiveRiskData: (locationId) =>
    request(`/readings/${locationId}/live-risk`),


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

};