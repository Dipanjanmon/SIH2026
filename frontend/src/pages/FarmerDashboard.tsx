import DashboardLayout from '../components/DashboardLayout';
import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function FarmerDashboard() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    api.get('/cases').then(res => setCases(res.data)).catch(console.error);
  }, []);

  return (
    <DashboardLayout title="Farm Surveillance Overview">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-300 mb-8 bg-white shadow-sm">
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Registered Livestock</p>
          <p className="text-4xl font-black text-gray-900 tracking-tight">42</p>
        </div>
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Health Reports</p>
          <p className="text-4xl font-black text-[#cc0000] tracking-tight">{cases.length}</p>
        </div>
        <div className="p-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Next Vaccination Due</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">Sep 15, 2026</p>
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Health Report Registry</h3>
          <button className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm">
            + File New Report
          </button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b-2 border-gray-800">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Case ID</th>
              <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Farm Name</th>
              <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Clinical Signs</th>
              <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Date Filed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cases.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-bold text-[#003366]">CASE-{c.caseId.substring(0, 8)}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{c.farm?.farmName}</td>
                <td className="px-6 py-4 text-gray-700">{c.symptoms?.map((s:any) => s.name).join(', ')}</td>
                <td className="px-6 py-4">
                  <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${c.riskLevel === 'CRITICAL' ? 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]' : 'bg-[#fff3cd] text-[#856404] border-[#ffeeba]'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
