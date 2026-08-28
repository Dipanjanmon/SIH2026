import { useRiskZones } from '../hooks/useMap';
import { useCases } from '../hooks/useCases';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RiskBadge from '../components/RiskBadge';
import StatsCard from '../components/StatsCard';

function generateCaseGrowthData(cases: Array<{ reportedAt: string }> = []) {
  const dateMap: Record<string, number> = {};
  cases.forEach(c => {
    const date = new Date(c.reportedAt).toLocaleDateString();
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  return Object.entries(dateMap).map(([date, count]) => ({ date, cases: count }));
}

export default function RiskDashboardPage() {
  const { data: riskZones } = useRiskZones();
  const { data: cases } = useCases();

  const criticalZones = riskZones?.filter(z => z.riskLevel === 'CRITICAL') || [];
  const highZones = riskZones?.filter(z => z.riskLevel === 'HIGH') || [];
  const growthData = generateCaseGrowthData(cases);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Risk & Outbreak Dashboard</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Critical Zones" value={criticalZones.length} changeType="negative" />
        <StatsCard title="High Risk Zones" value={highZones.length} changeType="negative" />
        <StatsCard title="Total Cases" value={cases?.length || 0} />
        <StatsCard title="Active Clusters" value={riskZones?.length || 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Case Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Risk Factor Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-700">Case density per km²</span>
              <span className="text-sm font-semibold">{cases && cases.length > 0 ? (cases.length / 500).toFixed(2) : '0'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-700">Average risk score</span>
              <span className="text-sm font-semibold">{cases && cases.length > 0 ? (cases.reduce((a, b) => a + b.riskScore, 0) / cases.length).toFixed(1) : '0'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-700">Critical case ratio</span>
              <span className="text-sm font-semibold">{cases && cases.length > 0 ? `${((cases.filter(c => c.severity === 'CRITICAL').length / cases.length) * 100).toFixed(1)}%` : '0%'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-700">Active outbreaks</span>
              <span className="text-sm font-semibold">{criticalZones.length + highZones.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Risk Clusters</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {riskZones?.map(zone => (
            <div key={zone.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{zone.clusterId}</h4>
                <RiskBadge level={zone.riskLevel} />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Cases: <span className="font-medium">{zone.caseCount}</span></p>
                <p>Radius: {zone.radiusKm} km</p>
                <p>Growth: <span className={zone.caseGrowthPercent > 20 ? 'text-red-600 font-medium' : ''}>{zone.caseGrowthPercent}%</span></p>
                <p className="text-xs text-gray-500">Villages: {zone.affectedVillages.join(', ')}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {zone.primarySymptoms.map(s => (
                    <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {(!riskZones || riskZones.length === 0) && (
            <p className="col-span-3 py-8 text-center text-gray-500">No risk zones detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
