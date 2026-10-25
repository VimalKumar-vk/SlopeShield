const weatherItems = [
  { icon: "☀️", label: "Clear" },
  { icon: "🌤️", label: "Partly Cloudy" },
  { icon: "☁️", label: "Cloudy" },
  { icon: "🌧️", label: "Rain" },
  { icon: "⛈️", label: "Thunderstorm" },
  { icon: "🌫️", label: "Fog / Mist" },
  { icon: "❄️", label: "Snow" },
];

export default function WeatherLegend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <h3 className="mb-2 text-sm font-bold text-slate-800">
        Weather Legend
      </h3>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {weatherItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{item.icon}</span>

            <span className="text-xs text-slate-600">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2">
        <p className="text-xs text-slate-500">
          🔵 Grouped marker = Multiple monitored towns
        </p>
      </div>
    </div>
  );
}