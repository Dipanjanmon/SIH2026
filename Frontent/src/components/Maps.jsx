import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { diseaseHotspots } from '../data.js'

function hotspotIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

function useInvalidateSize(mapRef) {
  useEffect(() => {
    const t = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize()
    }, 150)
    return () => clearTimeout(t)
  }, [mapRef])
}

function BaseLayers() {
  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {diseaseHotspots.map((h) => (
        <Marker key={h.name} position={[h.lat, h.lng]} icon={hotspotIcon(h.color)}>
          <Popup>
            <strong>{h.name}</strong>
            <br />
            {h.disease}
            <br />
            <span style={{ color: h.color, fontWeight: 'bold' }}>{h.risk}</span>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export function DashboardMap() {
  const mapRef = useRef(null)
  useInvalidateSize(mapRef)
  return (
    <MapContainer center={[22.5, 79.5]} zoom={5} scrollWheelZoom={false} className="h-full w-full" whenCreated={(map) => { mapRef.current = map }}>
      <BaseLayers />
    </MapContainer>
  )
}

export function DiseaseMap({ apiRef }) {
  const mapRef = useRef(null)
  useInvalidateSize(mapRef)
  return (
    <MapContainer
      center={[22.5, 79.5]}
      zoom={5}
      scrollWheelZoom={false}
      className="h-full w-full"
      whenCreated={(map) => {
        mapRef.current = map
        if (apiRef) {
          apiRef.current = {
            zoom: (dir) => map.setZoom(map.getZoom() + dir),
            reset: () => map.setView([22.5, 79.5], 5)
          }
        }
      }}
    >
      <BaseLayers />
    </MapContainer>
  )
}