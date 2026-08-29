import { useState, useEffect } from 'react';
import { useCases } from '../hooks/useCases';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, BarChart3 } from 'lucide-react';
import apiClient from '../api/client';
import WeatherWidget from '../components/WeatherWidget';

const COLORS = ['#6366f1', '#f97316', '#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6'];

interface TrendData {
  daily: Array<{ date: string; cases: number }>;
  cumulative: Array<{ date: string; total: number }>;
  thisWeek: number;
  lastWeek: number;
  weeklyChangePercent: number;
  totalInPeriod: number;
}

interface DiseaseTrend {
  disease: string;
  totalCases: number;
  activeCases: number;
  criticalCount: number;
  highCount: number;
  districts: string[];
}

export default function AnalyticsPage() {
  const { data: cases } = useCases();
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [diseaseTrends, setDiseaseTrends] = useState<DiseaseTrend[]>([]);
  const [severityDist, setSeverityDist] = useState<Record<string, number>>({});
  const [vacCoverage, setVacCoverage] = useState<{ totalAnimals: number; totalVaccinations: number; coveragePercent: number } | null>(null);

  useEffect(() => {
    apiClient.get('/analytics/trends?days=30').then(r => setTrends(r.data)).catch(() => {});
    apiClient.get('/analytics/disease-trends').then(r => setDiseaseTrends(r.data)).catch(() => {});
    apiClient.get('/analytics/severity-distribution').then(r => setSeverityDist(r.data)).catch(() => {});
    apiClient.get('/analytics/vaccination-coverage').then(r => setVacCoverage(r.data)).catch(() => {});
  }, []);

  const severityChartData = Object.entries(severityDist).map(([name, value]) => ({ name, value }));
  const diseaseBarData = diseaseTrends.map(d => ({
    name: d.disease.length > 15 ? d.disease.substring(0, 15) + '…' : d.disease,
    total: d.totalCases,
    active: d.activeCases,
    critical: d.criticalCount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Surveillance</h2>
          <p className="mt-1 text-sm text-gray-500">Disease trends, weather correlation, and coverage metrics</p>
        </div>
        {trends && (
          <div className="flex items-center gap-2">
            {trends.weeklyChangePercent > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <TrendingUp className="h-3 w-3" /> +{trends.weeklyChangePercent}% this week
              </span>
            ) : trends.weeklyChangePercent < 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                <TrendingDown className="h-3 w-3" /> {trends.weeklyChangePercent}% this week
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                <Activity className="h-3 w-3" /> No change
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Cases (30d)</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{trends?.totalInPeriod ?? cases?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">This Week</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">{trends?.thisWeek ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Vaccination Coverage</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{vacCoverage?.coveragePercent ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Active Diseases</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{diseaseTrends.filter(d => d.activeCases > 0).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Charts (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Epi Curve */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" /> Epidemiological Curve (30 days)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends?.daily || []}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="cases" stroke="#6366f1" strokeWidth={2} fill="url(#colorCases)" name="New Cases" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Disease Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Disease Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={diseaseBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#6366f1" name="Active" stackId="a" />
                <Bar dataKey="critical" fill="#ef4444" name="Critical" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution + Cumulative */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={severityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {severityChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Cumulative Cases</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends?.cumulative || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} name="Total Cases" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disease Trend Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Disease-wise Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500">Disease</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Total</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Active</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Critical</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Districts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {diseaseTrends.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{d.disease}</td>
                      <td className="px-6 py-3 text-gray-700">{d.totalCases}</td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{d.activeCases}</span>
                      </td>
                      <td className="px-6 py-3">
                        {d.criticalCount > 0 && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{d.criticalCount}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">{d.districts.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Weather Widget (1 col) */}
        <div className="space-y-6">
          <WeatherWidget district="Palghar" />
        </div>
      </div>
    </div>
  );
}
