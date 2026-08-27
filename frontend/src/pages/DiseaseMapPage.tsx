import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useCases } from '../hooks/useCases';
import { useRiskZones } from '../hooks/useMap';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const severityRadii: Record<string, number> = {
  LOW: 6,
  MEDIUM: 8,
  HIGH: 10,
  CRITICAL: 12,
};

export default function DiseaseMapPage() {
  const { data: cases } = useCases();
  const { data: riskZones } = useRiskZones();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Disease Surveillance Map</h2>

      <div className="flex gap-6">
        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ height: '600px' }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {riskZones?.map(zone => (
              <CircleMarker
                key={`risk-${zone.id}`}
                center={[zone.centerLat, zone.centerLng]}
                radius={zone.radiusKm / 2}
                pathOptions={{
                  color: severityColors[zone.riskLevel],
                  fillColor: severityColors[zone.riskLevel],
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <p className="font-semibold">Risk Zone: {zone.clusterId}</p>
                    <p>Risk Level: {zone.riskLevel}</p>
                    <p>Cases: {zone.caseCount}</p>
                    <p>Growth: {zone.caseGrowthPercent}%</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {cases?.map(c => (
              <CircleMarker
                key={`case-${c.id}`}
                center={[c.latitude, c.longitude]}
                radius={severityRadii[c.severity] || 6}
                pathOptions={{
                  color: severityColors[c.severity] || '#6366f1',
                  fillColor: severityColors[c.severity] || '#6366f1',
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-semibold">{c.caseNumber}</p>
                    <p className="text-sm text-gray-600">{c.village}, {c.district}</p>
                    <p className="text-sm">Severity: {c.severity}</p>
                    <p className="text-sm">Status: {c.status}</p>
                    <p className="text-sm">Risk Score: {c.riskScore}</p>
                    {c.symptoms && <p className="text-sm mt-1">Symptoms: {c.symptoms.join(', ')}</p>}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="w-80 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">Legend</h3>
            <div className="space-y-2">
              {Object.entries(severityColors).map(([level, color]) => (
                <div key={level} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-700">{level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">High Risk Areas</h3>
            <div className="space-y-3">
              {riskZones?.filter(z => z.riskLevel === 'HIGH' || z.riskLevel === 'CRITICAL').map(zone => (
                <div key={zone.id} className="rounded-lg bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-800">{zone.clusterId}</p>
                  <p className="text-xs text-red-600">{zone.caseCount} cases · {zone.caseGrowthPercent}% growth</p>
                  <p className="text-xs text-red-500">{zone.affectedVillages.join(', ')}</p>
                </div>
              ))}
              {(!riskZones || riskZones.filter(z => z.riskLevel === 'HIGH' || z.riskLevel === 'CRITICAL').length === 0) && (
                <p className="text-sm text-gray-500">No high risk areas detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
