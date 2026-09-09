import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Syringe, Truck, Radar, Layers, Flame, ShieldCheck, Clock, Bell, Download,
  RefreshCw, Filter, Siren, Navigation, Users, CheckCheck, Timer, Activity, AlertTriangle,
  Shield, Lock, Eye, Hourglass, Microscope, Inbox, BadgeCheck, FileText, Calendar,
  TrendingUp, TrendingDown, Target, PhoneCall, Phone, BellRing, Folder, ClipboardList,
  BarChart3, GitBranch, Stethoscope, LogIn, ChevronRight, Radio, CheckCircle2
} from 'lucide-react'

const IMG = {
  cow: 'img/farms/animal1.jpg',
  goat: 'img/dashboard/farmer.jpg',
  pig: 'img/farms/animal3.jpg',
  field: 'img/dashboard/farmer.jpg',
  animal1: 'img/farms/animal1.jpg',
  animal2: 'img/farms/animal2.jpg',
  animal3: 'img/farms/animal3.jpg',
  lab: 'img/lab/lab.jpg',
  lab2: 'img/lab/lab2.jpg',
}

/* ------------------------------------------------------------------ */
/* Shared building blocks                                             */
/* ------------------------------------------------------------------ */

function ModHero({ crumb, live, liveCls, title, accent, accentCls, desc, buttons, bg, overlay, ring, ringNote }) {
  return (
    <section className="mod-hero fade-up">
      <img className="mod-hero-bg" src={IMG[bg] || bg} alt="" />
      <div className="mod-hero-overlay" style={{ background: overlay }}></div>
      <div className="mod-hero-body px-5 md:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/55 font-bold">{crumb}</div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="live-dot"></span>
            <span className={`tag ${liveCls}`}>{live}</span>
          </div>
          <h1 className="mt-3 text-2xl md:text-4xl font-black text-white leading-tight">
            {title} <span className={accentCls}>{accent}</span>
          </h1>
          <p className="mt-2 text-white/85 text-sm max-w-xl">{desc}</p>
          {buttons && <div className="mt-4 flex flex-wrap gap-3">{buttons}</div>}
        </div>
        <div className="flex flex-col items-center gap-3">
          {ring && (
            <>
              <div className="gradient-ring shrink-0">
                <div className={`${ring.box} px-6 py-4 text-center`}>
                  <div className="text-[10px] uppercase tracking-widest text-white/70 font-bold">{ring.label}</div>
                  <div className="text-2xl font-black text-white stat-ticker">{ring.value}</div>
                  <div className={`text-[10px] ${ring.subCls}`}>{ring.sub}</div>
                </div>
              </div>
              <div className="text-[10px] text-white/55 font-semibold tracking-wide">{ringNote}</div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function KpiRow({ items }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((k, i) => (
        <div key={i} className="kpi-card p-3 fade-up">
          <div className="flex items-center justify-between">
            <span className={`tag ${k.tagCls}`}>{k.tag}</span>
            <div className={`w-7 h-7 rounded-lg ${k.iconCls} flex items-center justify-center`}>
              <k.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl font-black text-slate-800 dark:text-slate-100 mt-2 stat-ticker ${k.valueCls || ''}`}>{k.value}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{k.sub}</div>
        </div>
      ))}
    </section>
  )
}

function MiniProgress({ w, cls, mt }) {
  return (
    <div className={`mini-progress ${mt || 'mt-1'}`}>
      <i style={{ width: w }} className={cls}></i>
    </div>
  )
}

function SegBar({ segs, h }) {
  return (
    <div className={`flex ${h || 'h-3.5'} rounded-full overflow-hidden mb-4`}>
      {segs.map((s, i) => (
        <div key={i} className={s.cls} style={{ width: s.w }}></div>
      ))}
    </div>
  )
}

function LegRow({ dot, label, sub, pct, pctCls }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-2.5 h-2.5 rounded-full ${dot}`}></span>
      <div className="flex-1">
        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{label}</div>
        <div className="text-[10px] text-slate-400">{sub}</div>
      </div>
      <span className={`text-[11px] font-black ${pctCls}`}>{pct}</span>
    </div>
  )
}

function CardHead({ icon: Icon, iconCls, title, tag, tagCls, btn, live }) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${iconCls} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        {live && <span className="live-dot"></span>}
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {tag && <span className={`tag ${tagCls}`}>{tag}</span>}
      {btn && btn}
    </div>
  )
}

function Table({ head, rows, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 text-[10px] uppercase tracking-wider">
          <tr>{head.map((h, i) => <th key={i} className="px-5 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
              {row.map((cell, j) => (
                <td key={j} className={cell.tag ? 'px-5 py-3' : `px-5 py-3 ${cell.strong ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {cell.tag ? <span className={`tag ${cell.cls}`}>{cell.v}</span> : cell.v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PhotoChip({ src, tag, tagCls, title, sub, h }) {
  return (
    <div className={`photo-chip ${h || 'min-h-[180px]'} fade-up`}>
      <img src={IMG[src] || src} alt={tag} loading="lazy" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/25 to-transparent"></div>
      <div className="absolute top-3 left-3"><span className={`tag ${tagCls}`}>{tag}</span></div>
      <div className="absolute bottom-3 left-4 right-4">
        <div className="text-white font-bold text-[13px]">{title}</div>
        <div className="text-white/70 text-[10px] mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function LogItem({ icon: Icon, iconCls, title, sub }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg ${iconCls} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{title}</div>
        <div className="text-[10px] text-slate-400">{sub}</div>
      </div>
    </div>
  )
}

function Foot({ text }) {
  return <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya &#183; {text}</footer>
}

const tag = (v, cls, strong) => ({ v, cls, tag: true, strong })

/* ------------------------------------------------------------------ */
/* GIS Disease Surveillance Map                                       */
/* ------------------------------------------------------------------ */

const gisMarkers = [
  { pos: [25.05, 88.15], color: '#f43f5e', label: 'LSD-221', note: 'Severe', d: 'Malda' },
  { pos: [22.595, 88.263], color: '#f97316', label: 'FMD-087', note: 'High', d: 'Howrah' },
  { pos: [26.52, 88.72], color: '#f59e0b', label: 'PPR-112', note: 'Moderate', d: 'Jalpaiguri' },
  { pos: [23.24, 87.07], color: '#38bdf8', label: 'Anthrax-03', note: 'Watch', d: 'Bankura' },
  { pos: [24.17, 88.27], color: '#f59e0b', label: 'LSD-224', note: 'Moderate', d: 'Murshidabad' },
]

function GisMiniMap() {
  return (
    <MapContainer
      center={[25.0111, 88.1431]}
      zoom={6}
      className="h-full w-full"
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gisMarkers.map((m) => (
        <CircleMarker
          key={m.label}
          center={m.pos}
          radius={10}
          pathOptions={{ color: '#fff', weight: 1.5, fillColor: m.color, fillOpacity: 0.75 }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            <b>{m.label}</b> &#183; {m.d} &#183; {m.note}
          </Tooltip>
        </CircleMarker>
      ))}
      <Marker position={[25.0111, 88.1431]} icon={L.divIcon({ className: '', html: '<div class="relative w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-200"></div>', iconSize: [12, 12], iconAnchor: [6, 6] })}>
        <Tooltip direction="top" offset={[0, -8]} opacity={1}><b>Hub</b> &#183; Malda belt</Tooltip>
      </Marker>
    </MapContainer>
  )
}

const signalBars = [38, 58, 44, 72, 54, 80, 63, 88, 70, 94, 82, 100]

function PaneGisMap() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / GIS Disease Surveillance Map"
        live="LIVE · SPATIAL INTELLIGENCE"
        liveCls="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
        title="GIS Disease"
        accent="Surveillance Map"
        accentCls="grad-text"
        desc="Live outbreak clusters, risk heat-zones and livestock movement tracked across every district - refreshed in real time from the field grid."
        bg="animal3"
        overlay="linear-gradient(90deg, rgba(2,6,23,.94) 0%, rgba(2,6,23,.72) 45%, rgba(2,6,23,.25) 100%)"
        buttons={[
          <button key="x" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-lg shadow hover:bg-slate-100 transition"><Download className="w-3.5 h-3.5" /> Export Map</button>,
          <button key="r" className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/25 transition"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>,
        ]}
      />

      <KpiRow items={[
        { icon: Radar, tag: 'LIVE', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', value: '14', sub: 'Active Clusters' },
        { icon: Layers, tag: 'COVER', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', value: <><span className="text-lg">736</span><span className="text-sm text-slate-400">/766</span></>, sub: 'Districts Tracked' },
        { icon: Flame, tag: 'HOT', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: '38', valueCls: 'pulse-border', sub: 'Risk Heat-Zones' },
        { icon: Truck, tag: 'FLEET', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', value: '1,962', sub: 'Mobile Vet Units' },
      ]} />

      <section className="grid lg:grid-cols-3 gap-5 fade-up">
        <div className="lg:col-span-2 photo-chip min-h-[360px]">
          <div className="absolute inset-0 overflow-hidden"><GisMiniMap /></div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
          <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">
            <span className="tag bg-white/95 text-slate-800 shadow"><span className="live-dot"></span> Spatial Cluster Map · LIVE</span>
            <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-sm border border-white/15 rounded-lg p-1">
              <span className="text-[10px] font-bold text-white bg-rose-500/90 px-3 py-1.5 rounded-md">Outbreaks</span>
              <span className="text-[10px] font-bold text-white/65 px-3 py-1.5 rounded-md hover:bg-white/10">Vector</span>
              <span className="text-[10px] font-bold text-white/65 px-3 py-1.5 rounded-md hover:bg-white/10">Movement</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="text-white font-bold text-sm">North-East surge &#183; Eastern belt elevated</div>
                <div className="text-white/70 text-[11px] mt-1">736 / 766 districts reporting &#183; 38 risk heat-zones monitored</div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                <span className="flex items-center gap-1.5 text-[10px] text-white/85"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Severe <span className="font-black text-white">1</span></span>
                <span className="flex items-center gap-1.5 text-[10px] text-white/85"><span className="w-2 h-2 rounded-full bg-orange-400"></span> High <span className="font-black text-white">1</span></span>
                <span className="flex items-center gap-1.5 text-[10px] text-white/85"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Moderate <span className="font-black text-white">2</span></span>
                <span className="flex items-center gap-1.5 text-[10px] text-white/85"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Watch <span className="font-black text-white">1</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="kpi-card p-5 fade-up flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signal Health</span>
              <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">92%</span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {signalBars.map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-md bar-anim ${h >= 88 ? 'bg-blue-300' : h >= 76 && h <= 84 ? 'bg-blue-400' : 'bg-blue-500/45'}`} style={{ height: h + '%' }}></div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1.5"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span></div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Sensors Online</span><span className="text-sm font-black text-slate-800 dark:text-slate-100 stat-ticker">12,408</span></div>
            <MiniProgress w="96%" cls="bg-emerald-500" />
            <div className="text-[9px] text-slate-400 mt-1">96.1% of field nodes reporting</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Last Batch</div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-100 stat-ticker">12s ago</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Tx / min</div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-100 stat-ticker">1,284</div>
            </div>
          </div>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2"><span className="live-dot"></span><span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Overlay sync healthy &#183; 30s cadence</span></div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center"><Flame className="w-4 h-4" /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">District Risk Watch</h2>
            </div>
            <span className="tag bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">updated hourly</span>
          </div>
          <div className="space-y-3">
            {[
              { d: 'Malda', val: '92 ↑', vCls: 'text-rose-600 dark:text-rose-400', w: '92%', bar: 'bg-rose-500', sTag: 'Severe', sCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', iconCls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
              { d: 'Howrah', val: '78 ↑', vCls: 'text-orange-600 dark:text-orange-400', w: '78%', bar: 'bg-orange-500', sTag: 'High', sCls: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400', iconCls: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400' },
              { d: 'Jalpaiguri', val: '71 ↓', vCls: 'text-amber-600 dark:text-amber-400', w: '71%', bar: 'bg-amber-500', sTag: 'Moderate', sCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
              { d: 'Bankura', val: '46 ↓', vCls: 'text-sky-600 dark:text-sky-400', w: '46%', bar: 'bg-sky-400', sTag: 'Watch', sCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', iconCls: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
            ].map((r) => (
              <div key={r.d} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className={`w-9 h-9 rounded-lg ${r.iconCls} flex items-center justify-center shrink-0`}><MapPin className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{r.d}</span><span className={`text-[10px] font-black ${r.vCls}`}>{r.val}</span></div>
                  <MiniProgress w={r.w} cls={r.bar} />
                </div>
                <span className={`tag ${r.sCls}`}>{r.sTag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center"><Layers className="w-4 h-4" /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Heat-Zone Mix</h2>
            </div>
            <span className="tag bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">38 zones</span>
          </div>
          <SegBar segs={[
            { cls: 'bg-rose-500', w: '21%' }, { cls: 'bg-orange-500', w: '29%' },
            { cls: 'bg-amber-400', w: '32%' }, { cls: 'bg-sky-400', w: '18%' },
          ]} />
          <div className="grid grid-cols-2 gap-3">
            <LegRow dot="bg-rose-500" label="Severe" sub="8 zones" pct="21%" pctCls="text-rose-600 dark:text-rose-400" />
            <LegRow dot="bg-orange-500" label="High" sub="11 zones" pct="29%" pctCls="text-orange-600 dark:text-orange-400" />
            <LegRow dot="bg-amber-400" label="Moderate" sub="12 zones" pct="32%" pctCls="text-amber-600 dark:text-amber-400" />
            <LegRow dot="bg-sky-400" label="Watch" sub="7 zones" pct="18%" pctCls="text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400"><TrendingUp className="w-3 h-3 inline" /> 38 = 8 + 11 + 12 + 7 &#183; 9 zones rising vs last week</span>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <PhotoChip src="cow" tag="LSD · Malda" tagCls="bg-rose-500/90 text-white" title="Field Clinical Surveillance" sub="14 animals examined · NIVEDI feed synced" />
        <PhotoChip src="goat" tag="NADCP · Round 7" tagCls="bg-emerald-500/90 text-white" title="Ring Vaccination Camp" sub="362 doses today · Jalpaiguri belt" />
        <PhotoChip src="pig" tag="MVU-14 · 1962" tagCls="bg-blue-500/90 text-white" title="Veterinary Response Unit" sub="ETA 18 min · GPS tracked" />
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Active Outbreak Clusters</h2>
          <span className="text-[10px] font-semibold text-slate-400">view-only &#183; live feed</span>
        </div>
        <Table head={['Cluster', 'District', 'Species', 'Risk', 'Status', 'First Reported']} rows={[
          [tag('LSD-221', 'text-slate-700 dark:text-slate-200'), { v: 'Malda' }, { v: 'Bovine' }, tag('Severe', 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'), tag(<><span className="live-dot"></span> Active</>, 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'), { v: '04 May' }],
          [tag('FMD-087', 'text-slate-700 dark:text-slate-200'), { v: 'Howrah' }, { v: 'Bovine / Buffalo' }, tag('Moderate', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), tag(<><span className="live-dot"></span> Active</>, 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), { v: '05 May' }],
          [tag('PPR-112', 'text-slate-700 dark:text-slate-200'), { v: 'Jalpaiguri' }, { v: 'Sheep / Goat' }, tag('High', 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'), tag(<><span className="live-dot"></span> Active</>, 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'), { v: '05 May' }],
          [tag('Anthrax-03', 'text-slate-700 dark:text-slate-200'), { v: 'Bankura' }, { v: 'Ruminant' }, tag('Watch', 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'), { v: 'Monitoring' }, { v: '06 May' }],
          [tag('LSD-224', 'text-slate-700 dark:text-slate-200'), { v: 'Murshidabad' }, { v: 'Bovine' }, tag('Moderate', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), tag(<><span className="live-dot"></span> Active</>, 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), { v: '07 May' }],
        ]} />
      </section>

      <Foot text="Spatial Outbreak Intelligence · National Livestock Surveillance Network" />
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* NADCP Vaccination Drive                                            */
/* ------------------------------------------------------------------ */

function PaneNadcp() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / NADCP Vaccination Drive"
        live="LIVE · VACCINATION DRIVE"
        liveCls="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
        title="NADCP"
        accent="Vaccination Drive"
        accentCls="grad-text"
        desc="National Animal Disease Control Programme - round-wise FMD & Brucellosis coverage, dose logs and reminders down to district and farm level."
        bg="animal1"
        overlay="linear-gradient(90deg, rgba(6,78,59,.94) 0%, rgba(6,78,59,.72) 48%, rgba(6,78,59,.25) 100%)"
        buttons={[
          <span key="vo" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
          <button key="r" className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/25 transition"><Bell className="w-3.5 h-3.5" /> Reminders</button>,
        ]}
        ring={{ box: 'bg-emerald-700', label: 'R4 Coverage', value: <>84.6<span className="text-base">%</span></>, sub: 'FMD + Brucellosis', subCls: 'text-emerald-200' }}
        ringNote="Data updated just now"
      />

      <KpiRow items={[
        { icon: Syringe, tag: 'DONE', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', value: '1.24Cr', sub: 'Doses Administered' },
        { icon: Layers, tag: 'ROUND', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', value: '4', sub: 'Active Rounds' },
        { icon: ShieldCheck, tag: 'COVER', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: '646', sub: 'Districts 80%+' },
        { icon: Clock, tag: 'DUE', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', value: '18K', valueCls: 'pulse-border', sub: 'Booster Due' },
      ]} />

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><BarChart3 className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Round-wise Coverage</h2>
          </div>
          <div className="flex items-center gap-2"><span className="live-dot"></span><span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">R4 LIVE</span></div>
        </div>
        <div className="p-5 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-end gap-3 h-44">
              {[
                { v: '62%', h: '62%', bar: 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500', l: 'R1 · Baseline', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
                { v: '74%', h: '74%', bar: 'bg-gradient-to-t from-sky-600 to-sky-400', l: 'R2 · South', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
                { v: '81%', h: '81%', bar: 'bg-gradient-to-t from-blue-600 to-blue-400', l: 'R3 · National', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
                { v: '84.6%', h: '86%', bar: 'bg-gradient-to-t from-emerald-600 to-teal-400 bar-anim shimmer', l: 'R4 · Live', lCls: 'font-bold text-emerald-600 dark:text-emerald-400', tCls: 'text-emerald-600 dark:text-emerald-400', last: true },
              ].map((b, i) => (
                <div key={i} className="flex-1 h-full flex flex-col items-center gap-1.5">
                  <div className={`text-[10px] font-bold ${b.tCls}`}>{b.v}</div>
                  <div className="flex w-full flex-1 min-h-0 items-end">
                    <div className={`w-full rounded-t-lg ${b.bar}`} style={{ height: b.h }}></div>
                  </div>
                  <span className={`text-[9px] ${b.lCls}`}>{b.l}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400"><Target className="w-3 h-3" /> National target: 90% coverage by R6</div>
          </div>
          <div className="space-y-4">
            {[
              { l: 'FMD Coverage', v: '88%', w: '88%', c: 'bg-emerald-500' },
              { l: 'Brucellosis', v: '72%', w: '72%', c: 'bg-sky-500' },
              { l: 'Booster On Time', v: '64%', w: '64%', c: 'bg-amber-500' },
              { l: 'Cold-chain Capacity', v: '91%', w: '91%', c: 'bg-violet-500' },
            ].map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-600 dark:text-slate-300">{p.l}</span><span className="text-slate-500 dark:text-slate-400">{p.v}</span></div>
                <MiniProgress w={p.w} cls={p.c} mt="mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Live Dose Log</h2></div>
          <div className="space-y-3">
            <LogItem icon={Syringe} iconCls="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" title="1,240 doses logged · Malda" sub="FMD booster · 5 min ago" />
            <LogItem icon={Syringe} iconCls="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" title="860 doses logged · Nadia" sub="Brucellosis · 12 min ago" />
            <LogItem icon={Bell} iconCls="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" title="Booster reminder sent" sub="312 farms · Bankura · 20 min ago" />
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Coverage by Region</h2>
          </div>
          <div className="space-y-3">
            {[
              { l: 'Eastern', v: '91%', w: '91%', c: 'bg-emerald-500' },
              { l: 'North', v: '82%', w: '82%', c: 'bg-blue-500' },
              { l: 'South', v: '78%', w: '78%', c: 'bg-sky-500' },
              { l: 'West', v: '87%', w: '87%', c: 'bg-teal-500' },
            ].map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-600 dark:text-slate-300">{p.l}</span><span className="text-slate-500 dark:text-slate-400">{p.v}</span></div>
                <MiniProgress w={p.w} cls={p.c} />
              </div>
            ))}
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-4">Upcoming Reminders</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">R5 Round · FMD</div>
              <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">in 7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">R4 Booster due</div>
              <span className="tag bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">18K farms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Cold-chain audit</div>
              <span className="tag bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">tomorrow</span>
            </div>
          </div>
        </div>
      </section>

      <Foot text="National Animal Disease Control Programme" />
      <section className="grid md:grid-cols-3 gap-4">
        <PhotoChip src="cow" tag="NADCP · Round 7" tagCls="bg-emerald-500/90 text-white" title="Mass Vaccination Drive" sub="362 doses today · FMD round on target" />
        <PhotoChip src="goat" tag="NADCP · Round 6" tagCls="bg-blue-500/90 text-white" title="Ring Coverage Check" sub="Brucellosis calves · 75.6% synced" />
        <PhotoChip src="pig" tag="MVU-14" tagCls="bg-violet-500/90 text-white" title="Cold-Chain Dispatch" sub="Vials geo-tracked · 2C-8C ok" />
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Outbreak Alert Center                                              */
/* ------------------------------------------------------------------ */

function PaneOutbreak() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / Outbreak Alert Center"
        live="LIVE · OUTBREAK ALERTS"
        liveCls="bg-red-500/25 text-red-200 border border-red-400/50"
        title="Outbreak"
        accent="Alert Center"
        accentCls="text-amber-300"
        desc="Verified disease signals triaged by severity - each alert pushes straight to district command and field response teams in minutes."
        bg="animal2"
        overlay="linear-gradient(90deg, rgba(127,29,29,.94) 0%, rgba(127,29,29,.7) 45%, rgba(127,29,29,.3) 100%)"
        buttons={[
          <button key="c" className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-500 transition"><Siren className="w-3.5 h-3.5" /> View Critical</button>,
          <button key="f" className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/25 transition"><Filter className="w-3.5 h-3.5" /> Filter</button>,
        ]}
        ring={{ box: 'bg-red-900', label: 'Active Alerts', value: '14', sub: '5 critical now', subCls: 'text-red-200' }}
        ringNote="Triaged in the last 15 min"
      />

      <KpiRow items={[
        { icon: AlertTriangle, tag: 'CRIT', tagCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', iconCls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', value: '5', valueCls: 'pulse-border', sub: 'Critical Alerts' },
        { icon: ShieldAlert, tag: 'MOD', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: '6', sub: 'Moderate Alerts' },
        { icon: Eye, tag: 'WATCH', tagCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', iconCls: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400', value: '3', sub: 'Under Watch' },
        { icon: Radar, tag: 'RESP', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', value: <><span className="text-2xl">&lt;2</span><span className="text-base">h</span></>, sub: 'Avg Response' },
      ]} />

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center"><Activity className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Alert Severity Mix</h2>
          </div>
          <span className="tag bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">14 live alerts</span>
        </div>
        <div className="p-5">
          <SegBar segs={[
            { cls: 'bg-rose-500', w: '36%' }, { cls: 'bg-amber-500', w: '21%' },
            { cls: 'bg-sky-400', w: '27%' }, { cls: 'bg-slate-300 dark:bg-slate-600', w: '16%' },
          ]} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <LegRow dot="bg-rose-500" label="Critical" sub="5 alerts" pct="36%" pctCls="text-rose-600 dark:text-rose-400" />
            <LegRow dot="bg-amber-500" label="High" sub="3 alerts" pct="21%" pctCls="text-amber-600 dark:text-amber-400" />
            <LegRow dot="bg-sky-400" label="Moderate" sub="6 alerts" pct="27%" pctCls="text-sky-600 dark:text-sky-400" />
            <LegRow dot="bg-slate-300 dark:bg-slate-600" label="Watch" sub="3 alerts" pct="16%" pctCls="text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="kpi-card p-4 border-l-4 border-rose-500 fade-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2"><span className="live-dot"></span><h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">LSD-221 &#183; Malda</h3></div>
            <span className="tag bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">SEVERE</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Lumpy Skin &#183; 1,240 cattle exposed &#183; ring vaccination live</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"><Syringe className="w-3 h-3" /> Response dispatched</div>
        </div>
        <div className="kpi-card p-4 border-l-4 border-rose-500 fade-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2"><span className="live-dot"></span><h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">FMD-087 &#183; Howrah</h3></div>
            <span className="tag bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">SEVERE</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Foot &amp; Mouth &#183; quarantine zone active &#183; 3 farms</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"><Lock className="w-3 h-3" /> Zone enforced</div>
        </div>
        <div className="kpi-card p-4 border-l-4 border-amber-500 fade-up">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">PPR-112 &#183; Jalpaiguri</h3>
            <span className="tag bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">HIGH</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Peste des Petits Ruminants &#183; 620 sheep &#183; movement restricted</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"><Shield className="w-3 h-3" /> Movement restricted</div>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Live Outbreak Queue</h2></div>
          <span className="text-[10px] font-semibold text-slate-400">view-only</span>
        </div>
        <Table head={['Alert', 'Disease', 'District', 'Severity', 'Status']} rows={[
          [tag('LSD-221', 'text-slate-700 dark:text-slate-200'), { v: 'Lumpy Skin' }, { v: 'Malda' }, tag('Severe', 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'), tag(<><span className="live-dot"></span> Responding</>, 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400')],
          [tag('FMD-087', 'text-slate-700 dark:text-slate-200'), { v: 'Foot & Mouth' }, { v: 'Howrah' }, tag('Severe', 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'), tag(<><span className="live-dot"></span> Dispatch</>, 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400')],
          [tag('PPR-112', 'text-slate-700 dark:text-slate-200'), { v: 'PPR' }, { v: 'Jalpaiguri' }, tag('High', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), { v: 'Verifying' }],
          [tag('Anthrax-03', 'text-slate-700 dark:text-slate-200'), { v: 'Anthrax' }, { v: 'Bankura' }, tag('Watch', 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'), { v: 'Monitoring' }],
        ]} />
      </section>

      <Foot text="Outbreak Alert Center" />
      <section className="grid md:grid-cols-3 gap-4">
        <PhotoChip src="cow" tag="LSD · Malda" tagCls="bg-rose-500/90 text-white" title="Containment in Field" sub="14 animals examined · NIVEDI feed" />
        <PhotoChip src="goat" tag="Quarantine · Howrah" tagCls="bg-amber-500/90 text-white" title="Buffer Zone Patrols" sub="5km radius enforced · docs verified" />
        <PhotoChip src="pig" tag="Vector · Jalpaiguri" tagCls="bg-sky-500/90 text-white" title="Fly Control Grid" sub="8 traps per sq km · weekly larvicide" />
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* MVU & RRT Rapid Dispatch                                           */
/* ------------------------------------------------------------------ */

function PaneMvu() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / MVU & RRT Rapid Dispatch"
        live="LIVE · FIELD DISPATCH"
        liveCls="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
        title="MVU & RRT"
        accent="Rapid Dispatch"
        accentCls="text-emerald-300"
        desc="1,962 Mobile Veterinary Units and Rapid Response Teams - live-tracked to the farmer's doorstep with ETA and case status."
        bg="animal3"
        overlay="linear-gradient(90deg, rgba(15,23,42,.94) 0%, rgba(15,23,42,.7) 50%, rgba(15,23,42,.25) 100%)"
        buttons={[
          <button key="t" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-lg shadow hover:bg-slate-100 transition"><Navigation className="w-3.5 h-3.5" /> Track Live</button>,
          <span key="vo" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
        ]}
        ring={{ box: 'bg-slate-800', label: 'Fleet Live', value: '1,962', sub: '312 on call now', subCls: 'text-emerald-300' }}
        ringNote="GPS synced just now"
      />

      <KpiRow items={[
        { icon: Truck, tag: 'DISPATCH', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', value: '312', sub: 'Units On Call' },
        { icon: MapPin, tag: 'ON ROUTE', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', value: '1,540', sub: 'On Route Today' },
        { icon: Clock, tag: 'ETA', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: <>48<span className="text-base">min</span></>, sub: 'Avg Response' },
        { icon: CheckCircle2, tag: 'RESOLVED', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', value: '4.2K', sub: 'Cases Today' },
      ]} />

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><Radio className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Live Unit Tracking</h2>
          </div>
          <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"><Radio className="w-3 h-3" /> On air</span>
        </div>
        <div className="p-5 space-y-3">
          {[
            { id: 'MVU-2214', route: 'En route · Malda → Bhutni', w: '65%', bar: 'bg-gradient-to-r from-blue-600 to-blue-400', eta: '12 min ETA', etaCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', caseT: 'LSD-221 case', iconCls: 'from-blue-600 to-blue-400' },
            { id: 'RRT-09', route: 'On site · Howrah', w: '100%', bar: 'bg-emerald-500', eta: <><span className="live-dot"></span> On site</>, etaCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', caseT: 'FMD-087', iconCls: 'from-emerald-600 to-emerald-400' },
            { id: 'MVU-1108', route: 'En route · Jalpaiguri', w: '40%', bar: 'bg-gradient-to-r from-amber-600 to-amber-400', eta: '28 min ETA', etaCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', caseT: 'PPR-112', iconCls: 'from-amber-600 to-amber-400' },
          ].map((u) => (
            <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.iconCls} text-white flex items-center justify-center shrink-0`}><Truck className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{u.id}</div>
                <div className="text-[10px] text-slate-400">{u.route}</div>
                <div className="mini-progress mt-2"><i style={{ width: u.w }} className={u.bar}></i></div>
              </div>
              <div className="flex sm:flex-col sm:items-end gap-2 sm:gap-1">
                <span className={`tag ${u.etaCls}`}>{u.eta}</span>
                <span className="text-[10px] text-slate-400">{u.caseT}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 flex items-center justify-center"><Users className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Team Composition</h2>
          </div>
          <div className="space-y-3">
            {[
              { l: 'Veterinarians', v: '1,900', w: '96%', c: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
              { l: 'Para-vets', v: '3,240', w: '88%', c: 'bg-blue-500' },
              { l: 'RRT members', v: '860', w: '72%', c: 'bg-amber-500' },
            ].map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-600 dark:text-slate-300">{p.l}</span><span className="text-slate-500 dark:text-slate-400">{p.v}</span></div>
                <MiniProgress w={p.w} cls={p.c} />
              </div>
            ))}
          </div>
          <div className="mt-5 photo-chip min-h-[140px]">
            <img src={IMG.field} alt="Field MVU visit" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3"><div className="text-white text-[11px] font-bold">MVU reaching remote farms</div></div>
          </div>
        </div>
        <div className="lg:col-span-3 kpi-card overflow-hidden fade-up">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Today&apos;s Dispatches</h2>
            <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">1,540 on route</span>
          </div>
          <Table head={['Unit', 'Task', 'District', 'ETA', 'Status']} rows={[
            [tag('MVU-2214', 'text-slate-700 dark:text-slate-200'), { v: 'LSD case' }, { v: 'Malda' }, { v: '12 min' }, tag(<><span className="live-dot"></span> En route</>, 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400')],
            [tag('RRT-09', 'text-slate-700 dark:text-slate-200'), { v: 'FMD case' }, { v: 'Howrah' }, { v: 'On site' }, tag('On site', 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400')],
            [tag('MVU-1108', 'text-slate-700 dark:text-slate-200'), { v: 'PPR case' }, { v: 'Jalpaiguri' }, { v: '28 min' }, tag('En route', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400')],
          ]} />
        </div>
      </section>

      <Foot text="Mobile Veterinary Unit Dispatch" />
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Lab & Diagnostics                                                  */
/* ------------------------------------------------------------------ */

function PaneVetLab() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / Lab & Diagnostics"
        live="LIVE · DIAGNOSTICS"
        liveCls="bg-cyan-500/20 text-cyan-200 border border-cyan-400/40"
        title="Lab &"
        accent="Diagnostics"
        accentCls="text-cyan-300"
        desc="Sample submission, test status and verified reports from veterinary diagnostic labs - linked straight into disease alerts."
        bg="lab"
        overlay="linear-gradient(90deg, rgba(21,94,117,.95) 0%, rgba(21,94,117,.7) 50%, rgba(21,94,117,.27) 100%)"
        buttons={[
          <span key="vo" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
          <button key="r" className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/25 transition"><FileText className="w-3.5 h-3.5" /> Reports</button>,
        ]}
        ring={{ box: 'bg-cyan-900', label: 'Avg TAT', value: <>14<span className="text-base">h</span></>, sub: 'Test turnaround', subCls: 'text-cyan-200' }}
        ringNote="140 labs reporting live"
      />

      <KpiRow items={[
        { icon: Hourglass, tag: 'IN QUEUE', tagCls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', iconCls: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400', value: '1,248', sub: 'Samples in Queue' },
        { icon: Microscope, tag: 'TESTING', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', value: '386', sub: 'Testing Now' },
        { icon: BadgeCheck, tag: 'VERIFIED', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', value: '9,214', sub: 'Verified Reports' },
        { icon: AlertTriangle, tag: 'POSITIVE', tagCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', iconCls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', value: '412', valueCls: 'pulse-border', sub: 'Positive Cases' },
      ]} />

      <section className="kpi-card overflow-hidden fade-up">
        <CardHead icon={GitBranch} iconCls="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400" title="Sample Pipeline" tag={<><Clock className="w-3 h-3" /> 14h avg TAT</>} tagCls="bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800">
          {[
            { icon: Inbox, cls: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400', v: '1,248', l: 'Received' },
            { icon: FlaskConical, cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', v: '386', l: 'In Testing' },
            { icon: BadgeCheck, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', v: '9,214', l: 'Verified' },
            { icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', v: '412', l: 'Positive Flagged', pulse: true },
          ].map((c, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-5">
              <div className={`w-9 h-9 rounded-lg ${c.cls} flex items-center justify-center`}><c.icon className="w-4 h-4" /></div>
              <div className={`text-xl font-black text-slate-800 dark:text-slate-100 mt-3 stat-ticker ${c.pulse ? 'pulse-border' : ''}`}>{c.v}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mt-1">{c.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 photo-chip min-h-[240px] fade-up">
          <img src={IMG.lab2} alt="Lab technicians" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute top-4 left-4"><span className="tag bg-white/90 text-slate-800 shadow">Diagnostic Network</span></div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-white font-bold text-sm">140 labs reporting live</div>
            <div className="text-white/70 text-[11px] mt-1">ISO-certified workflows &#183; verified reports</div>
          </div>
        </div>
        <div className="lg:col-span-3 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Test Results by Type</h2>
            <span className="tag bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400">This week</span>
          </div>
          <div className="space-y-4">
            {[
              { l: 'FMD · ELISA', v: '1,804', w: '78%', c: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
              { l: 'LSD · PCR', v: '1,406', w: '62%', c: 'bg-blue-500' },
              { l: 'PPR · RT-PCR', v: '964', w: '48%', c: 'bg-violet-500' },
              { l: 'Anthrax · Culture', v: '520', w: '30%', c: 'bg-rose-500' },
            ].map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-600 dark:text-slate-300">{p.l}</span><span className="text-slate-500 dark:text-slate-400">{p.v}</span></div>
                <MiniProgress w={p.w} cls={p.c} mt="mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Latest Verified Reports</h2>
          <button className="text-[11px] font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-1.5 rounded-lg hover:opacity-90 transition inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export</button>
        </div>
        <Table head={['Sample', 'Test', 'Lab', 'Result', 'Reported']} rows={[
          [tag('S-88421', 'text-slate-700 dark:text-slate-200'), { v: 'FMD ELISA' }, { v: 'Cooch Behar' }, tag('Positive', 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'), { v: '2 min ago' }],
          [tag('S-88419', 'text-slate-700 dark:text-slate-200'), { v: 'LSD PCR' }, { v: 'Malda' }, tag('Negative', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'), { v: '14 min ago' }],
          [tag('S-88417', 'text-slate-700 dark:text-slate-200'), { v: 'PPR RT-PCR' }, { v: 'Jalpaiguri' }, tag('Suspected', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), { v: '1 hr ago' }],
        ]} />
      </section>

      <Foot text="Laboratory & Diagnostics" />
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Reports & Analytics                                                */
/* ------------------------------------------------------------------ */

function PaneReports() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / Reports & Analytics"
        live="LIVE · ANALYTICS"
        liveCls="bg-indigo-500/20 text-indigo-200 border border-indigo-400/40"
        title="Reports &"
        accent="Analytics"
        accentCls="text-indigo-300"
        desc="District dashboards, coverage analytics, outbreak trends and executive summaries that power faster government decisions."
        bg="animal1"
        overlay="linear-gradient(90deg, rgba(23,37,84,.95) 0%, rgba(23,37,84,.72) 50%, rgba(23,37,84,.28) 100%)"
        buttons={[
          <button key="x" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-lg shadow hover:bg-slate-100 transition"><Download className="w-3.5 h-3.5" /> Executive Summary</button>,
          <button key="d" className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/25 transition"><Calendar className="w-3.5 h-3.5" /> Date Range</button>,
        ]}
        ring={{ box: 'bg-indigo-900', label: 'Report Labs', value: '140', sub: 'producing daily', subCls: 'text-indigo-200' }}
        ringNote="Auto-generated every 6 hours"
      />

      <KpiRow items={[
        { icon: BarChart3, tag: 'TREND', tagCls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400', iconCls: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400', value: <>-12<span className="text-base text-emerald-500">%</span></>, sub: 'Outbreak Trend' },
        { icon: ShieldCheck, tag: 'COVER', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', value: <>84.6<span className="text-base">%</span></>, sub: 'Vaccination Cover' },
        { icon: Activity, tag: 'RESP', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', value: <>96<span className="text-base">%</span></>, sub: 'Response Rate' },
        { icon: TrendingUp, tag: 'LIVE QTR', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: 'Q3', sub: 'Reporting Quarter' },
      ]} />

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center"><TrendingDown className="w-4 h-4" /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Outbreak Trend (6 rounds)</h2>
            </div>
            <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">declining</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {[
              { v: '90', h: '90%', bar: 'bg-gradient-to-t from-indigo-700 to-indigo-400', l: 'R1', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '76', h: '76%', bar: 'bg-gradient-to-t from-indigo-700 to-indigo-400', l: 'R2', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '64', h: '64%', bar: 'bg-gradient-to-t from-indigo-700 to-indigo-400', l: 'R3', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '55', h: '55%', bar: 'bg-gradient-to-t from-indigo-700 to-indigo-400', l: 'R4', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '48', h: '48%', bar: 'bg-gradient-to-t from-indigo-700 to-indigo-400', l: 'R5', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '38', h: '38%', bar: 'bg-gradient-to-t from-emerald-600 to-emerald-400 bar-anim shimmer', l: 'R6 · Best', lCls: 'font-bold text-emerald-600 dark:text-emerald-400', tCls: 'text-emerald-600 dark:text-emerald-400', last: true },
            ].map((b, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center gap-1.5">
                <div className={`text-[10px] font-bold ${b.tCls}`}>{b.v}</div>
                <div className="flex w-full flex-1 min-h-0 items-end">
                  <div className={`w-full rounded-t-lg ${b.bar}`} style={{ height: b.h }}></div>
                </div>
                <span className={`text-[9px] ${b.lCls}`}>{b.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400"><TrendingDown className="w-3 h-3" /> -58% outbreaks since R1 &#183; 6-round steady decline</div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><Target className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Coverage vs Target</h2>
          </div>
          <div className="space-y-3">
            {[
              { l: 'East', v: '91 / 95', w: '91%', c: 'bg-emerald-500' },
              { l: 'West', v: '87 / 95', w: '87%', c: 'bg-teal-500' },
              { l: 'North', v: '82 / 95', w: '82%', c: 'bg-blue-500' },
              { l: 'South', v: '78 / 95', w: '78%', c: 'bg-sky-500' },
            ].map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-600 dark:text-slate-300">{p.l}</span><span className="text-slate-500 dark:text-slate-400">{p.v}</span></div>
                <MiniProgress w={p.w} cls={p.c} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Blended coverage</span>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">84.6%</span>
          </div>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Executive KPI Summary</h2>
          <button className="text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-1.5 rounded-lg hover:opacity-90 transition inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> PDF</button>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800">
          {[
            { l: 'Districts Covered', v: '736 / 766', w: '96%', c: 'bg-emerald-500', n: '96% coverage' },
            { l: 'Doses This Quarter', v: '3.6 Cr', w: '72%', c: 'bg-blue-500', n: '72% of target' },
            { l: 'MVU Dispatch', v: '1,962', w: '88%', c: 'bg-violet-500', n: '88% utilization' },
          ].map((c) => (
            <div key={c.l} className="bg-white dark:bg-slate-900 p-5">
              <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{c.l}</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{c.v}</div>
              <MiniProgress w={c.w} cls={c.c} />
              <div className="text-[10px] text-slate-400 mt-1.5">{c.n}</div>
            </div>
          ))}
        </div>
      </section>

      <Foot text="Reports & Analytics" />
      <section className="grid md:grid-cols-3 gap-4">
        <PhotoChip src="cow" tag="Bulletin · BLD-38" tagCls="bg-blue-500/90 text-white" title="Weekly Situation Desk" sub="42 bulletins this quarter · 30-day outlook" />
        <PhotoChip src="goat" tag="Sero-Survey · R7" tagCls="bg-emerald-500/90 text-white" title="Antibody Sampling" sub="75.7% avg coverage · titre protocol" />
        <PhotoChip src="pig" tag="Field Feed · NEDI" tagCls="bg-violet-500/90 text-white" title="District Feeds Ingested" sub="128K subscribers · auto-digest 04:00" />
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Farmer Support Hub                                                 */
/* ------------------------------------------------------------------ */

function PaneFarmers() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / Farmer Support Hub"
        live="FARMER SUPPORT HUB"
        liveCls="bg-emerald-500/25 text-emerald-100 border border-emerald-400/50"
        title="For"
        accent="Farmers"
        accentCls="text-emerald-300"
        desc="Report sick animals, request an MVU visit and get vaccination reminders - all in your language, straight from your phone."
        bg="field"
        overlay="linear-gradient(90deg, rgba(20,83,45,.92) 0%, rgba(20,83,45,.65) 50%, rgba(20,83,45,.22) 100%)"
        buttons={[
          <button key="h" className="inline-flex items-center gap-1.5 text-xs font-bold text-green-900 bg-white px-4 py-2 rounded-lg shadow hover:bg-slate-100 transition"><PhoneCall className="w-3.5 h-3.5" /> Helpline 1962</button>,
          <span key="vo" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
        ]}
        ring={{ box: 'bg-green-800', label: 'Toll Free', value: '1962', sub: 'Farmer Helpline', subCls: 'text-emerald-200' }}
        ringNote="Available 24/7 in your language"
      />

      <section className="grid md:grid-cols-3 gap-4">
        <div className="kpi-card p-5 fade-up text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><PhoneCall className="w-6 h-6" /></div>
          <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-3">Helpline 1962</div>
          <p className="text-[11px] text-slate-400 mt-1">Report cases &amp; get advice in your language.</p>
          <button className="mt-3 text-[11px] font-bold text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500"><Phone className="w-3 h-3 inline" /> Call Now</button>
        </div>
        <div className="kpi-card p-5 fade-up text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center"><Truck className="w-6 h-6" /></div>
          <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-3">Request MVU Visit</div>
          <p className="text-[11px] text-slate-400 mt-1">A mobile vet unit reaches your farm, live-tracked.</p>
          <span className="mt-3 inline-block text-[10px] font-semibold text-slate-400">view-only</span>
        </div>
        <div className="kpi-card p-5 fade-up text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center"><BellRing className="w-6 h-6" /></div>
          <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-3">Vaccination Reminders</div>
          <p className="text-[11px] text-slate-400 mt-1">Get SMS/WhatsApp alerts when your herd booster is due.</p>
          <span className="mt-3 inline-block text-[10px] font-semibold text-slate-400">view-only</span>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="p-5 relative">
            <div className="absolute top-4 left-5 w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">1</div>
            <div className="pl-9">
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Call Helpline 1962</div>
              <p className="text-[11px] text-slate-400 mt-1">Report the sick animal in your language - free, toll free.</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"><PhoneCall className="w-3 h-3" /> 1962</div>
            </div>
          </div>
          <div className="p-5 relative">
            <div className="absolute top-4 left-5 w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">2</div>
            <div className="pl-9">
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">MVU Reaches Your Farm</div>
              <p className="text-[11px] text-slate-400 mt-1">A mobile vet unit is dispatched and live-tracked to your doorstep.</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400"><Navigation className="w-3 h-3" /> Live tracking</div>
            </div>
          </div>
          <div className="p-5 relative">
            <div className="absolute top-4 left-5 w-6 h-6 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center">3</div>
            <div className="pl-9">
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Get Vaccination Alerts</div>
              <p className="text-[11px] text-slate-400 mt-1">SMS/WhatsApp reminders when your herd&apos;s booster is due.</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"><BellRing className="w-3 h-3" /> Reminder on</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="photo-chip min-h-[200px] fade-up">
          <img src={IMG.animal2} alt="Healthy cattle herd" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
          <div className="absolute top-4 left-4"><span className="tag bg-white/90 text-slate-800 shadow">Free Vaccination</span></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-white font-bold text-sm">Keep your herd healthy - vaccinations are free under NADCP.</div>
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Nearby Alerts for Your District</h2></div>
          <div className="space-y-3">
            {[
              { icon: AlertTriangle, iconCls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', t: 'LSD alert · Malda', s: 'Vaccinate calves. Avoid animal movement.', tagV: '2 km', tagCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
              { icon: Syringe, iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', t: 'Free vaccination camp', s: 'This Sunday · Community Centre', tagV: 'Free', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
              { icon: Truck, iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', t: 'MVU visit confirmed', s: 'Tomorrow 10:00 · Your farm', tagV: 'Confirmed', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' },
            ].map((a) => (
              <div key={a.t} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className={`w-9 h-9 rounded-lg ${a.iconCls} flex items-center justify-center`}><a.icon className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{a.t}</div>
                  <div className="text-[10px] text-slate-400">{a.s}</div>
                </div>
                <span className={`tag ${a.tagCls}`}>{a.tagV}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="kpi-card p-5 fade-up">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center"><Stethoscope className="w-4 h-4" /></div>
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Common Diseases - What To Watch</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { d: 'FMD', c: 'text-rose-600', tagV: 'Call 1962', tagCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', s: 'Blistering, drooling, hoof pain. Isolate & report.' },
            { d: 'LSD', c: 'text-emerald-600', tagV: 'Vaccinate', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', s: 'Skin nodules, fever, milk drop. Vaccinate calves.' },
            { d: 'PPR', c: 'text-blue-600', tagV: 'Isolate', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', s: 'Fever, nasal discharge. Common in goats/sheep.' },
            { d: 'Anthrax', c: 'text-amber-600', tagV: 'Urgent', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', s: 'Sudden death. Handle with gloves, report at once.' },
          ].map((d) => (
            <div key={d.d} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className={`text-lg font-black ${d.c}`}>{d.d}</div>
                <span className={`tag ${d.tagCls}`}>{d.tagV}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{d.s}</div>
            </div>
          ))}
        </div>
      </section>

      <Foot text="Farmer Support · Farmer Helpline 1962 (Toll Free)" />
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Field Officer Command                                              */
/* ------------------------------------------------------------------ */

function PaneOfficer() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / Field Officer Command"
        live="FIELD OFFICER CONSOLE"
        liveCls="bg-sky-500/25 text-sky-100 border border-sky-400/50"
        title="Field Officer"
        accent="Command"
        accentCls="text-sky-300"
        desc="Log cases, assign containment zones and drive district action from a single tactical console."
        bg="animal3"
        overlay="linear-gradient(90deg, rgba(30,58,138,.95) 0%, rgba(30,58,138,.7) 50%, rgba(30,58,138,.25) 100%)"
        buttons={[
          <button key="m" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-lg shadow hover:bg-slate-100 transition"><LogIn className="w-3.5 h-3.5" /> My Cases</button>,
          <span key="vo" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
        ]}
        ring={{ box: 'bg-blue-900', label: 'My District', value: 'Malda', sub: 'Zone: North', subCls: 'text-sky-200' }}
        ringNote="Live district console"
      />

      <KpiRow items={[
        { icon: Folder, tag: 'OPEN', tagCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', iconCls: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400', value: '23', sub: 'Open Cases' },
        { icon: Clock, tag: 'PENDING', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: '7', valueCls: 'pulse-border', sub: 'Verification Pending' },
        { icon: CheckCheck, tag: 'DONE', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', value: '142', sub: 'Resolved This Month' },
        { icon: Users, tag: 'TEAM', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', value: '18', sub: 'Field Agents' },
      ]} />

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 flex items-center justify-center"><Activity className="w-4 h-4" /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">District Case Pipeline</h2>
            </div>
            <span className="tag bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">This month</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {[
              { v: '60', h: '60%', l: 'W1', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '72', h: '72%', l: 'W2', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '66', h: '66%', l: 'W3', lCls: 'text-slate-400', tCls: 'text-slate-500 dark:text-slate-400' },
              { v: '84', h: '84%', l: 'W4 · Peak', lCls: 'font-bold text-sky-600 dark:text-sky-400', tCls: 'text-sky-600 dark:text-sky-400', bar: 'bar-anim shimmer', last: true },
            ].map((b, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center gap-1.5">
                <div className={`text-[10px] font-bold ${b.tCls}`}>{b.v}</div>
                <div className="flex w-full flex-1 min-h-0 items-end">
                  <div className={`w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-sky-400 ${b.bar || 'bar-anim'}`} style={{ height: b.h }}></div>
                </div>
                <span className={`text-[9px] ${b.lCls}`}>{b.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400"><TrendingUp className="w-3 h-3" /> +40% cases vs last month &#183; average response &lt; 2 h</div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Action Required</h2></div>
          <div className="space-y-3">
            <LogItem icon={AlertTriangle} iconCls="bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" title="Verify LSD-221" sub="Farm visit due · 10 min" />
            <LogItem icon={MapPin} iconCls="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" title="Assign containment zone" sub="Howrah · blocking" />
            <LogItem icon={ClipboardList} iconCls="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" title="Submit weekly report" sub="Due today · 2:00 PM" />
          </div>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">My Field Cases</h2>
          <span className="text-[10px] font-semibold text-slate-400">view-only</span>
        </div>
        <Table head={['Case', 'Village', 'Type', 'Status', 'Assigned To']} rows={[
          [tag('C-2214', 'text-slate-700 dark:text-slate-200'), { v: 'Bhutni' }, { v: 'LSD' }, tag(<><span className="live-dot"></span> In Progress</>, 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'), { v: 'MVU-2214' }],
          [tag('C-2213', 'text-slate-700 dark:text-slate-200'), { v: 'Kaliachak' }, { v: 'FMD' }, tag('Pending', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'), { v: 'Unassigned' }],
          [tag('C-2211', 'text-slate-700 dark:text-slate-200'), { v: 'Shamsi' }, { v: 'PPR' }, tag('Resolved', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'), { v: 'RRT-09' }],
        ]} />
      </section>

      <Foot text="Field Officer Console" />
      <section className="grid md:grid-cols-3 gap-4">
        <PhotoChip src="cow" tag="Field Visit" tagCls="bg-teal-500/90 text-white" title="Block Abhiyan Review" sub="12 clusters visited · action log closed" />
        <PhotoChip src="goat" tag="Naka Check" tagCls="bg-blue-500/90 text-white" title="Movement-Ban Vigilance" sub="64 vehicles checked · 2 permits flagged" />
        <PhotoChip src="pig" tag="Tagging Drive" tagCls="bg-emerald-500/90 text-white" title="Ear-Tag Camps" sub="1,284 tags applied · Pashu Aadhaar sync" />
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Epidemic Response Command                                          */
/* ------------------------------------------------------------------ */

function PaneEpidemic() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        crumb="PashuSahaya / Epidemic Response Command"
        live="LIVE · CONTAINMENT COMMAND"
        liveCls="bg-rose-500/25 text-rose-100 border border-rose-400/50"
        title="Epidemic"
        accent="Response Command"
        accentCls="text-rose-300"
        desc="Command chain for FMD, LSD, PPR, Anthrax & ASF - quarantine enforcement, ring vaccination and containment zone management."
        bg="animal1"
        overlay="linear-gradient(90deg, rgba(136,19,55,.95) 0%, rgba(136,19,55,.7) 50%, rgba(136,19,55,.28) 100%)"
        buttons={[
          <span key="a" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
          <span key="b" className="tag bg-white/10 text-white/70 border border-white/20">view-only</span>,
        ]}
        ring={{ box: 'bg-rose-900', label: 'Containment', value: '14', sub: 'zones active', subCls: 'text-rose-200' }}
        ringNote="Situation synced just now"
      />

      <KpiRow items={[
        { icon: Shield, tag: 'RING', tagCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', iconCls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', value: '1.2L', sub: 'Ring Vaccinated' },
        { icon: Lock, tag: 'QUAR', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', value: '36', valueCls: 'pulse-border', sub: 'Quarantine Units' },
        { icon: MapPin, tag: 'ZONES', tagCls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', value: '214', sub: 'Risk Districts' },
        { icon: Radar, tag: 'CPZ', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', value: '68', sub: 'Contained CPZ' },
      ]} />

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center"><Target className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Containment Zone Status</h2>
          </div>
          <SegBar segs={[
            { cls: 'bg-rose-500', w: '20%' }, { cls: 'bg-amber-500', w: '30%' },
            { cls: 'bg-sky-400', w: '35%' }, { cls: 'bg-slate-300 dark:bg-slate-600', w: '15%' },
          ]} />
          <div className="grid grid-cols-2 gap-3">
            <LegRow dot="bg-rose-500" label="Severe" sub="2 zones" pct="20%" pctCls="text-rose-600 dark:text-rose-400" />
            <LegRow dot="bg-amber-500" label="High" sub="3 zones" pct="30%" pctCls="text-amber-600 dark:text-amber-400" />
            <LegRow dot="bg-sky-400" label="Moderate" sub="6 zones" pct="35%" pctCls="text-sky-600 dark:text-sky-400" />
            <LegRow dot="bg-slate-300 dark:bg-slate-600" label="Stable" sub="3 zones" pct="15%" pctCls="text-slate-500 dark:text-slate-400" />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">14 = 2 + 3 + 6 + 3</span>
            <span className="tag bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"><Bell className="w-3 h-3" /> 36 quarantine units</span>
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center"><Activity className="w-4 h-4" /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Disease Action Matrix</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-rose-500">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">FMD</div>
                </div>
                <span className="tag bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">Quarantine + ring</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-emerald-500">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><Syringe className="w-4 h-4" /></div>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">LSD</div>
                </div>
                <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Ring vaccination live</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-amber-500">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center"><Lock className="w-4 h-4" /></div>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">PPR</div>
                </div>
                <span className="tag bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Movement restricted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Containment Activity</h2></div>
          <div className="space-y-3">
            <LogItem icon={Lock} iconCls="bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" title="Quarantine enforced · Malda" sub="3-km exclusion zone · 8 min ago" />
            <LogItem icon={Syringe} iconCls="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" title="Ring vaccination · Howrah" sub="1,240 doses · 22 min ago" />
            <LogItem icon={Radio} iconCls="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" title="Zone alert broadcast" sub="North-East belt · 1 hr ago" />
          </div>
        </div>
        <div className="photo-chip min-h-[220px] fade-up">
          <img src={IMG.animal2} alt="Containment field operations" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute top-4 left-4"><span className="tag bg-white/90 text-slate-800 shadow">Command Post</span></div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-white font-bold text-sm">Ring vaccination under way across 2 Eastern zones</div>
            <div className="text-white/70 text-[11px] mt-1">1.2L doses administered &#183; cold-chain ok</div>
          </div>
        </div>
      </section>

      <Foot text="Epidemic Response Command" />
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Router                                                             */
/* ------------------------------------------------------------------ */

const PANES = {
  'gis-map': PaneGisMap,
  'nadcp': PaneNadcp,
  'outbreak': PaneOutbreak,
  'mvu': PaneMvu,
  'vet-lab': PaneVetLab,
  'reports': PaneReports,
  'farmers': PaneFarmers,
  'officer': PaneOfficer,
  'epidemic': PaneEpidemic,
}

export default function ModulePanes({ module }) {
  const Pane = PANES[module]
  if (!Pane) return null
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950">
      <Pane />
    </div>
  )
}