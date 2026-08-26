import DashboardLayout from '../components/DashboardLayout';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const data = [
  { name: 'Mon', cases: 4 }, { name: 'Tue', cases: 3 }, { name: 'Wed', cases: 7 },
  { name: 'Thu', cases: 12 }, { name: 'Fri', cases: 25 }, { name: 'Sat', cases: 35 }, { name: 'Sun', cases: 42 },
];

export default function GovDashboard() {
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clusters').then(res => setClusters(res.data)).catch(console.error);
  }, []);

  return (
    <DashboardLayout title="State Surveillance Dashboard">
      {/* KPI Cards - Strict grid, sharp corners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-gray-300 mb-8 bg-white shadow-sm">
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Active Cases</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-gray-900 tracking-tight">128</p>
            <span className="text-sm font-bold text-[#cc0000] mb-1">↑ 34%</span>
          </div>
        </div>
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-300 bg-red-50">
          <p className="text-xs font-bold text-[#cc0000] uppercase tracking-widest mb-1">Detected Clusters</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-[#cc0000]">{clusters.length}</p>
          </div>
        </div>
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">High Risk Zones</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-gray-900 tracking-tight">{clusters.filter(c => c.riskLevel === 'CRITICAL').length}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Vaccination Coverage</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-[#0066cc] tracking-tight">64%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="col-span-2 bg-white border border-gray-300 shadow-sm">
          <div className="bg-gray-100 px-5 py-3 border-b border-gray-300">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Geographic Cluster Distribution</h3>
          </div>
          <div className="h-[450px]">
            <MapContainer center={[19.0760, 72.8777]} zoom={8} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {clusters.map((c, i) => (
                <div key={i}>
                  <Marker position={[c.centerLatitude, c.centerLongitude]}>
                    <Popup><strong>Cluster {c.customId}</strong><br/>Risk: {c.riskLevel}<br/>Cases: {c.caseCount}</Popup>
                  </Marker>
                  <Circle center={[c.centerLatitude, c.centerLongitude]} radius={c.radiusKm * 1000} pathOptions={{ color: c.riskLevel === 'CRITICAL' ? '#cc0000' : '#ff9900', fillColor: c.riskLevel === 'CRITICAL' ? '#cc0000' : '#ff9900', fillOpacity: 0.2 }} />
                </div>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-8">
          {/* Chart */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="bg-gray-100 px-5 py-3 border-b border-gray-300">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Epidemiological Curve</h3>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 0, border: '1px solid #d1d5db', fontWeight: 'bold' }} />
                  <Line type="stepAfter" dataKey="cases" stroke="#cc0000" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="bg-[#cc0000] px-5 py-3 border-b border-[#990000]">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={16} /> Priority Alerts
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="p-5 bg-red-50">
                <p className="text-[10px] font-bold text-[#cc0000] uppercase tracking-widest mb-1">CRITICAL • 10 MINS AGO</p>
                <p className="text-sm font-bold text-gray-900">Potential Outbreak Cluster</p>
                <p className="text-sm text-gray-700 mt-1">12 new cases reported within 5km radius in Palghar district.</p>
                <button className="mt-4 text-xs font-bold text-[#003366] hover:underline uppercase tracking-wider">Investigate Activity →</button>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-[#b8860b] uppercase tracking-widest mb-1">WARNING • 2 HOURS AGO</p>
                <p className="text-sm font-bold text-gray-900">Lab Results Overdue</p>
                <p className="text-sm text-gray-700 mt-1">Samples from Cluster CL-891 are pending beyond SLA.</p>
                <button className="mt-4 text-xs font-bold text-[#003366] hover:underline uppercase tracking-wider">View Samples →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
