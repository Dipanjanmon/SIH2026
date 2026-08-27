import { useCases } from '../hooks/useCases';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#f97316', '#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#ec4899'];

function generateCasesByDay(cases: Array<{ reportedAt: string }> = []) {
  const map: Record<string, number> = {};
  cases.forEach(c => {
    const d = new Date(c.reportedAt).toLocaleDateString();
    map[d] = (map[d] || 0) + 1;
  });
  return Object.entries(map).map(([date, count]) => ({ date, cases: count }));
}

function generateCasesByDisease(cases: Array<{ symptoms: string[] }> = []) {
  const map: Record<string, number> = {};
  cases.forEach(c => {
    c.symptoms?.forEach(s => { map[s] = (map[s] || 0) + 1; });
  });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
}

function generateCasesByDistrict(cases: Array<{ district: string }> = []) {
  const map: Record<string, number> = {};
  cases.forEach(c => { map[c.district] = (map[c.district] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function generateMortalityTrend(cases: Array<{ reportedAt: string; status: string }> = []) {
  const map: Record<string, { reported: number; deceased: number }> = {};
  cases.forEach(c => {
    const d = new Date(c.reportedAt).toLocaleDateString();
    if (!map[d]) map[d] = { reported: 0, deceased: 0 };
    map[d].reported++;
    if (c.status === 'DECEASED') map[d].deceased++;
  });
  return Object.entries(map).map(([date, data]) => ({ date, ...data }));
}

export default function AnalyticsPage() {
  const { data: cases } = useCases();

  const casesByDay = generateCasesByDay(cases);
  const casesByDisease = generateCasesByDisease(cases);
  const casesByDistrict = generateCasesByDistrict(cases);
  const mortalityTrend = generateMortalityTrend(cases);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Cases by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={casesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cases" stroke="#6366f1" strokeWidth={2} name="New Cases" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Cases by Disease/Symptom</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={casesByDisease}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f97316" name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Cases by District</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={casesByDistrict}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {casesByDistrict.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Mortality Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mortalityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reported" fill="#6366f1" name="Reported" />
              <Bar dataKey="deceased" fill="#ef4444" name="Deceased" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Summary Statistics</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-indigo-50 p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{cases?.length || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Total Cases</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{cases?.filter(c => c.status === 'RECOVERED').length || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Recovered</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{cases?.filter(c => c.status === 'DECEASED').length || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Deceased</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{cases?.filter(c => c.severity === 'CRITICAL').length || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Critical</p>
          </div>
        </div>
      </div>
    </div>
  );
}
