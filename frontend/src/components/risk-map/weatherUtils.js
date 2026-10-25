const OPENWEATHER_API_KEY =
  import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

// ==========================================
// 1. WEATHER CONDITION
// ==========================================

export function getWeatherInfo(code) {
  if (code >= 200 && code < 300) {
    return { icon: "⛈️", label: "Thunderstorm" };
  }

  if (code >= 300 && code < 400) {
    return { icon: "🌦️", label: "Drizzle" };
  }

  if (code >= 500 && code < 600) {
    return { icon: "🌧️", label: "Rain" };
  }

  if (code >= 600 && code < 700) {
    return { icon: "❄️", label: "Snow" };
  }

  if (code >= 700 && code < 800) {
    return { icon: "🌫️", label: "Fog / Atmosphere" };
  }

  if (code === 800) {
    return { icon: "☀️", label: "Clear sky" };
  }

  if (code === 801) {
    return { icon: "🌤️", label: "Few clouds" };
  }

  if (code === 802) {
    return { icon: "⛅", label: "Scattered clouds" };
  }

  if (code === 803 || code === 804) {
    return { icon: "☁️", label: "Cloudy" };
  }

  return { icon: "🌡️", label: "Unknown" };
}

// ==========================================
// 2. WEATHER CATEGORY
// ==========================================

export function getWeatherCategory(code) {
  if (code >= 200 && code < 300) return "thunderstorm";
  if (code >= 300 && code < 400) return "drizzle";
  if (code >= 500 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "fog";
  if (code === 800) return "clear";
  if (code === 801 || code === 802) return "partly-cloudy";
  if (code === 803 || code === 804) return "cloudy";

  return "unknown";
}

// ==========================================
// 3. FETCH WEATHER FOR ONE TOWN
// ==========================================

export async function fetchTownWeather(town) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error(
      "OpenWeatherMap API key is missing from frontend/.env"
    );
  }

  const { name, state, latitude, longitude } = town;

  const url = new URL(
    "https://api.openweathermap.org/data/2.5/weather"
  );

  url.search = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    appid: OPENWEATHER_API_KEY,
    units: "metric",
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Weather API failed for ${name}: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  const current = data.main;
  const condition = data.weather?.[0];

  if (!current || !condition) {
    throw new Error(`Weather data unavailable for ${name}`);
  }

  return {
    name,
    state,
    latitude: Number(latitude),
    longitude: Number(longitude),

    temperature: Number(current.temp),
    humidity: Number(current.humidity),

    precipitation: Number(
      data.rain?.["1h"] ?? 0
    ),

    windSpeed: Number(
      data.wind?.speed ?? 0
    ),

    weatherCode: Number(condition.id),
    icon: getWeatherInfo(Number(condition.id)).icon,
    description: condition.description,

    updatedAt: data.dt
      ? new Date(data.dt * 1000).toISOString()
      : null,
  };
}

// ==========================================
// 4. FETCH MULTIPLE TOWNS
// ==========================================

export async function fetchWeatherForTowns(towns) {
  const results = await Promise.allSettled(
    towns.map((town) => fetchTownWeather(town))
  );

  const successful = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push(result.value);
    } else {
      failed.push({
        town: towns[index].name,
        error: result.reason?.message || "Unknown error",
      });
    }
  });

  return {
    weather: successful,
    failed,
  };
}

// ==========================================
// 5. AVERAGE WEATHER
// ==========================================

export function calculateAverageWeather(towns) {
  if (!towns.length) {
    return null;
  }

  const average = (key) =>
    towns.reduce(
      (total, town) => total + Number(town[key] || 0),
      0
    ) / towns.length;

  // Count weather categories.
  const categories = new Map();

  towns.forEach((town) => {
    const category = getWeatherCategory(town.weatherCode);

    categories.set(
      category,
      (categories.get(category) || 0) + 1
    );
  });

  // Select the most common category.
  const dominantCategory = [...categories.entries()]
    .sort((a, b) => b[1] - a[1])[0][0];

  // Select the most common actual weather code
  // within the dominant category.
  const codes = new Map();

  towns
    .filter(
      (town) =>
        getWeatherCategory(town.weatherCode) ===
        dominantCategory
    )
    .forEach((town) => {
      codes.set(
        town.weatherCode,
        (codes.get(town.weatherCode) || 0) + 1
      );
    });

  const dominantCode = [...codes.entries()]
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    temperature: average("temperature"),
    humidity: average("humidity"),
    precipitation: average("precipitation"),
    windSpeed: average("windSpeed"),

    weatherCode: dominantCode,
    weatherCategory: dominantCategory,

    townCount: towns.length,

    towns: towns.map((town) => town.name),

    latitude: average("latitude"),
    longitude: average("longitude"),
  };
}

// ==========================================
// 6. STATE / REGION / TOWN WEATHER AGGREGATION
// ==========================================

export function aggregateWeatherByZoom(towns, zoom) {
  if (!towns.length) {
    return [];
  }

  // ZOOMED OUT: STATE-WISE WEATHER
  if (zoom < 4.8) {
    const states = new Map();

    towns.forEach((town) => {
      const stateName = town.state || "Unknown";

      if (!states.has(stateName)) {
        states.set(stateName, []);
      }

      states.get(stateName).push(town);
    });

    return [...states.entries()].map(([stateName, stateTowns]) => {
      const average = calculateAverageWeather(stateTowns);

      return {
        ...average,
        name: stateName,
        state: stateName,
        townCount: stateTowns.length,
        towns: stateTowns.map((town) => town.name),
        icon: getWeatherInfo(average.weatherCode).icon,
        isAggregate: true,
        aggregationLevel: "state",
      };
    });
  }

  // MEDIUM ZOOM: REGIONAL WEATHER
  if (zoom < 7.8) {
    const gridSize =
      zoom < 5.8 ? 2.4 :
      zoom < 6.8 ? 1.2 :
      0.55;

    const regions = new Map();

    towns.forEach((town) => {
      const latitudeCell = Math.floor(town.latitude / gridSize);
      const longitudeCell = Math.floor(town.longitude / gridSize);
      const key = `${latitudeCell}:${longitudeCell}`;

      if (!regions.has(key)) {
        regions.set(key, []);
      }

      regions.get(key).push(town);
    });

    return [...regions.values()].map((regionTowns) => {
      const average = calculateAverageWeather(regionTowns);

      const states = [
        ...new Set(regionTowns.map((town) => town.state).filter(Boolean)),
      ];

      return {
        ...average,
        name:
          regionTowns.length === 1
            ? regionTowns[0].name
            : `${regionTowns.length} towns`,
        state: states.join(", "),
        townCount: regionTowns.length,
        towns: regionTowns.map((town) => town.name),
        icon: getWeatherInfo(average.weatherCode).icon,
        isAggregate: regionTowns.length > 1,
        aggregationLevel: "region",
      };
    });
  }

  // ZOOMED IN: INDIVIDUAL TOWNS
  return towns.map((town) => ({
    ...town,
    townCount: 1,
    towns: [town.name],
    icon: getWeatherInfo(town.weatherCode).icon,
    isAggregate: false,
    aggregationLevel: "town",
  }));
}