import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../hooks/useCases';
import RiskBadge from '../components/RiskBadge';

const STATUS_OPTIONS = ['ALL', 'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'CONFIRMED', 'RECOVERED', 'DECEASED'];
const SEVERITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CasesPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const params: Record<string, string> = {};
  if (statusFilter !== 'ALL') params.status = statusFilter;
  if (severityFilter !== 'ALL') params.severity = severityFilter;
  if (districtFilter) params.district = districtFilter;

  const { data: cases, isLoading } = useCases(Object.keys(params).length ? params : undefined);

  const filteredCases = cases?.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.caseNumber.toLowerCase().includes(q) ||
      c.village.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.symptoms?.some(s => s.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Disease Cases</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          >
            {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : s}</option>)}
          </select>
          <input
            type="text"
            placeholder="District..."
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Case #</th>
                <th className="px-4 py-3 font-medium text-gray-500">Animal</th>
                <th className="px-4 py-3 font-medium text-gray-500">Symptoms</th>
                <th className="px-4 py-3 font-medium text-gray-500">Risk Score</th>
                <th className="px-4 py-3 font-medium text-gray-500">Severity</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Location</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading cases...</td></tr>
              ) : filteredCases.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No cases found.</td></tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/cases/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.animal?.species || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.symptoms?.slice(0, 2).map(s => (
                          <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                        ))}
                        {c.symptoms && c.symptoms.length > 2 && (
                          <span className="text-xs text-gray-400">+{c.symptoms.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.riskScore}</td>
                    <td className="px-4 py-3"><RiskBadge level={c.severity} /></td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'CONFIRMED' ? 'bg-red-100 text-red-700' :
                        c.status === 'RECOVERED' ? 'bg-green-100 text-green-700' :
                        c.status === 'DECEASED' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.village}, {c.district}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.reportedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
