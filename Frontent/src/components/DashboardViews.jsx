import { useEffect, useMemo, useRef, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { useApp } from '../App.jsx'
import { diseaseFocusSlides } from '../data.js'
import Icon from '../icons.jsx'
import { DashboardMap, DiseaseMap } from './Maps.jsx'

const FALLBACK_IMGS = {
  medteam:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%23dc2626%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2724%27 text-anchor=%27middle%27%3EMEDICAL%3C/text%3E%3C/svg%3E",
  govteam:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%232563eb%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2724%27 text-anchor=%27middle%27%3EGOVERNMENT%3C/text%3E%3C/svg%3E",
  rescueteam:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%23f59e0b%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2724%27 text-anchor=%27middle%27%3ERESCUE%3C/text%3E%3C/svg%3E"
}

const CAROUSEL_FALLBACK =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%23334155%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%2394a3b8%27 font-family=%27monospace%27 font-size=%2724%27 text-anchor=%27middle%27%3EImage%3C/text%3E%3C/svg%3E"

function imgFallback(e, src) {
  e.currentTarget.src = src
}

/* ============ PANEL SHELLS ============ */

function PageTitle({ title, sub, children }) {
  return (
    <div className="bg-white dark:bg-gov-900 p-3 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm flex items-center justify-between gap-3">
      <div>
        <h1 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h1>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

/* ============ DISEASE CAROUSEL ============ */

function DiseaseCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % diseaseFocusSlides.length), 5000)
    return () => clearInterval(t)
  }, [])

  const s = diseaseFocusSlides[idx]

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group reveal-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-gradient-to-br from-gov-800 via-gov-900 to-slate-900 text-white min-h-[210px]">
        <div className="relative col-span-1 sm:col-span-2 overflow-hidden min-h-[210px] lg:min-h-full">
          <img
            key={s.title}
            src={s.image}
            alt={s.alt}
            className="absolute inset-0 w-full h-full object-cover dis-img-ltr"
            loading="lazy"
            onError={(e) => imgFallback(e, CAROUSEL_FALLBACK)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gov-900/20 to-gov-900/95"></div>
          <div className="absolute top-3 left-3">
            <div className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center">
              <Icon name={s.icon} className={'w-5 h-5 ' + s.iconColor} />
            </div>
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
            <div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Incidence Index</div>
              <div className="text-3xl font-extrabold text-white">{s.index}</div>
            </div>
          </div>
        </div>
        <div key={'t' + idx} className="col-span-1 flex flex-col justify-center px-5 py-6 lg:py-0 dis-slide-ltr">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
            <Icon name="activity" className="w-3.5 h-3.5" /> Live Disease Focus · Auto 5s
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold leading-tight">{s.title}</h2>
          <p className="text-xs text-slate-300 mt-2">{s.desc}</p>
          <div className="mt-4 flex flex-col items-start gap-2">
            <span className={s.badgeCls + ' text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full'}>{s.badge}</span>
            <span className="bg-white/10 border border-white/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">{s.stat}</span>
            <span className="bg-white/10 border border-white/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">{s.spread}</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
        {diseaseFocusSlides.map((_, d) => (
          <span
            key={d}
            className={d === idx ? 'w-3 rounded-full bg-amber-400 transition-all' : 'w-2 h-2 rounded-full bg-white/40 transition-all'}
          ></span>
        ))}
      </div>
    </div>
  )
}

/* ============ VIEW 1: DASHBOARD ============ */

