import { useState, useEffect } from 'react';
import { Cloud, Droplets, Thermometer, AlertTriangle, Shield } from 'lucide-react';
import apiClient from '../api/client';

interface WeatherData {
  district: string;
  weather_summary: {
    avg_temperature: number;
    avg_humidity: number;
    total_rainfall_7d: number;
    current_temp: number;
    current_humidity: number;
  };
  season: {
    name: string;
    code: string;
    risk: string;
    advisory: string;
  };
  disease_risks: Array<{
    disease: string;
    risk_level: string;
    risk_score: number;
    trigger_type: string;
    description: string;
    matched_conditions: string[];
  }>;
  advisory: string;
}

const RISK_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-800 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
};

const SEASON_ICONS: Record<string, string> = {
  MONSOON: '🌧️',
  SUMMER: '☀️',
  WINTER: '❄️',
  TRANSITION: '🌤️',
  MODERATE: '🌥️',
};

export default function WeatherWidget({ district = 'Palghar' }: { district?: string }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(district);

  const districts = ['Palghar', 'Thane', 'Nashik', 'Pune', 'Nagpur', 'Kolhapur', 'Satara', 'Raigad'];

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/weather/correlation?district=${selectedDistrict}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedDistrict]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!data || !data.weather_summary) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Weather data unavailable</p>
      </div>
    );
  }

  const { weather_summary: ws, season, disease_risks, advisory } = data;

  return (
    <div className="space-y-4">
      {/* Weather Card */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Weather & Disease Risk</h3>
          </div>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
          >
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Current Weather */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{ws.current_temp}°C</p>
              <p className="text-[10px] text-gray-500">Temperature</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{ws.current_humidity}%</p>
              <p className="text-[10px] text-gray-500">Humidity</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{ws.total_rainfall_7d}mm</p>
              <p className="text-[10px] text-gray-500">Rain (7d)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{SEASON_ICONS[season.code] || '🌤️'}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{season.name}</p>
              <p className="text-[10px] text-gray-500">Season</p>
            </div>
          </div>
        </div>

        {/* Season Risk Badge */}
        <div className={`rounded-lg border px-3 py-2 text-xs ${RISK_COLORS[season.risk] || RISK_COLORS.LOW}`}>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span className="font-semibold">Season Risk: {season.risk}</span>
          </div>
          <p className="mt-1 opacity-80">{season.advisory}</p>
        </div>
      </div>

      {/* Disease-Weather Correlation */}
      {disease_risks && disease_risks.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900">Weather-Driven Disease Risks</h3>
          </div>
          <div className="space-y-2">
            {disease_risks.slice(0, 5).map((risk, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{risk.disease}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${RISK_COLORS[risk.risk_level] || ''}`}>
                      {risk.risk_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{risk.matched_conditions[0]}</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${risk.risk_level === 'HIGH' ? 'bg-red-500' : risk.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${risk.risk_score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{risk.risk_score}%</p>
                </div>
              </div>
            ))}
          </div>
          {advisory && (
            <p className="mt-3 text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              💡 {advisory}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
