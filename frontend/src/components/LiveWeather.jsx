import { useEffect, useState } from "react";
import { api } from "../services/api";

function LiveWeather({ locationId = 1 }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        setError(null);

        const data = await api.getLiveEnvironmentData(locationId);

        setWeather(data);
      } catch (err) {
        console.error("Failed to load live weather:", err);

        setError("Unable to load live weather data");
      }
    }

    loadWeather();

    const interval = setInterval(loadWeather, 60000);

    return () => clearInterval(interval);
  }, [locationId]);

  if (error) {
    return (
      <div className="live-weather-card">
        {error}
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="live-weather-card">
        Loading live weather...
      </div>
    );
  }

  return (
    <div className="live-weather-card">
      <h2>Live Environmental Data</h2>

      <h3>{weather.location}</h3>

      <p>
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
        Source: {weather.source || "Open-Meteo"}
      </small>
    </div>
  );
}

export default LiveWeather;