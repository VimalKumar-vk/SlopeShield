export default function WeatherPopup({ weather, onClose }) {
  if (!weather) return null;

  return (
    <div className="w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {weather.name}
          </h3>

          <p className="text-sm text-slate-500">
            {weather.state || "India"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close weather details"
          className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          ✕
        </button>
      </div>

      {/* Main weather information */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <span className="text-5xl">
          {weather.icon || "🌤️"}
        </span>

        <div>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round(weather.temperature)}°C
          </p>

          <p className="text-sm capitalize text-slate-600">
            {weather.description || "Weather unavailable"}
          </p>
        </div>
      </div>

      {/* Weather details */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Humidity</p>
          <p className="mt-1 font-semibold text-slate-800">
            {weather.humidity}%
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Wind Speed</p>
          <p className="mt-1 font-semibold text-slate-800">
            {weather.windSpeed} m/s
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Rainfall</p>
          <p className="mt-1 font-semibold text-slate-800">
            {weather.precipitation ?? 0} mm
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Last Updated</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {weather.updatedAt
              ? new Date(weather.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
}