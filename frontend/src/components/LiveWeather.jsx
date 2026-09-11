import { useEffect, useState } from "react";
import { api } from "../services/api";

function LiveWeather({ locationId = 1 }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        setError(null);

        const data = await api.getLocationWeather(locationId);

        if (!cancelled) {
          setWeather(data);
        }
      } catch (err) {
        console.error("Failed to load live environmental data:", err);

        if (!cancelled) {
          setError("Unable to load live environmental data");
        }
      }
    }

    loadWeather();

    const interval = setInterval(loadWeather, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [locationId]);

  if (error) {
    return (
      <div className="live-weather-card">
        <h2>Live Environmental Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="live-weather-card">
        <h2>Live Environmental Data</h2>
        <p>Loading live environmental data...</p>
      </div>
    );
  }

  return (
    <div className="live-weather-card">
      <h2>Live Environmental Data</h2>

      <h3>{weather.location}</h3>

      <p>

        🌧 Rainfall (24h): {weather.rainfall_24h ?? "--"} mm
      </p>

      <p>
        ☔ Rainfall (72h): {weather.rainfall_72h ?? "--"} mm
      </p>

      <p>
        💧 Soil Moisture: {weather.soil_moisture ?? "--"} %
      </p>

      <p>
        🌿 Vegetation Index (NDVI):{" "}
        {weather.vegetation_index ?? "--"}
      </p>

        🌡 Temperature: {weather.temperature ?? "--"} °C
      </p>

      <p>
        💧 Humidity: {weather.humidity ?? "--"} %
      </p>

      <p>
        🌧 Rain: {weather.rain ?? "--"} mm
      </p>

      <p>
        ☔ Precipitation: {weather.precipitation ?? "--"} mm
      </p>

      <p>
        💨 Wind Speed: {weather.wind_speed ?? "--"} km/h
      </p>

      <small>
        Source: {weather.source || Open-Meteo + Sentinel-2 NDVI}
      </small>
    </div>
  );
}

export default LiveWeather;