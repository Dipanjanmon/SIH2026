import { useParams, Link } from 'react-router-dom';
import { useCase } from '../hooks/useCases';
import RiskBadge from '../components/RiskBadge';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: caseData, isLoading } = useCase(id || '');

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading case details...</div>;
  if (!caseData) return <div className="py-8 text-center text-gray-500">Case not found.</div>;

  const timeline = [
    { time: caseData.reportedAt, event: 'Case reported', color: 'bg-blue-500' },
    ...(caseData.status !== 'REPORTED' ? [{ time: caseData.updatedAt, event: 'Assigned to veterinarian', color: 'bg-yellow-500' }] : []),
    ...(caseData.status === 'IN_PROGRESS' ? [{ time: caseData.updatedAt, event: 'Treatment in progress', color: 'bg-indigo-500' }] : []),
    ...(caseData.status === 'CONFIRMED' ? [{ time: caseData.updatedAt, event: 'Disease confirmed by lab', color: 'bg-orange-500' }] : []),
    ...(caseData.status === 'RECOVERED' ? [{ time: caseData.updatedAt, event: 'Animal recovered', color: 'bg-green-500' }] : []),
    ...(caseData.status === 'DECEASED' ? [{ time: caseData.updatedAt, event: 'Animal deceased', color: 'bg-red-500' }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/cases" className="text-indigo-600 hover:underline">← Back to Cases</Link>
        <h2 className="text-2xl font-bold text-gray-900">Case {caseData.caseNumber}</h2>
        <RiskBadge level={caseData.severity} size="md" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Case Information</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Case Number</dt>
                <dd className="mt-1 font-medium">{caseData.caseNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1">{caseData.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Severity</dt>
                <dd className="mt-1"><RiskBadge level={caseData.severity} /></dd>
              </div>
              <div>
                <dt className="text-gray-500">Risk Score</dt>
                <dd className="mt-1 font-medium">{caseData.riskScore}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="mt-1">{caseData.village}, {caseData.block}, {caseData.district}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Reported At</dt>
                <dd className="mt-1">{new Date(caseData.reportedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {caseData.symptoms?.map(s => (
                <span key={s} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">{s}</span>
              ))}
            </div>
            {caseData.description && (
              <p className="mt-4 text-sm text-gray-600">{caseData.description}</p>
            )}
          </div>

          {caseData.animal && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Animal Details</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Tag Number</dt>
                  <dd className="mt-1 font-medium">{caseData.animal.tagNumber}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Species</dt>
                  <dd className="mt-1">{caseData.animal.species}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Breed</dt>
                  <dd className="mt-1">{caseData.animal.breed}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Gender</dt>
                  <dd className="mt-1">{caseData.animal.gender}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Age</dt>
                  <dd className="mt-1">{caseData.animal.age} years</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="mt-1">{caseData.animal.status}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Risk Assessment</h3>
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50">
                <span className="text-3xl font-bold text-indigo-600">{caseData.riskScore}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Risk Score</p>
              <RiskBadge level={caseData.severity} size="lg" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Timeline</h3>
            <div className="space-y-4">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="relative">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    {idx < timeline.length - 1 && <div className="absolute left-1.5 top-3 h-full w-0.5 bg-gray-200" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.event}</p>
                    <p className="text-xs text-gray-500">{new Date(item.time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
