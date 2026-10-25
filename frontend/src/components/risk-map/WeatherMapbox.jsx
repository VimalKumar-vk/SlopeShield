import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// import WeatherMarker from "./WeatherMarker";
import WeatherPopup from "./WeatherPopup";
import WeatherLegend from "./WeatherLegend";

import {
  fetchWeatherForTowns,
  aggregateWeatherByZoom,
} from "./weatherUtils";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Initial monitored locations.
// More towns can be added later.
const INDIAN_TOWNS = [
  { name: "Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.209 },
  { name: "Dehradun", state: "Uttarakhand", latitude: 30.3165, longitude: 78.0322 },
  { name: "Nainital", state: "Uttarakhand", latitude: 29.3803, longitude: 79.4636 },
  { name: "Almora", state: "Uttarakhand", latitude: 29.5971, longitude: 79.6591 },
  { name: "Shimla", state: "Himachal Pradesh", latitude: 31.1048, longitude: 77.1734 },
  { name: "Manali", state: "Himachal Pradesh", latitude: 32.2396, longitude: 77.1887 },
  { name: "Srinagar", state: "Jammu and Kashmir", latitude: 34.0837, longitude: 74.7973 },
  { name: "Guwahati", state: "Assam", latitude: 26.1445, longitude: 91.7362 },
  { name: "Shillong", state: "Meghalaya", latitude: 25.5788, longitude: 91.8933 },
  { name: "Gangtok", state: "Sikkim", latitude: 27.3389, longitude: 88.6065 },
  { name: "Itanagar", state: "Arunachal Pradesh", latitude: 27.0844, longitude: 93.6053 },
  { name: "Kohima", state: "Nagaland", latitude: 25.6751, longitude: 94.1086 },
  { name: "Imphal", state: "Manipur", latitude: 24.817, longitude: 93.9368 },
  { name: "Aizawl", state: "Mizoram", latitude: 23.7271, longitude: 92.7176 },
  { name: "Agartala", state: "Tripura", latitude: 23.8315, longitude: 91.2868 },
  { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { name: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376 },
  { name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462 },
  { name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  { name: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { name: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867 },
];

export default function WeatherMapbox({ selectedLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const onMarkerClickRef = useRef(null);

  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [zoom, setZoom] = useState(4);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchWeatherForTowns(INDIAN_TOWNS);
      console.log("WEATHER API RESULT:", result);

      setWeatherData(result.weather);

      if (result.weather.length === 0) {
        setError(
          "Weather data could not be loaded. Check your API key and network."
        );
      } else if (result.failed.length > 0) {
        setError(
          `Weather loaded for ${result.weather.length} towns. ${result.failed} towns could not be loaded.`
        );
      }
    } catch (err) {
      setError(err.message || "Unable to load weather data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();

    const interval = window.setInterval(loadWeather, 15 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [loadWeather]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      setError("Mapbox token is missing. Check frontend/.env.");
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [84, 25],
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 12,
    });

    map.on("load", () => {
      map.resize();
     console.log("MAPBOX MAP LOADED AND RESIZED SUCCESSFULLY");
        });

        map.on("error", (event) => {
        console.error("MAPBOX ERROR:", event.error);
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const handleZoom = () => setZoom(map.getZoom());

    map.on("zoom", handleZoom);

    map.on("error", (event) => {
      console.error("Mapbox error:", event.error);
    });

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleMarkerClick = useCallback((weather) => {
    setSelectedWeather(weather);
  }, []);

  useEffect(() => {
    onMarkerClickRef.current = handleMarkerClick;
  }, [handleMarkerClick]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !weatherData.length) return;

    const renderMarkers = () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];

      const groups = aggregateWeatherByZoom(weatherData, zoom);

      groups.forEach((group) => {
        const element = document.createElement("div");

        element.className = "weather-map-marker";

        const isGroup =
        group.isAggregate || group.townCount > 1;

        const markerLabel =
          group.aggregationLevel === "state"
            ? group.name
            : isGroup
              ? `${group.townCount} towns`
              : group.name;

        const markerWeather = {
          ...group,
          icon: group.icon || "🌤️",
        };

        const markerRoot = document.createElement("div");

        
        const markerButton = document.createElement("button");

        markerButton.type = "button";

        markerButton.className = `
          flex
          min-w-[54px]
          max-w-[105px]
          flex-col
          items-center
          rounded-lg
          border
          border-white/80
          bg-white/95
          px-2
          py-1.5
          shadow-md
          backdrop-blur-sm
          transition-all
          duration-200
          hover:z-50
          hover:scale-105
          hover:shadow-lg
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
        `;

        markerButton.innerHTML = `
          <span class="text-lg leading-tight">
            ${markerWeather.icon}
          </span>

          <span class="mt-0.5 text-xs font-bold leading-tight text-slate-800">
            ${Math.round(group.temperature)}°C
          </span>

          <span
            class="mt-0.5 max-w-[89px] truncate text-[10px] leading-tight text-slate-600"
            title="${markerLabel}"
          >
            ${markerLabel}
          </span>

          ${
            isGroup && group.aggregationLevel !== "state"
              ? `
                <span class="mt-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-blue-700">
                  ${group.townCount} towns
                </span>
              `
              : ""
          }
        `;

        markerRoot.appendChild(markerButton);
        element.appendChild(markerRoot);

        markerButton.addEventListener("click", () => {
          if (isGroup && group.towns) {
            const names = group.towns.map((town) => typeof town === "string" ? town : town.name).join(", ");

            setSelectedWeather({
              ...group,
              name: `${group.townCount} Monitored towns`,
              description: `Regional weather summary for: ${names}`,
              icon: group.icon || "🌤️",
               humidity: Math.round(group.humidity),
               windSpeed: Number(group.windSpeed.toFixed(1)),
               precipitation: Number(group.precipitation.toFixed(1)),
            });
          } else {
            onMarkerClickRef.current?.(group);
          }
        });

        const marker = new mapboxgl.Marker({
          element,
          anchor: "bottom",
        })
          .setLngLat([group.longitude, group.latitude])
          .addTo(map);

        markerRefs.current.push(marker);
      });
    };

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.once("load", renderMarkers);
    }

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
    };
  }, [weatherData, zoom]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedLocation) return;

    const latitude = Number(
      selectedLocation.latitude ?? selectedLocation.lat
    );

    const longitude = Number(
      selectedLocation.longitude ?? selectedLocation.lon
    );

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    map.flyTo({
      center: [longitude, latitude],
      zoom: 8,
      essential: true,
    });
  }, [selectedLocation]);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-xl">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-24px)]">
        <div className="rounded-lg bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <h2 className="text-sm font-bold text-slate-800">
            India Weather Map
          </h2>

          <p className="text-xs text-slate-500">
            Live conditions for monitored towns
          </p>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-24px)]">
        <WeatherLegend />
      </div>

      {loading && (
        <div className="absolute right-3 top-3 z-10 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-md">
          Loading weather…
        </div>
      )}

      {error && (
        <div
          role="status"
          className="absolute left-3 right-3 top-20 z-10 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
        >
          {error}
        </div>
      )}

      {selectedWeather && (
        <div className="absolute right-3 top-3 z-20">
          <WeatherPopup
            weather={selectedWeather}
            onClose={() => setSelectedWeather(null)}
          />
        </div>
      )}

      <button
        type="button"
        onClick={loadWeather}
        disabled={loading}
        className="absolute bottom-3 right-3 z-10 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-50 disabled:opacity-50"
      >
        {loading ? "Refreshing…" : "Refresh Weather"}
      </button>
    </div>
  );
}