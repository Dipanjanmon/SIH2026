import { useState } from 'react';
import StatsCard from '../components/StatsCard';

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@pashuraksha.gov.in', role: 'ADMIN', createdAt: '2026-01-15' },
  { id: 2, username: 'dr_sharma', email: 'sharma@vet.gov.in', role: 'VETERINARIAN', createdAt: '2026-02-20' },
  { id: 3, username: 'farmer_ram', email: 'ram@farmer.in', role: 'FARMER', createdAt: '2026-03-10' },
  { id: 4, username: 'lab_central', email: 'central@lab.gov.in', role: 'LABORATORY', createdAt: '2026-01-25' },
  { id: 5, username: 'gov_district', email: 'district@gov.in', role: 'GOVERNMENT', createdAt: '2026-02-01' },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'users' | 'diseases' | 'rules' | 'settings'>('users');

  const sections = [
    { key: 'users' as const, label: 'User Management', icon: '👥' },
    { key: 'diseases' as const, label: 'Disease Config', icon: '🦠' },
    { key: 'rules' as const, label: 'Risk Rules', icon: '⚠️' },
    { key: 'settings' as const, label: 'System Settings', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={mockUsers.length} />
        <StatsCard title="Active Roles" value={5} subtitle="FARMER, VET, GOV, LAB, ADMIN" />
        <StatsCard title="System Status" value="OK" subtitle="All services running" />
        <StatsCard title="Last Backup" value="Today" />
      </div>

      <div className="flex gap-2">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === s.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'users' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Registered Users</h3>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Username</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Created</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3 font-medium">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'GOVERNMENT' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'VETERINARIAN' ? 'bg-green-100 text-green-700' :
                        user.role === 'LABORATORY' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.createdAt}</td>
                    <td className="px-4 py-3">
                      <button className="text-sm text-indigo-600 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'diseases' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Disease Configuration</h3>
          <div className="space-y-3">
            {['Foot and Mouth Disease', 'Brucellosis', 'Rinderpest', 'Black Quarter', 'Haemorrhagic Septicaemia'].map(d => (
              <div key={d} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="font-medium text-gray-800">{d}</span>
                <div className="flex gap-2">
                  <button className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200">Edit</button>
                  <button className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100">Disable</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'rules' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Risk Assessment Rules</h3>
          <div className="space-y-3">
            {[
              { rule: 'Cases within 5km radius in 7 days', threshold: '3+ cases', enabled: true },
              { rule: 'Growth rate above threshold', threshold: '>20% daily', enabled: true },
              { rule: 'Severity escalation trigger', threshold: '2+ HIGH cases', enabled: true },
              { rule: 'Cross-district spread detection', threshold: 'Adjacent districts', enabled: false },
            ].map(r => (
              <div key={r.rule} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="font-medium text-gray-800">{r.rule}</p>
                  <p className="text-xs text-gray-500">Threshold: {r.threshold}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button className="text-sm text-indigo-600 hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">System Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">API Endpoint</p>
                <p className="text-sm text-gray-500">http://localhost:8080/api/v1</p>
              </div>
              <button className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200">Change</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-500">Send alerts via email</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">Auto-backup</p>
                <p className="text-sm text-gray-500">Daily backup at 2:00 AM</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">Data Retention</p>
                <p className="text-sm text-gray-500">Keep case data for 5 years</p>
              </div>
              <button className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200">Change</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