const OUTBREAK_ROWS = [
  { id: 'OB-2026-089', dist: 'Barmer, Rajasthan', dis: 'Foot & Mouth (FMD)', sp: 'Cattle / Buffalo', risk: 'CRITICAL', riskCls: 'bg-red-600 text-white border border-red-700', status: 'Quarantine Enforced', statusCls: 'text-amber-700 bg-amber-50 border border-amber-200' },
  { id: 'OB-2026-077', dist: 'Mehsana, Gujarat', dis: 'Lumpy Skin (LSD)', sp: 'Bovine', risk: 'HIGH', riskCls: 'bg-orange-500 text-white border border-orange-600', status: 'Ring Vaccination', statusCls: 'text-blue-700 bg-blue-50 border border-blue-200' },
  { id: 'OB-2026-064', dist: 'Alappuzha, Kerala', dis: 'Avian Influenza (H5N1)', sp: 'Poultry / Avian', risk: 'CRITICAL', riskCls: 'bg-red-600 text-white border border-red-700', status: 'Culling Zone Active', statusCls: 'text-purple-700 bg-purple-50 border border-purple-200' },
  { id: 'OB-2026-052', dist: 'Kamrup, Assam', dis: 'African Swine Fever', sp: 'Swine / Pigs', risk: 'HIGH', riskCls: 'bg-orange-500 text-white border border-orange-600', status: 'Movement Ban', statusCls: 'text-amber-700 bg-amber-50 border border-amber-200' },
  { id: 'OB-2026-041', dist: 'Dharwad, Karnataka', dis: 'Bluetongue Virus', sp: 'Sheep & Goat', risk: 'LOW', riskCls: 'bg-emerald-600 text-white border border-emerald-700', status: 'Symptomatic Care', statusCls: 'text-emerald-700 bg-emerald-50 border border-emerald-200' }
]

