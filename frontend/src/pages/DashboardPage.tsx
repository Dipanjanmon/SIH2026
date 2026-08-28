import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import { useCases } from '../hooks/useCases';
import { useFarms, useVaccinations } from '../hooks/useFacilities';
import { useAlerts } from '../hooks/useMap';
import {
  TrendingUp,
  AlertTriangle,
  Syringe,
  Bell,
  Activity,
  Stethoscope,
  CheckCircle,
  XCircle,
  FlaskConical,
  Users,
} from 'lucide-react';

function FarmerDashboard() {
  const { data: farms } = useFarms();
  const { data: cases } = useCases();
  const { data: vaccinations } = useVaccinations();
  const { data: alerts } = useAlerts();

  const activeCases =
    cases?.filter(
      (c) => c.status !== 'RECOVERED' && c.status !== 'DECEASED'
    ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your farms, cases and vaccinations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Farms"
          value={farms?.length || 0}
          subtitle="Registered farms"
          icon={<TrendingUp className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Active Cases"
          value={activeCases.length}
          subtitle="Cases requiring attention"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
          changeType="negative"
        />
        <StatsCard
          title="Vaccinations"
          value={vaccinations?.length || 0}
          subtitle="Total vaccinations"
          icon={<Syringe className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Alerts"
          value={alerts?.length || 0}
          subtitle="New notifications"
          icon={<Bell className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Cases
          </h3>
          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
            View All
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Case #
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Animal
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Symptoms
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Severity
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases?.slice(0, 5).map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {c.caseNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                    {c.animal?.species || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.symptoms?.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                        >
                          {s}
                        </span>
                      ))}
                      {c.symptoms && c.symptoms.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{c.symptoms.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : c.severity === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : c.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.status === 'CONFIRMED'
                          ? 'bg-red-100 text-red-700'
                          : c.status === 'RECOVERED'
                            ? 'bg-green-100 text-green-700'
                            : c.status === 'DECEASED'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!cases || cases.length === 0) && (
            <div className="py-12 text-center text-gray-500">
              <Stethoscope className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm">No cases reported yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VetDashboard() {
  const { data: cases } = useCases();

  const pendingCases =
    cases?.filter(
      (c) => c.status === 'REPORTED' || c.status === 'ASSIGNED'
    ) || [];
  const highRiskCases =
    cases?.filter(
      (c) => c.severity === 'HIGH' || c.severity === 'CRITICAL'
    ) || [];
  const inProgressCases =
    cases?.filter((c) => c.status === 'IN_PROGRESS') || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Veterinarian Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Cases requiring your attention
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Pending Cases"
          value={pendingCases.length}
          subtitle="Awaiting assignment"
          icon={<Bell className="h-5 w-5" />}
          color="orange"
          changeType="negative"
        />
        <StatsCard
          title="High Risk Cases"
          value={highRiskCases.length}
          subtitle="Requires immediate attention"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          changeType="negative"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCases.length}
          subtitle="Currently being treated"
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Priority Cases
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Case #
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Severity
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Risk Score
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {highRiskCases.slice(0, 5).map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {c.caseNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                    {c.village}, {c.district}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {c.riskScore}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GovDashboard() {
  const { data: cases } = useCases();
  const { data: vaccinations } = useVaccinations();

  const totalCases = cases?.length || 0;
  const confirmedCases =
    cases?.filter((c) => c.status === 'CONFIRMED').length || 0;
  const criticalCases =
    cases?.filter((c) => c.severity === 'CRITICAL').length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Government Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          District-wide surveillance overview
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Cases"
          value={totalCases}
          subtitle="All reported cases"
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Confirmed Cases"
          value={confirmedCases}
          subtitle="Lab confirmed"
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Critical Areas"
          value={criticalCases}
          subtitle="Requires intervention"
          icon={<XCircle className="h-5 w-5" />}
          color="red"
          changeType="negative"
        />
        <StatsCard
          title="Vaccination Coverage"
          value={vaccinations?.length || 0}
          subtitle="Total vaccinations"
          icon={<Syringe className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            District Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ...new Set(cases?.map((c) => c.district) || []),
            ].map((district) => {
              const districtCases =
                cases?.filter((c) => c.district === district) || [];
              const highRisk = districtCases.filter(
                (c) => c.severity === 'HIGH' || c.severity === 'CRITICAL'
              ).length;
              return (
                <div
                  key={district}
                  className="rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <h4 className="font-semibold text-gray-800">{district}</h4>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {districtCases.length} cases
                    </span>
                    {highRisk > 0 && (
                      <span className="text-sm font-medium text-red-600">
                        {highRisk} high risk
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LabDashboard() {
  const { data: cases } = useCases();
  const samples =
    cases?.filter(
      (c) => c.status === 'CONFIRMED' || c.status === 'IN_PROGRESS'
    ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Laboratory Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Sample processing and test results
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Pending Samples"
          value={samples.filter((s) => s.status !== 'CONFIRMED').length}
          subtitle="Awaiting processing"
          icon={<FlaskConical className="h-5 w-5" />}
          color="orange"
        />
        <StatsCard
          title="Processed Samples"
          value={samples.filter((s) => s.status === 'CONFIRMED').length}
          subtitle="Results available"
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Total Cases"
          value={cases?.length || 0}
          subtitle="In system"
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          System administration overview
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Users"
          value="--"
          subtitle="Total registered"
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Active Sessions"
          value="--"
          subtitle="Current users"
          icon={<Activity className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="System Health"
          value="OK"
          subtitle="All services running"
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Data Quality"
          value="98%"
          subtitle="Validation rate"
          icon={<TrendingUp className="h-5 w-5" />}
          color="purple"
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'FARMER':
      return <FarmerDashboard />;
    case 'VETERINARIAN':
      return <VetDashboard />;
    case 'GOVERNMENT':
    case 'GOVT_OFFICIAL':
      return <GovDashboard />;
    case 'LABORATORY':
    case 'LAB_TECHNICIAN':
      return <LabDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <FarmerDashboard />;
  }
}
