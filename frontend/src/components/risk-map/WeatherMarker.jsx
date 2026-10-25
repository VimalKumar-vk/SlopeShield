export default function WeatherMarker({ weather, count = 1, onClick }) {
  const isGroup = count > 1;

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        isGroup
          ? `${count} monitored towns`
          : `${weather.name}: ${weather.description}`
      }
      className="relative flex min-w-[64px] flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Weather icon */}
      <span className="text-2xl leading-tight">
        {weather.icon || "🌤️"}
      </span>

      {/* Temperature */}
      <span className="mt-1 text-sm font-bold text-slate-800">
        {Math.round(weather.temperature)}°C
      </span>

      {/* Town name or group count */}
      <span className="max-w-24 truncate text-xs text-slate-600">
        {isGroup ? `${count} towns` : weather.name}
      </span>

      {/* Group indicator */}
      {isGroup && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}