function DashboardView() {
  const { hotspotText, showGisOverlay, switchTab } = useApp()
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return OUTBREAK_ROWS
    return OUTBREAK_ROWS.filter((r) => r.dist.toLowerCase().includes(q) || r.dis.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="space-y-4 tab-enter">
      <DiseaseCarousel />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* GIS map preview */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden reveal-up">
          <div className="px-2.5 py-1 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Icon name="map-pin" className="w-3.5 h-3.5 text-blue-700" />
              <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Live GIS Disease Outbreak Map · India Command Center</h2>
            </div>
            <div className="flex items-center space-x-2 text-[9px] text-slate-600">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1"></span> Critical</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"></span> High</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></span> Moderate</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Low</span>
              <button onClick={() => switchTab('gis-map')} className="text-blue-700 hover:underline font-bold ml-1 text-[10px]">Expand →</button>
            </div>
          </div>
          <div className="relative flex-1 min-h-[220px]">
            <div className="absolute inset-0">
              <DashboardMap />
            </div>
            {showGisOverlay && (
              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-2.5 rounded text-[10px] text-slate-300 space-y-1 z-[1000]">
                <div className="font-bold text-white border-b border-slate-700 pb-1 mb-1">GIS Surveillance Overlay</div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-red-600"></span><span>Quarantine Zone (5km Radius)</span></div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span>Ring Vaccination Buffer (10km)</span></div>
                <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span>Active 1962 Mobile Vet Unit</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Compact KPI metrics */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col reveal-up">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="gauge" className="w-4 h-4 text-blue-700" />
              <span>Key Surveillance Metrics</span>
            </h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">Total Tagged Animals</span>
                <span className="p-0.5 bg-blue-50 text-blue-600 rounded"><Icon name="tag" className="w-3 h-3" /></span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900 font-mono">390.42M</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center"><Icon name="trending-up" className="w-3 h-3 mr-0.5" />+1.2%</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">Bharat Pashudhan Portal 12-digit Ear IDs</p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 border-l-4 border-l-amber-500 bg-amber-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">Active Disease Hotspots</span>
                <span className="p-0.5 bg-amber-50 text-amber-600 rounded"><Icon name="alert-triangle" className="w-3 h-3" /></span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-amber-600 font-mono">{hotspotText}</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center"><Icon name="arrow-down" className="w-3 h-3 mr-0.5" />-3</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">Barmer (FMD), Mehsana (LSD), Alappuzha</p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">FMD Vaccine Round 7</span>
                <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded"><Icon name="shield-check" className="w-3 h-3" /></span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900 font-mono">84.6%</span>
                <span className="text-[10px] font-semibold text-emerald-600">Target 90%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '84.6%' }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">Lab Diagnostic Pipeline</span>
                <span className="p-0.5 bg-purple-50 text-purple-600 rounded"><Icon name="flask-round" className="w-3 h-3" /></span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900 font-mono">1,482</span>
                <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1 rounded">244 Pending</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">ICAR-IVRI & Regional Disease Labs</p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">1962 MVU Emergency Units</span>
                <span className="p-0.5 bg-blue-50 text-blue-600 rounded"><Icon name="truck" className="w-3 h-3" /></span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900 font-mono">4,019 Active</span>
                <span className="text-[10px] font-semibold text-blue-600">96.8% Operational</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">Doorstep Field Response Teams</p>
            </div>
          </div>
        </div>

        {/* Real-time epidemic alerts */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col reveal-up">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="bell-ring" className="w-4 h-4 text-red-600" />
              <span>Real-time Epidemic Alerts</span>
            </h2>
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">3 CRITICAL</span>
          </div>
          <div className="p-3 flex-1 space-y-3 overflow-y-auto custom-scrollbar">
            <div className="p-2.5 rounded border border-red-200 bg-red-50/50 hover:bg-red-50 transition">
              <div className="flex items-center justify-between">
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">Critical Outbreak</span>
                <span className="text-[10px] text-slate-500">12 mins ago</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1">FMD Serotype O Confirmed</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Barmer District, Rajasthan · 14 cattle showing clinical lesions & high fever.</p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-red-100 text-[10px]">
                <span className="font-semibold text-slate-700">Lab ID: IVRI-2026-8941</span>
                <button onClick={() => switchTab('cases')} className="text-blue-700 hover:underline font-bold">Inspect Case →</button>
              </div>
            </div>

            <div className="p-2.5 rounded border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition">
              <div className="flex items-center justify-between">
                <span className="bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">High Risk Suspect</span>
                <span className="text-[10px] text-slate-500">45 mins ago</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1">Avian Influenza H5N1 Suspected</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Alappuzha, Kerala · Sudden mortality in commercial duck farm (120 birds).</p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-orange-100 text-[10px]">
                <span className="font-semibold text-slate-700">Samples En Route to High Security Lab</span>
                <button onClick={() => switchTab('lab')} className="text-blue-700 hover:underline font-bold">Lab Status →</button>
              </div>
            </div>

            <div className="p-2.5 rounded border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition">
              <div className="flex items-center justify-between">
                <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">Abortion Storm</span>
                <span className="text-[10px] text-slate-500">2 hours ago</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1">Brucellosis Cluster Warning</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Mehsana, Gujarat · 5 bovines reported third-trimester abortions.</p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-amber-100 text-[10px]">
                <span className="font-semibold text-slate-700">Sero-surveillance Activated</span>
                <button onClick={() => switchTab('cases')} className="text-blue-700 hover:underline font-bold">View List →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active outbreak management table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col reveal-up">
        <div className="p-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Active District Outbreak Summary & Containment Protocol</h2>
          <div className="relative">
            <Icon name="search" className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search District or Disease..."
              className="w-52 sm:w-60 border-2 border-slate-300 dark:border-gov-500 rounded-lg pl-9 pr-3 py-2 text-xs font-medium bg-white dark:bg-gov-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-2.5 font-bold">Outbreak ID</th>
                <th className="p-2.5 font-bold">District / State</th>
                <th className="p-2.5 font-bold">Target Disease</th>
                <th className="p-2.5 font-bold">Affected Species</th>
                <th className="p-2.5 font-bold">Risk Level</th>
                <th className="p-2.5 font-bold">Containment Status</th>
                <th className="p-2.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-blue-700 font-bold">{r.id}</td>
                  <td className="p-2.5">{r.dist}</td>
                  <td className="p-2.5 font-semibold text-slate-900">{r.dis}</td>
                  <td className="p-2.5">{r.sp}</td>
                  <td className="p-2.5"><span className={r.riskCls + ' text-[10px] font-bold px-2 py-0.5 rounded'}>{r.risk}</span></td>
                  <td className="p-2.5"><span className={r.statusCls + ' px-2 py-0.5 rounded text-[10px] font-semibold'}>{r.status}</span></td>
                  <td className="p-2.5 text-right"><button className="text-blue-700 hover:underline font-bold">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ============ VIEW 2: GIS MAP ============ */

function GisMapView() {
  const apiRef = useRef(null)
  return (
    <div className="space-y-4 tab-enter">
      <div className="bg-white dark:bg-gov-900 p-3 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white">National GIS Spatial Intelligence & Disease Surveillance Map</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Interactive geo-spatial mapping with quarantine buffer zones and vector movement prediction</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-slate-200 dark:bg-gov-800 dark:text-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded font-semibold">Toggle Heatmap</button>
          <button className="bg-blue-700 text-white text-xs px-2.5 py-1 rounded font-semibold">Export Map GIS Layer (.shp)</button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-lg border border-slate-800 h-[620px] relative overflow-hidden gis-grid flex">
        <div className="w-64 bg-slate-900/90 backdrop-blur border-r border-slate-800 p-3 text-white z-20 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">GIS Data Layers</h3>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-slate-700 text-blue-600 focus:ring-0" /><span>Confirmed Disease Clusters</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-slate-700 text-blue-600 focus:ring-0" /><span>5km Quarantine Zones</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-slate-700 text-blue-600 focus:ring-0" /><span>1962 MVU GPS Real-time Trackers</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="rounded border-slate-700 text-blue-600 focus:ring-0" /><span>Migratory Pastoral Routes</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="rounded border-slate-700 text-blue-600 focus:ring-0" /><span>Sero-prevalence Density</span></label>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">District Risk Threshold</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs"><span className="text-red-400 font-semibold">Red (Critical)</span><span className="font-mono">5 Outbreaks</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-orange-400 font-semibold">Orange (High)</span><span className="font-mono">2-4 Outbreaks</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-yellow-400 font-semibold">Yellow (Moderate)</span><span className="font-mono">1 Outbreak</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-emerald-400 font-semibold">Green (Clean Zone)</span><span className="font-mono">0 Outbreaks</span></div>
              </div>
            </div>
          </div>
          <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700 text-[11px] text-slate-300">
            <div className="font-bold text-white mb-1">Spatial Intelligence Note</div>
            Integrated with ISRO Bhuvan Spatial Portal for agro-climatic vector prediction.
          </div>
        </div>

        <div className="flex-1 relative">
          <DiseaseMap apiRef={apiRef} />
          <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 rounded p-1 flex flex-col space-y-1 z-20">
            <button onClick={() => apiRef.current && apiRef.current.zoom(1)} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"><Icon name="plus" className="w-4 h-4" /></button>
            <button onClick={() => apiRef.current && apiRef.current.zoom(-1)} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"><Icon name="minus" className="w-4 h-4" /></button>
            <button onClick={() => apiRef.current && apiRef.current.reset()} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"><Icon name="layers" className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ VIEW 3: CASES ============ */

const CASE_ROWS = [
  { id: 'CS-2026-9921', tag: '1009-8829-4410', sp: 'Bovine (Gir Cow)', sym: 'High Fever, Blisters on Tongue, Salivation', symCls: 'text-red-700', auth: 'Dr. A. Sharma (MVU-14)', st: 'LAB CONFIRMED', stCls: 'bg-red-100 text-red-800' },
  { id: 'CS-2026-9918', tag: '1009-4412-0092', sp: 'Caprine (Sirohi Goat)', sym: 'Nasal Discharge, Ocular Secretion, Diarrhea', symCls: 'text-amber-700', auth: 'Pashu Sakhi Sunita', st: 'SAMPLE EN ROUTE', stCls: 'bg-yellow-100 text-yellow-800' },
  { id: 'CS-2026-9905', tag: '1009-7718-3321', sp: 'Bovine (Murrah Buffalo)', sym: 'Cutaneous Nodule Lesions', symCls: 'text-slate-700', auth: 'Dr. R. Verma (Block Vet)', st: 'UNDER INVESTIGATION', stCls: 'bg-blue-100 text-blue-800' }
]

function CasesView() {
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="National Disease Case Registry & Epidemiological Investigations" sub="Comprehensive log of suspected, under-investigation, and laboratory-confirmed cases">
        <button className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-bold">+ File Clinical Incident</button>
      </PageTitle>
      <div className="bg-white dark:bg-gov-900 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-100 dark:bg-gov-800 text-slate-600 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="p-3 font-bold">Case Ref ID</th>
              <th className="p-3 font-bold">Ear Tag ID (Bharat Pashudhan)</th>
              <th className="p-3 font-bold">Species & Breed</th>
              <th className="p-3 font-bold">Reported Symptoms</th>
              <th className="p-3 font-bold">Reporting Authority</th>
              <th className="p-3 font-bold">Verification Status</th>
              <th className="p-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gov-700 font-medium">
            {CASE_ROWS.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-gov-800">
                <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{c.id}</td>
                <td className="p-3 font-mono">{c.tag}</td>
                <td className="p-3">{c.sp}</td>
                <td className={'p-3 ' + c.symCls}>{c.sym}</td>
                <td className="p-3">{c.auth}</td>
                <td className="p-3"><span className={c.stCls + ' font-bold px-2 py-0.5 rounded text-[10px]'}>{c.st}</span></td>
                <td className="p-3"><button className="text-blue-700 dark:text-blue-400 font-bold hover:underline">View File</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============ VIEW 4: FARMS ============ */

function FarmsView() {
  const stats = [
    { label: 'Registered Holdings', val: '80.4 Million', sub: 'Small & Commercial Farmers', subCls: 'text-emerald-600' },
    { label: 'Unique Tagged Animals', val: '390,421,800', sub: '12-Digit Polyurethane Tags', subCls: 'text-blue-600' },
    { label: 'Digital Pashu Aadhaar Sync', val: '99.4% ACTIVE', sub: 'Real-time API Linkage', subCls: 'text-slate-400', valCls: 'text-emerald-600' }
  ]
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="Registered Livestock Holdings & Ear-Tag Database" sub="Real-time synchronized data with National Livestock Mission & Pashu Aadhaar" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gov-900 p-4 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{s.label}</div>
            <div className={'text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 ' + (s.valCls || '')}>{s.val}</div>
            <div className={'text-[11px] mt-1 ' + s.subCls}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ VIEW 5: VACCINATION ============ */

function VaccinationView() {
  const bars = [
    { label: 'FMD Round 7 National Target (535M Doses)', pct: '84.6% Completed', color: 'bg-emerald-600', width: '84.6%' },
    { label: 'Brucellosis Bovine Calves (4-8 Months) Target', pct: '75.6% Completed', color: 'bg-blue-600', width: '75.6%' }
  ]
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="National Animal Disease Control Programme (NADCP) Vaccination Coverage" sub="Biannual FMD Mass Vaccination & Female Calf Brucellosis Immunization Progress" />
      <div className="bg-white dark:bg-gov-900 p-4 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-200">{b.label}</span>
              <span className={b.color === 'bg-emerald-600' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}>{b.pct}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-gov-800 rounded-full h-3">
              <div className={b.color + ' h-3 rounded-full'} style={{ width: b.width }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ VIEW 6: LAB ============ */

function LabView() {
  const samples = [
    { id: 'SMP-2026-8819', desc: 'Blood Serum (Bovine) · FMD NSP ELISA', st: 'TESTING IN PROGRESS', stCls: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300' },
    { id: 'SMP-2026-8814', desc: 'Skin Scab Tissue · LSD Real-Time PCR', st: 'RESULT CONFIRMED POSITIVE', stCls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' }
  ]
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="ICAR & Regional Disease Diagnostic Laboratory Portal" sub="Sample tracking, ELISA testing, PCR amplification, and genomic surveillance logs" />
      <div className="bg-white dark:bg-gov-900 rounded-lg border border-slate-200 dark:border-gov-700 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">Diagnostic Samples In Pipeline</h2>
        <div className="space-y-2">
          {samples.map((s) => (
            <div key={s.id} className="p-3 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded flex justify-between items-center text-xs gap-3 flex-wrap">
              <div className="min-w-0">
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{s.id}</span>
                <span className="ml-2 font-semibold text-slate-700 dark:text-slate-200">{s.desc}</span>
              </div>
              <span className={s.stCls + ' font-bold px-2 py-0.5 rounded text-[10px] shrink-0'}>{s.st}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============ VIEW 7: ANALYTICS ============ */

function AnalyticsView() {
  const chartData = {
    labels: ['FMD Serotype O', 'FMD Serotype A', 'FMD Asia 1', 'Brucella Calves'],
    datasets: [
      {
        label: '% Protective Immunity',
        data: [78.1, 71.7, 77.6, 75.6],
        backgroundColor: ['#16a34a', '#2563eb', '#0284c7', '#9333ea'],
        borderRadius: 4
      }
    ]
  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { max: 100, ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } }
    }
  }
  const vulns = [
    { label: 'High Border Vulnerability (Western Corridor)', val: '88/100', color: 'bg-red-600', width: '88%' },
    { label: 'Vector Proliferation Index (Monsoon Belt)', val: '64/100', color: 'bg-orange-500', width: '64%' }
  ]
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="Epidemiological Analytics & Predictive Intelligence" sub="Outbreak trend forecasting, sero-conversion rates, and seasonal vulnerability models" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gov-900 p-4 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">FMD Protective Antibody Titre Level</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Post-vaccination sero-monitoring showing &gt;75% immunity threshold achieved across key states.</p>
          <div className="h-48 relative">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gov-900 p-4 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">District Risk Vulnerability Index</h3>
          <div className="space-y-3 mt-4 text-xs">
            {vulns.map((v) => (
              <div key={v.label}>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">{v.label}</span>
                  <span className={v.color === 'bg-red-600' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}>{v.val}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-gov-800 rounded-full h-2 mt-1">
                  <div className={v.color + ' h-2 rounded-full'} style={{ width: v.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ VIEWS 8 & 9: MVU / REPORTS ============ */

function MvuView() {
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="1962 Mobile Veterinary Units (MVU) Deployment" sub="Doorstep veterinary healthcare vehicles tracking and emergency response dispatch" />
    </div>
  )
}

function ReportsView() {
  return (
    <div className="space-y-4 tab-enter">
      <PageTitle title="Official DAHD & ICAR Epidemiological Bulletins" sub="Weekly disease forecasts and monthly disease incidence notifications" />
    </div>
  )
}

/* ============ TEAM VIEWS ============ */

const TEAM_HEAD = {
  medteam: {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/500px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg',
    alt: 'Veterinary field medics attending livestock',
    banner: 'Rapid Response Medics',
    bannerCls: 'bg-red-600/90',
    iconBox: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    icon: 'stethoscope',
    title: 'Medical Response Team',
    sub: 'Veterinary rapid-deployment medics, treatment triage & field clinical care',
    chips: [
      { icon: 'syringe', label: '24h Treatment Triage' },
      { icon: 'car', label: 'Mobile Field Units' },
      { icon: 'shield-check', label: 'Bio-safety Cleared' }
    ],
    kpis: [
      { label: 'Active Medics', val: '1,240' },
      { label: 'Deployed Today', val: '186' },
      { label: 'Treatments Done', val: '12,480', valCls: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Response Time', val: '38 min' }
    ],
    table: { title: 'Field Medic Roster', note: 'Deployed MVU — Assist Response', head: ['Medic / ID', 'Specialization', 'Assigned Zone', 'Status'] }
  },
  govteam: {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Domestic_goat_01.jpg/500px-Domestic_goat_01.jpg',
    alt: 'Livestock farmers and district administration on field',
    banner: 'Command & Coordination',
    bannerCls: 'bg-blue-600/90',
    iconBox: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: 'landmark',
    title: 'Government Response Team',
    sub: 'District administration, nodal officers & policy coordination cell',
    chips: [
      { icon: 'building-2', label: 'District Control Rooms' },
      { icon: 'scale', label: 'Policy Coordination' },
      { icon: 'file-check', label: 'Quarantine Orders' }
    ],
    kpis: [
      { label: 'Nodal Officers', val: '58' },
      { label: 'Active Notifications', val: '14' },
      { label: 'Quarantine Orders', val: '9', valCls: 'text-amber-600 dark:text-amber-400' },
      { label: 'Compensation Disbursed', val: '₹4.2 Cr', valCls: 'text-emerald-600 dark:text-emerald-400' }
    ],
    table: { title: 'District Nodal Officers', note: 'Command Chain', head: ['Officer / Designation', 'District', 'Control Room', 'Status'] }
  },
  rescueteam: {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Pot-bellied_pigs_in_Lisbon_Zoo_2008.jpg/500px-Pot-bellied_pigs_in_Lisbon_Zoo_2008.jpg',
    alt: 'Livestock safe evacuation and rescue operation',
    banner: 'Doorstep Rescue & Evacuation',
    bannerCls: 'bg-amber-600/90',
    iconBox: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: 'truck',
    title: 'Animal Rescue Team',
    sub: 'Rapid rescue, safe evacuation & logistics for affected livestock',
    chips: [
      { icon: 'map-pin', label: 'Geo-localized Units' },
      { icon: 'siren', label: '22 min Dispatch' },
      { icon: 'package', label: 'Feed & Shelter Kit' }
    ],
    kpis: [
      { label: 'Rescue Units', val: '1962' },
      { label: 'Animals Rescued', val: '24,310', valCls: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Units Operational', val: '96.8%' },
      { label: 'Dispatch Latency', val: '22 min' }
    ],
    table: { title: 'Rescue Units On Ground', note: 'Doorstep Response', head: ['Unit ID', 'Region', 'Lead Rescuer', 'Status'] }
  }
}

const TEAM_TABLE_DATA = {
  medteam: [
    { c: ['Dr. A. Sharma — MVU-14', 'FMD / LSD Specialist', 'Barmer, Rajasthan'], st: 'DEPLOYED', stCls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', mono: false },
    { c: ['Dr. P. Nair — MVU-21', 'Avian Influenza', 'Alappuzha, Kerala'], st: 'DEPLOYED', stCls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', mono: false },
    { c: ['Dr. M. Khan — MVU-08', 'Brucellosis', 'Mehsana, Gujarat'], st: 'EN ROUTE', stCls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300', mono: false }
  ],
  govteam: [
    { c: ['Sh. R. Meena — DM', 'Barmer', '+91-XXXXX-1962'], st: 'ACTIVE', stCls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300', mono: false },
    { c: ['Dr. S. Patel — CVO', 'Mehsana', '+91-XXXXX-1962'], st: 'ACTIVE', stCls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300', mono: false },
    { c: ['Sh. V. Menon — Collector', 'Alappuzha', '+91-XXXXX-1962'], st: 'ON DUTY', stCls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300', mono: false }
  ],
  rescueteam: [
    { c: ['ARU-1962-04', 'Barmer, RJ', 'S. Rathore'], st: 'DEPLOYED', stCls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', mono: true },
    { c: ['ARU-1962-17', 'Mehsana, GJ', 'D. Chauhan'], st: 'DEPLOYED', stCls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', mono: true },
    { c: ['ARU-1962-23', 'Alappuzha, KL', 'R. Pillai'], st: 'RESPONDING', stCls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300', mono: true }
  ]
}

function TeamPanel({ team }) {
  const t = TEAM_HEAD[team]
  const rows = TEAM_TABLE_DATA[team]
  return (
    <div className="space-y-4 tab-enter">
      <div className="bg-white dark:bg-gov-900 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-3">
          <div className="relative min-h-[190px] lg:min-h-full">
            <img src={t.img} alt={t.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => imgFallback(e, FALLBACK_IMGS[team])} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-2 left-3"><span className={'text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider shadow ' + t.bannerCls}>{t.banner}</span></div>
          </div>
          <div className="lg:col-span-2 p-4">
            <div className="flex items-center gap-3">
              <div className={'p-2.5 rounded-xl ' + t.iconBox}>
                <Icon name={t.icon} className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.sub}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {t.chips.map((c) => (
                <div key={c.label} className="flex items-center gap-2 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-lg px-3 py-2">
                  <Icon name={c.icon} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {t.kpis.map((k) => (
          <div key={k.label} className="bg-white dark:bg-gov-900 p-3 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{k.label}</div>
            <div className={'mt-1 text-lg font-bold text-slate-900 dark:text-white ' + (k.valCls || '')}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gov-900 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{t.table.title}</h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{t.table.note}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-gov-800 text-slate-600 text-[11px] uppercase tracking-wider">
              <tr>
                {t.table.head.map((h) => (
                  <th key={h} className="p-2.5 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gov-700">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={'p-2.5 ' + (r.mono ? 'font-mono font-bold text-blue-700 dark:text-blue-400' : 'font-semibold text-slate-900 dark:text-white')}>{r.c[0]}</td>
                  {r.c.slice(1).map((c, j) => (
                    <td key={j} className="p-2.5">{c}</td>
                  ))}
                  <td className="p-2.5"><span className={r.stCls + ' text-[10px] font-bold px-2 py-0.5 rounded'}>{r.st}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ============ TAB VIEW DISPATCH ============ */

const VIEWS = {
  dashboard: DashboardView,
  'gis-map': GisMapView,
  cases: CasesView,
  farms: FarmsView,
  vaccination: VaccinationView,
  lab: LabView,
  analytics: AnalyticsView,
  mvu: MvuView,
  reports: ReportsView,
  medteam: () => <TeamPanel team="medteam" />,
  govteam: () => <TeamPanel team="govteam" />,
  rescueteam: () => <TeamPanel team="rescueteam" />
}

export default function DashboardViews() {
  const { tab } = useApp()
  const View = VIEWS[tab] || DashboardView
  return <View key={tab} />
}