import React from 'react'
import Icon from '../../icons.jsx'
import { FALLBACK_IMG } from '../../data.js'
import LOCAL_IMGS from '../../img/index.js'

const MOD_HERO_FB =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27900%27 height=%27400%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%230a58a0%27/%3E%3Cstop offset=%270.5%27 stop-color=%27%230f3d66%27/%3E%3Cstop offset=%271%27 stop-color=%27%23071f38%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27900%27 height=%27400%27 fill=%27url(%23g)%27/%3E%3Ctext x=%2745%27 y=%27220%27 fill=%27%23ffffff%27 fill-opacity=%270.85%27 font-family=%27monospace%27 font-size=%2726%27 font-weight=%27bold%27%3EPashuRaksha%3C/text%3E%3C/svg%3E"

// ---------- building blocks ----------

function BgImg({ src, alt = '', cls = '', fb, onError }) {
  return (
    <img
      src={LOCAL_IMGS[src] || src}
      alt={alt}
      className={cls}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = fb || FALLBACK_IMG
        if (onError) onError(e)
      }}
    />
  )
}

function ModHero({ img, alt, tag, tagCls, title, titleSpan, spanCls, desc, btn1, btn2, ring, overlay }) {
  return (
    <section className="mod-hero fade-up">
      <BgImg src={img} alt={alt} cls="mod-hero-bg" fb={MOD_HERO_FB} />
      <div className="mod-hero-overlay" style={overlay}></div>
      <div className="mod-hero-body px-5 md:px-8 py-5 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="live-dot"></span>
            <span className={"tag " + tagCls}>{tag}</span>
          </div>
          <h1 className="mt-2.5 text-xl md:text-2xl font-black text-white leading-tight">{title} <span className={spanCls}>{titleSpan}</span></h1>
          <p className="mt-1.5 text-white/85 text-xs md:text-sm max-w-xl">{desc}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-lg shadow hover:bg-slate-100 transition">
              <Icon name={btn1.icon} className="w-3.5 h-3.5" /> {btn1.label}
            </button>
            <button className={"inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/25 transition " + (btn2.cls || '')}>
              <Icon name={btn2.icon} className="w-3.5 h-3.5" /> {btn2.label}
            </button>
          </div>
        </div>
        <div className="gradient-ring shrink-0">
          <div className={ring.bg + " px-5 py-3 text-center"}>
            <div className="text-[10px] uppercase tracking-widest text-white/70 font-bold">{ring.label}</div>
            <div className="text-2xl font-black text-white stat-ticker">{ring.value}{ring.unit ? <span className="text-base">{ring.unit}</span> : null}</div>
            <div className={"text-[10px] " + ring.subCls}>{ring.sub}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

const C = {
  'emerald-50': { tag: 'bg-emerald-50 text-emerald-700', ic: 'bg-emerald-50 text-emerald-600' },
  'blue-50': { tag: 'bg-blue-50 text-blue-700', ic: 'bg-blue-50 text-blue-600' },
  'amber-50': { tag: 'bg-amber-50 text-amber-700', ic: 'bg-amber-50 text-amber-600' },
  'violet-50': { tag: 'bg-violet-50 text-violet-700', ic: 'bg-violet-50 text-violet-600' },
  'cyan-50': { tag: 'bg-cyan-50 text-cyan-700', ic: 'bg-cyan-50 text-cyan-600' },
  'rose-50': { tag: 'bg-rose-50 text-rose-700', ic: 'bg-rose-50 text-rose-600' },
  'sky-50': { tag: 'bg-sky-50 text-sky-700', ic: 'bg-sky-50 text-sky-600' },
  'indigo-50': { tag: 'bg-indigo-50 text-indigo-700', ic: 'bg-indigo-50 text-indigo-600' },
  'slate-100': { tag: 'bg-slate-100 text-slate-500', ic: 'bg-slate-100 text-slate-500' }
}

function ModKpis({ kpis }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => {
        const c = C[k.tagBg] || C['emerald-50']
        return (
          <div key={k.tag} className="kpi-card p-4 fade-up">
            <div className="flex items-center justify-between">
              <span className={'tag ' + c.tag}>{k.tag}</span>
              <div className={c.ic + ' w-9 h-9 rounded-xl flex items-center justify-center'}>
                <Icon name={k.icon} className="w-5 h-5" />
              </div>
            </div>
            <div className={`text-3xl font-black ${k.pulse ? 'pulse-border' : 'text-slate-800'} mt-3 stat-ticker`}>{k.value}{k.suffix ? <span className="text-base text-slate-400">{k.suffix}</span> : null}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{k.label}</div>
          </div>
        )
      })}
    </section>
  )
}

function MiniProgress({ label, value, pct, bar }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold"><span>{label}</span><span>{value}</span></div>
      <div className="mini-progress mt-1.5"><i style={{ width: pct + '%' }} className={bar}></i></div>
    </div>
  )
}

function SectionTable({ head, rows, title, sub, tag, btn, tbodyCls }) {
  return (
    <section className="kpi-card overflow-hidden fade-up">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sub && <span className="live-dot"></span>}
          <h2 className="text-sm font-extrabold text-slate-800">{title}</h2>
        </div>
        {tag && <span className={"tag " + tag}>{tag}</span>}
        {btn && (
          <button className={"text-[11px] font-bold text-white " + btn.cls + " px-3.5 py-1.5 rounded-lg hover:opacity-90 transition inline-flex items-center gap-1.5"}>
            <Icon name={btn.icon} className="w-3.5 h-3.5" /> {btn.label}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
            <tr>{head.map((h, i) => <th key={i} className="px-5 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className={"divide-y divide-slate-100 " + (tbodyCls || '')}>{rows}</tbody>
        </table>
      </div>
    </section>
  )
}

function MiniDivider({ label, delta }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold"><span>{label.label}</span><span className={label.cls}>{label.value}</span></div>
      <div className="mini-progress mt-1"><i style={{ width: delta.pct + '%' }} className={delta.bar}></i></div>
    </div>
  )
}

// ============================================================
// pane-gis-map
// ============================================================

function GisMapPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal3.jpg" alt="Livestock surveillance aerial"
        tag="LIVE · SPATIAL INTELLIGENCE" tagCls="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
        title="GIS Disease" titleSpan="Surveillance Map" spanCls="grad-text"
        desc="Live outbreak clusters, risk heat-zones and livestock movement tracked across every district — refreshed in real time from the field grid."
        btn1={{ icon: 'download', label: 'Export Map' }}
        btn2={{ icon: 'refresh-cw', label: 'Refresh' }}
        ring={{ label: 'Live Coverage', value: '96.1', unit: '%', sub: '736 / 766 districts', bg: 'bg-[#0a58a0]', subCls: 'text-emerald-300' }}
      />

      <ModKpis kpis={[
        { tag: 'LIVE', tagBg: 'emerald-50', tagTxt: 'emerald-700', icBg: 'bg-emerald-50', icTxt: 'text-emerald-600', icon: 'radar', value: '14', label: 'Active Clusters' },
        { tag: 'COVER', tagBg: 'blue-50', tagTxt: 'blue-700', icBg: 'bg-blue-50', icTxt: 'text-blue-600', icon: 'layers', value: '736', suffix: '/766', label: 'Districts Tracked' },
        { tag: 'HOT', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'flame', value: '38', label: 'Risk Heat-Zones' },
        { tag: 'FLEET', tagBg: 'violet-50', tagTxt: 'violet-700', icBg: 'bg-violet-50', icTxt: 'text-violet-600', icon: 'truck', value: '1,962', label: 'Mobile Vet Units' }
      ]} />

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 photo-chip min-h-[260px]">
          <BgImg src="animal2.jpg" alt="India livestock density map" cls="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <div>
              <div className="tag bg-white/90 text-slate-800 shadow">Spatial Cluster Map</div>
              <div className="text-white font-bold text-sm mt-2">North-East surge · Eastern belt elevated</div>
            </div>
            <span className="live-dot"></span>
          </div>
        </div>
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <h2 className="text-sm font-extrabold text-slate-800">Risk Heat-Zones</h2>
          <div className="space-y-3 mt-4">
            <MiniDivider label={{ label: 'Malda · LSD', value: 'SEVERE', cls: 'text-rose-600' }} delta={{ pct: 92, bar: 'bg-rose-500' }} />
            <MiniDivider label={{ label: 'Howrah · FMD', value: 'MODERATE', cls: 'text-amber-600' }} delta={{ pct: 64, bar: 'bg-amber-500' }} />
            <MiniDivider label={{ label: 'Jalpaiguri · PPR', value: 'HIGH', cls: 'text-rose-600' }} delta={{ pct: 80, bar: 'bg-rose-500' }} />
            <MiniDivider label={{ label: 'Bankura · Anthrax', value: 'WATCH', cls: 'text-sky-600' }} delta={{ pct: 42, bar: 'bg-sky-500' }} />
            <MiniDivider label={{ label: 'Murshidabad · LSD', value: 'LOW', cls: 'text-emerald-600' }} delta={{ pct: 28, bar: 'bg-emerald-500' }} />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-sm font-extrabold text-slate-800">Outbreak Detection by District</h2><p className="text-[10px] text-slate-400 mt-0.5">Clusters reported across zones</p></div>
            <span className="tag bg-slate-100 text-slate-500">Last 6 rounds</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {[[35, 'R1'], [48, 'R2'], [42, 'R3'], [70, 'R4'], [88, 'R5'], [56, 'R6']].map(([h, lb]) => (
              <div key={lb} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-400 bar-anim" style={{ height: h + '%' }}></div>
                <span className="text-[9px] text-slate-400">{lb}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800">Live Activity Feed</h2></div>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Icon name="map-pin" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">New cluster mapped · Malda</div><div className="text-[10px] text-slate-400">LSD-221 marked SEVERE · 2 min ago</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Icon name="refresh-cw" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Risk zone updated · Howrah</div><div className="text-[10px] text-slate-400">Containment widened · 18 min ago</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Icon name="check" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Verification complete · Nadia</div><div className="text-[10px] text-slate-400">Field team confirmed FMD-091 · 1 hr ago</div></div></div>
          </div>
        </div>
      </section>

      <SectionTable
        title="Active Outbreak Clusters"
        btn={{ icon: 'plus', label: 'New', cls: 'bg-gradient-to-r from-[#0a58a0] to-[#0e7bb5]' }}
        head={['Cluster', 'District', 'Risk', 'Status', 'First Reported']}
        rows={[
          <tr key="1" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">LSD-221</td><td className="px-5 py-3 text-slate-500">Malda</td><td className="px-5 py-3"><span className="tag bg-rose-50 text-rose-700">Severe</span></td><td className="px-5 py-3"><span className="live-dot"></span> Active</td><td className="px-5 py-3 text-slate-500">04 May</td></tr>,
          <tr key="2" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">FMD-087</td><td className="px-5 py-3 text-slate-500">Howrah</td><td className="px-5 py-3"><span className="tag bg-amber-50 text-amber-700">Moderate</span></td><td className="px-5 py-3 text-slate-500">Active</td><td className="px-5 py-3 text-slate-500">05 May</td></tr>,
          <tr key="3" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">PPR-112</td><td className="px-5 py-3 text-slate-500">Jalpaiguri</td><td className="px-5 py-3"><span className="tag bg-rose-50 text-rose-700">High</span></td><td className="px-5 py-3 text-slate-500">Active</td><td className="px-5 py-3 text-slate-500">05 May</td></tr>,
          <tr key="4" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">Anthrax-03</td><td className="px-5 py-3 text-slate-500">Bankura</td><td className="px-5 py-3"><span className="tag bg-sky-50 text-sky-700">Watch</span></td><td className="px-5 py-3 text-slate-500">Monitoring</td><td className="px-5 py-3 text-slate-500">06 May</td></tr>,
          <tr key="5" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">LSD-224</td><td className="px-5 py-3 text-slate-500">Murshidabad</td><td className="px-5 py-3"><span className="tag bg-emerald-50 text-emerald-700">Moderate</span></td><td className="px-5 py-3 text-slate-500">Active</td><td className="px-5 py-3 text-slate-500">07 May</td></tr>
        ]}
      />

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Spatial Outbreak Intelligence · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ============================================================
// pane-nadcp
// ============================================================

function NadcpPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal1.jpg" alt="Cattle vaccination drive"
        tag="LIVE · VACCINATION DRIVE" tagCls="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
        title="NADCP" titleSpan="Vaccination Drive" spanCls="grad-text"
        desc="National Animal Disease Control Programme — round-wise FMD &amp; Brucellosis coverage, dose logs and reminders down to district and farm level."
        btn1={{ icon: 'plus', label: 'Schedule Round' }}
        btn2={{ icon: 'bell', label: 'Reminders' }}
        ring={{ label: 'R4 Coverage', value: '84.6', unit: '%', sub: 'FMD + Brucellosis', bg: 'bg-emerald-700', subCls: 'text-emerald-200' }}
      />

      <ModKpis kpis={[
        { tag: 'DONE', tagBg: 'emerald-50', tagTxt: 'emerald-700', icBg: 'bg-emerald-50', icTxt: 'text-emerald-600', icon: 'syringe', value: '1.24Cr', label: 'Doses Administered' },
        { tag: 'ROUND', tagBg: 'blue-50', tagTxt: 'blue-700', icBg: 'bg-blue-50', icTxt: 'text-blue-600', icon: 'layers', value: '4', label: 'Active Rounds' },
        { tag: 'COVER', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'shield-check', value: '646', label: 'Districts ≥ 80%' },
        { tag: 'DUE', tagBg: 'violet-50', tagTxt: 'violet-700', icBg: 'bg-violet-50', icTxt: 'text-violet-600', icon: 'clock', value: '18K', label: 'Booster Due' }
      ]} />

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 photo-chip min-h-[220px]">
          <BgImg src="animal3.jpg" alt="Vaccination camp" cls="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="tag bg-white/90 text-slate-800 shadow">Field Vaccination Camp</div>
            <div className="text-white font-bold text-sm mt-2">2,340 camps active this week</div>
          </div>
        </div>
        <div className="lg:col-span-3 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-extrabold text-slate-800">Round-wise Coverage</h2><span className="tag bg-emerald-50 text-emerald-700">NADCP-R4</span></div>
          <div className="space-y-4">
            <MiniProgress label="R1 · Baseline" value="62%" pct={62} bar="bg-slate-400" />
            <MiniProgress label="R2 · South" value="74%" pct={74} bar="bg-sky-500" />
            <MiniProgress label="R3 · National" value="81%" pct={81} bar="bg-blue-500" />
            <div><div className="flex justify-between text-[11px] font-semibold"><span>R4 · Live now</span><span className="grad-text font-black">84.6%</span></div><div className="mini-progress mt-1.5 shimmer"><i style={{ width: '84.6%' }} className="bg-gradient-to-r from-emerald-500 to-teal-400"></i></div></div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800">Live Dose Log</h2></div>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Icon name="syringe" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">1,240 doses logged · Malda</div><div className="text-[10px] text-slate-400">FMD booster · 5 min ago</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Icon name="syringe" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">860 doses logged · Nadia</div><div className="text-[10px] text-slate-400">Brucellosis · 12 min ago</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Icon name="bell" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Booster reminder sent</div><div className="text-[10px] text-slate-400">312 farms · Bankura · 20 min ago</div></div></div>
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <h2 className="text-sm font-extrabold text-slate-800 mb-4">Coverage by Region</h2>
          <div className="space-y-3">
            <MiniProgress label="Eastern" value="91%" pct={91} bar="bg-emerald-500" />
            <MiniProgress label="North" value="82%" pct={82} bar="bg-blue-500" />
            <MiniProgress label="South" value="78%" pct={78} bar="bg-sky-500" />
            <MiniProgress label="West" value="87%" pct={87} bar="bg-teal-500" />
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <h2 className="text-sm font-extrabold text-slate-800 mb-4">Upcoming Reminders</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div className="text-[11px] font-semibold text-slate-700">R5 Round · FMD</div><span className="tag bg-emerald-50 text-emerald-700">in 7 days</span></div>
            <div className="flex items-center justify-between"><div className="text-[11px] font-semibold text-slate-700">R4 Booster due</div><span className="tag bg-amber-50 text-amber-700">18K farms</span></div>
            <div className="flex items-center justify-between"><div className="text-[11px] font-semibold text-slate-700">Cold-chain audit</div><span className="tag bg-blue-50 text-blue-700">tomorrow</span></div>
          </div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · National Animal Disease Control Programme</footer>
    </main>
  )
}

// ============================================================
// pane-outbreak
// ============================================================

function OutbreakPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal2.jpg" alt="Disease outbreak response"
        tag="LIVE · OUTBREAK ALERTS" tagCls="bg-red-500/25 text-red-200 border border-red-400/50"
        title="Outbreak" titleSpan="Alert Center" spanCls="text-amber-300"
        desc="Verified disease signals triaged by severity — each alert pushes straight to district command and field response teams in minutes."
        btn1={{ icon: 'siren', label: 'View Critical', cls: 'bg-red-600 border-0 shadow hover:bg-red-500' }}
        btn2={{ icon: 'filter', label: 'Filter' }}
        ring={{ label: 'Active Alerts', value: '14', sub: '5 critical now', bg: 'bg-red-900', subCls: 'text-red-200' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(127,29,29,.94) 0%, rgba(127,29,29,.7) 45%, rgba(127,29,29,.3) 100%)' }}
      />

      <ModKpis kpis={[
        { tag: 'CRIT', tagBg: 'rose-50', tagTxt: 'rose-700', icBg: 'bg-rose-50', icTxt: 'text-rose-600', icon: 'alert-triangle', value: '5', label: 'Critical Alerts', pulse: true },
        { tag: 'MOD', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'shield-alert', value: '6', label: 'Moderate Alerts' },
        { tag: 'WATCH', tagBg: 'sky-50', tagTxt: 'sky-700', icBg: 'bg-sky-50', icTxt: 'text-sky-600', icon: 'eye', value: '3', label: 'Under Watch' },
        { tag: 'REESP', tagBg: 'violet-50', tagTxt: 'violet-700', icBg: 'bg-violet-50', icTxt: 'text-violet-600', icon: 'radar', value: '<2h', label: 'Avg Response' }
      ]} />

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
          <div className="kpi-card p-4 border-l-4 border-rose-500 fade-up">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><span className="live-dot"></span><h3 className="text-xs font-extrabold text-slate-800">LSD-221 · Malda</h3></div>
              <span className="tag bg-rose-50 text-rose-700">SEVERE</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Lumpy Skin · 1,240 cattle exposed · ring vaccination live</p>
          </div>
          <div className="kpi-card p-4 border-l-4 border-rose-500 fade-up">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><span className="live-dot"></span><h3 className="text-xs font-extrabold text-slate-800">FMD-087 · Howrah</h3></div>
              <span className="tag bg-rose-50 text-rose-700">SEVERE</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Foot &amp; Mouth · quarantine zone active · 3 farms</p>
          </div>
          <div className="kpi-card p-4 border-l-4 border-amber-500 fade-up">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><h3 className="text-xs font-extrabold text-slate-800">PPR-112 · Jalpaiguri</h3></div>
              <span className="tag bg-amber-50 text-amber-700">HIGH</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Peste des Petits Ruminants · 620 sheep · movement restricted</p>
          </div>
        </div>
      </section>

      <SectionTable
        title="Live Outbreak Queue"
        sub
        btn={{ icon: 'plus', label: 'Report Case', cls: 'bg-red-600' }}
        head={['Alert', 'Disease', 'District', 'Severity', 'Status']}
        rows={[
          <tr key="1" className="hover:bg-red-50/50"><td className="px-5 py-3 font-semibold text-slate-700">LSD-221</td><td className="px-5 py-3 text-slate-500">Lumpy Skin</td><td className="px-5 py-3 text-slate-500">Malda</td><td className="px-5 py-3"><span className="tag bg-rose-50 text-rose-700">Severe</span></td><td className="px-5 py-3"><span className="live-dot"></span> Responding</td></tr>,
          <tr key="2" className="hover:bg-red-50/50"><td className="px-5 py-3 font-semibold text-slate-700">FMD-087</td><td className="px-5 py-3 text-slate-500">Foot &amp; Mouth</td><td className="px-5 py-3 text-slate-500">Howrah</td><td className="px-5 py-3"><span className="tag bg-rose-50 text-rose-700">Severe</span></td><td className="px-5 py-3"><span className="live-dot"></span> Dispatch</td></tr>,
          <tr key="3" className="hover:bg-amber-50/40"><td className="px-5 py-3 font-semibold text-slate-700">PPR-112</td><td className="px-5 py-3 text-slate-500">PPR</td><td className="px-5 py-3 text-slate-500">Jalpaiguri</td><td className="px-5 py-3"><span className="tag bg-amber-50 text-amber-700">High</span></td><td className="px-5 py-3 text-slate-500">Verifying</td></tr>,
          <tr key="4" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">Anthrax-03</td><td className="px-5 py-3 text-slate-500">Anthrax</td><td className="px-5 py-3 text-slate-500">Bankura</td><td className="px-5 py-3"><span className="tag bg-sky-50 text-sky-700">Watch</span></td><td className="px-5 py-3 text-slate-500">Monitoring</td></tr>
        ]}
      />

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Outbreak Alert Center · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ============================================================
// pane-mvu
// ============================================================

function MvuPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal3.jpg" alt="Mobile veterinary unit"
        tag="LIVE · FIELD DISPATCH" tagCls="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
        title="MVU &amp; RRT" titleSpan="Rapid Dispatch" spanCls="text-emerald-300"
        desc="1,962 Mobile Veterinary Units and Rapid Response Teams — live-tracked to the farmer's doorstep with ETA and case status."
        btn1={{ icon: 'navigation', label: 'Track Live' }}
        btn2={{ icon: 'phone', label: 'Request MVU' }}
        ring={{ label: 'Fleet Live', value: '1,962', sub: '312 on call now', bg: 'bg-slate-800', subCls: 'text-emerald-300' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(15,23,42,.94) 0%, rgba(15,23,42,.7) 50%, rgba(15,23,42,.25) 100%)' }}
      />

      <ModKpis kpis={[
        { tag: 'DISPATCH', tagBg: 'emerald-50', tagTxt: 'emerald-700', icBg: 'bg-emerald-50', icTxt: 'text-emerald-600', icon: 'truck', value: '312', label: 'Units On Call' },
        { tag: 'ON ROUTE', tagBg: 'blue-50', tagTxt: 'blue-700', icBg: 'bg-blue-50', icTxt: 'text-blue-600', icon: 'map', value: '1,540', label: 'On Route Today' },
        { tag: 'ETA', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'clock', value: '48', suffix: 'min', label: 'Avg Response' },
        { tag: 'RESOLVED', tagBg: 'violet-50', tagTxt: 'violet-700', icBg: 'bg-violet-50', icTxt: 'text-violet-600', icon: 'check-circle', value: '4.2K', label: 'Cases Today' }
      ]} />

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-extrabold text-slate-800">Live Unit Tracking</h2><span className="tag bg-emerald-50 text-emerald-700"><i className="inline-flex"><Icon name="radio" className="w-3 h-3" /></i> On air</span></div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center"><Icon name="truck" className="w-5 h-5" /></div><div className="flex-1"><div className="text-[12px] font-bold text-slate-800">MVU-2214</div><div className="text-[10px] text-slate-400">En route · Malda → Bhutni</div></div><div className="text-right"><span className="tag bg-emerald-50 text-emerald-700">12 min ETA</span><div className="text-[10px] text-slate-400 mt-1">LSD-221 case</div></div></div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white flex items-center justify-center"><Icon name="truck" className="w-5 h-5" /></div><div className="flex-1"><div className="text-[12px] font-bold text-slate-800">RRT-09</div><div className="text-[10px] text-slate-400">On site · Howrah</div></div><div className="text-right"><span className="tag bg-blue-50 text-blue-700">On site</span><div className="text-[10px] text-slate-400 mt-1">FMD-087</div></div></div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-400 text-white flex items-center justify-center"><Icon name="truck" className="w-5 h-5" /></div><div className="flex-1"><div className="text-[12px] font-bold text-slate-800">MVU-1108</div><div className="text-[10px] text-slate-400">En route · Jalpaiguri</div></div><div className="text-right"><span className="tag bg-amber-50 text-amber-700">28 min ETA</span><div className="text-[10px] text-slate-400 mt-1">PPR-112</div></div></div>
          </div>
        </div>
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <h2 className="text-sm font-extrabold text-slate-800 mb-4">Team Composition</h2>
          <div className="space-y-3">
            <MiniProgress label="Veterinarians" value="1,900" pct={96} bar="bg-gradient-to-r from-emerald-500 to-teal-400" />
            <MiniProgress label="Para-vets" value="3,240" pct={88} bar="bg-blue-500" />
            <MiniProgress label="RRT members" value="860" pct={72} bar="bg-amber-500" />
          </div>
          <div className="mt-5 photo-chip min-h-[140px]">
            <BgImg src="farmer.jpg" alt="Field MVU visit" cls="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3"><div className="text-white text-[11px] font-bold">MVU reaching remote farms</div></div>
          </div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Mobile Veterinary Unit Dispatch · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ============================================================
// pane-vet-lab
// ============================================================

function VetLabPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="lab.jpg" alt="Veterinary diagnostic laboratory"
        tag="LIVE · DIAGNOSTICS" tagCls="bg-cyan-500/20 text-cyan-200 border border-cyan-400/40"
        title="Lab &amp;" titleSpan="Diagnostics" spanCls="text-cyan-300"
        desc="Sample submission, test status and verified reports from veterinary diagnostic labs — linked straight into disease alerts."
        btn1={{ icon: 'microscope', label: 'Submit Sample' }}
        btn2={{ icon: 'file-text', label: 'Reports' }}
        ring={{ label: 'Avg TAT', value: '14', unit: 'h', sub: 'Test turnaround', bg: 'bg-cyan-900', subCls: 'text-cyan-200' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(30,41,59,.94) 0%, rgba(30,41,59,.7) 50%, rgba(30,41,59,.25) 100%)' }}
      />

      <ModKpis kpis={[
        { tag: 'IN QUEUE', tagBg: 'cyan-50', tagTxt: 'cyan-700', icBg: 'bg-cyan-50', icTxt: 'text-cyan-600', icon: 'hourglass', value: '1,248', label: 'Samples in Queue' },
        { tag: 'TESTING', tagBg: 'blue-50', tagTxt: 'blue-700', icBg: 'bg-blue-50', icTxt: 'text-blue-600', icon: 'microscope', value: '386', label: 'Testing Now' },
        { tag: 'VERIFIED', tagBg: 'emerald-50', tagTxt: 'emerald-700', icBg: 'bg-emerald-50', icTxt: 'text-emerald-600', icon: 'check-check', value: '9,214', label: 'Verified Reports' },
        { tag: 'POSITIVE', tagBg: 'rose-50', tagTxt: 'rose-700', icBg: 'bg-rose-50', icTxt: 'text-rose-600', icon: 'alert-circle', value: '412', label: 'Positive Cases', pulse: true }
      ]} />

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 photo-chip min-h-[240px]">
          <BgImg src="lab2.jpg" alt="Lab technicians" cls="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="tag bg-white/90 text-slate-800 shadow">Diagnostic Network</div>
            <div className="text-white font-bold text-sm mt-2">140 labs reporting live</div>
          </div>
        </div>
        <div className="lg:col-span-3 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-extrabold text-slate-800">Test Results by Type</h2><span className="tag bg-cyan-50 text-cyan-700">This week</span></div>
          <div className="space-y-4">
            <div><div className="flex justify-between text-[11px] font-semibold"><span>FMD · ELISA</span><span>1,804</span></div><div className="mini-progress mt-1.5"><i style={{ width: '78%' }} className="bg-gradient-to-r from-cyan-500 to-blue-500"></i></div></div>
            <div><div className="flex justify-between text-[11px] font-semibold"><span>LSD · PCR</span><span>1,406</span></div><div className="mini-progress mt-1.5"><i style={{ width: '62%' }} className="bg-blue-500"></i></div></div>
            <div><div className="flex justify-between text-[11px] font-semibold"><span>PPR · RT-PCR</span><span>964</span></div><div className="mini-progress mt-1.5"><i style={{ width: '48%' }} className="bg-violet-500"></i></div></div>
            <div><div className="flex justify-between text-[11px] font-semibold"><span>Anthrax · Culture</span><span>520</span></div><div className="mini-progress mt-1.5"><i style={{ width: '30%' }} className="bg-rose-500"></i></div></div>
          </div>
        </div>
      </section>

      <SectionTable
        title="Latest Verified Reports"
        btn={{ icon: 'download', label: 'Export', cls: 'bg-gradient-to-r from-cyan-600 to-blue-600' }}
        head={['Sample', 'Test', 'Lab', 'Result', 'Reported']}
        rows={[
          <tr key="1" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">S-88421</td><td className="px-5 py-3 text-slate-500">FMD ELISA</td><td className="px-5 py-3 text-slate-500">Cooch Behar</td><td className="px-5 py-3"><span className="tag bg-rose-50 text-rose-700">Positive</span></td><td className="px-5 py-3 text-slate-500">2 min ago</td></tr>,
          <tr key="2" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">S-88419</td><td className="px-5 py-3 text-slate-500">LSD PCR</td><td className="px-5 py-3 text-slate-500">Malda</td><td className="px-5 py-3"><span className="tag bg-emerald-50 text-emerald-700">Negative</span></td><td className="px-5 py-3 text-slate-500">14 min ago</td></tr>,
          <tr key="3" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">S-88417</td><td className="px-5 py-3 text-slate-500">PPR RT-PCR</td><td className="px-5 py-3 text-slate-500">Jalpaiguri</td><td className="px-5 py-3"><span className="tag bg-amber-50 text-amber-700">Suspected</span></td><td className="px-5 py-3 text-slate-500">1 hr ago</td></tr>
        ]}
      />

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Laboratory &amp; Diagnostics · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ============================================================
// pane-reports
// ============================================================

function ReportsPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal1.jpg" alt="Analytics dashboard"
        tag="LIVE · ANALYTICS" tagCls="bg-indigo-500/20 text-indigo-200 border border-indigo-400/40"
        title="Reports &amp;" titleSpan="Analytics" spanCls="text-indigo-300"
        desc="District dashboards, coverage analytics, outbreak trends and executive summaries that power faster government decisions."
        btn1={{ icon: 'download', label: 'Executive Summary' }}
        btn2={{ icon: 'calendar', label: 'Date Range' }}
        ring={{ label: 'Report Labs', value: '140', sub: 'producing daily', bg: 'bg-indigo-900', subCls: 'text-indigo-200' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(23,37,84,.95) 0%, rgba(23,37,84,.72) 50%, rgba(23,37,84,.28) 100%)' }}
      />

      <ModKpis kpis={[
        { tag: 'TREND', tagBg: 'indigo-50', tagTxt: 'indigo-700', icBg: 'bg-indigo-50', icTxt: 'text-indigo-600', icon: 'bar-chart-3', value: '-12', suffix: '%', label: 'Outbreak Trend' },
        { tag: 'COVER', tagBg: 'blue-50', tagTxt: 'blue-700', icBg: 'bg-blue-50', icTxt: 'text-blue-600', icon: 'shield-check', value: '84.6', suffix: '%', label: 'Vaccination Cover' },
        { tag: 'RESP', tagBg: 'emerald-50', tagTxt: 'emerald-700', icBg: 'bg-emerald-50', icTxt: 'text-emerald-600', icon: 'activity', value: '96', suffix: '%', label: 'Response Rate' },
        { tag: 'LIVE QTR', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'trending-up', value: 'Q3', label: 'Reporting Quarter' }
      ]} />

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-extrabold text-slate-800">Outbreak Trend (6 rounds)</h2><span className="tag bg-indigo-50 text-indigo-700">declining</span></div>
          <div className="flex items-end gap-3 h-48">
            {[[90, 'R1', 'from-indigo-700 to-indigo-400'], [76, 'R2', 'from-indigo-700 to-indigo-400'], [64, 'R3', 'from-indigo-700 to-indigo-400'], [55, 'R4', 'from-indigo-700 to-indigo-400'], [48, 'R5', 'from-indigo-700 to-indigo-400'], [38, 'R6', 'from-emerald-600 to-emerald-400']].map(([h, lb, grad]) => (
              <div key={lb} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={"w-full rounded-t-lg bg-gradient-to-t " + grad + " bar-anim"} style={{ height: h + '%' }}></div>
                <span className="text-[9px] text-slate-400">{lb}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <h2 className="text-sm font-extrabold text-slate-800 mb-4">Coverage vs Target</h2>
          <div className="space-y-3">
            <MiniProgress label="East" value="91 / 95" pct={91} bar="bg-emerald-500" />
            <MiniProgress label="West" value="87 / 95" pct={87} bar="bg-teal-500" />
            <MiniProgress label="North" value="82 / 95" pct={82} bar="bg-blue-500" />
            <MiniProgress label="South" value="78 / 95" pct={78} bar="bg-sky-500" />
          </div>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800">Executive KPI Summary</h2>
          <button className="text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-1.5 rounded-lg hover:opacity-90 transition inline-flex items-center gap-1.5"><Icon name="file-text" className="w-3.5 h-3.5" /> PDF</button>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-slate-100">
          <div className="bg-white p-5"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Districts Covered</div><div className="text-2xl font-black text-slate-800 mt-1">736 / 766</div><div className="mini-progress mt-2"><i style={{ width: '96%' }} className="bg-emerald-500"></i></div></div>
          <div className="bg-white p-5"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Doses This Quarter</div><div className="text-2xl font-black text-slate-800 mt-1">3.6 Cr</div><div className="mini-progress mt-2"><i style={{ width: '72%' }} className="bg-blue-500"></i></div></div>
          <div className="bg-white p-5"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">MVU Dispatch</div><div className="text-2xl font-black text-slate-800 mt-1">1,962</div><div className="mini-progress mt-2"><i style={{ width: '88%' }} className="bg-violet-500"></i></div></div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Reports &amp; Analytics · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ============================================================
// pane-farmers
// ============================================================

function FarmersPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="farmer.jpg" alt="Farmer with livestock"
        tag="FARMER SUPPORT HUB" tagCls="bg-emerald-500/25 text-emerald-100 border border-emerald-400/50"
        title="For" titleSpan="Farmers" spanCls="text-emerald-300"
        desc="Report sick animals, request an MVU visit and get vaccination reminders — all in your language, straight from your phone."
        btn1={{ icon: 'phone-call', label: 'Helpline 1962', cls: 'text-green-900' }}
        btn2={{ icon: 'message-circle', label: 'Report Sick Animal' }}
        ring={{ label: 'Toll Free', value: '1962', sub: 'Farmer Helpline', bg: 'bg-green-800', subCls: 'text-emerald-200' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(20,83,45,.92) 0%, rgba(20,83,45,.65) 50%, rgba(20,83,45,.22) 100%)' }}
      />

      <section className="grid md:grid-cols-3 gap-4">
        <div className="kpi-card p-5 fade-up text-center"><div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="phone-call" className="w-6 h-6" /></div><div className="text-base font-extrabold text-slate-800 mt-3">Helpline 1962</div><p className="text-[11px] text-slate-400 mt-1">Report cases &amp; get advice in your language, 24×7 toll free.</p><button className="mt-3 text-[11px] font-bold text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500"><Icon name="phone" className="w-3 h-3 inline" /> Call Now</button></div>
        <div className="kpi-card p-5 fade-up text-center"><div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Icon name="truck" className="w-6 h-6" /></div><div className="text-base font-extrabold text-slate-800 mt-3">Request MVU Visit</div><p className="text-[11px] text-slate-400 mt-1">A mobile vet unit reaches your farm, live-tracked.</p><button className="mt-3 text-[11px] font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500"><Icon name="navigation" className="w-3 h-3 inline" /> Request Visit</button></div>
        <div className="kpi-card p-5 fade-up text-center"><div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><Icon name="bell-ring" className="w-6 h-6" /></div><div className="text-base font-extrabold text-slate-800 mt-3">Vaccination Reminders</div><p className="text-[11px] text-slate-400 mt-1">Get SMS/WhatsApp alerts when your herd's booster is due.</p><button className="mt-3 text-[11px] font-bold text-white bg-amber-600 px-4 py-2 rounded-lg hover:bg-amber-500"><Icon name="bell" className="w-3 h-3 inline" /> Set Reminder</button></div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="photo-chip min-h-[200px] fade-up">
          <BgImg src="animal2.jpg" alt="Healthy cattle herd" cls="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4"><div className="text-white font-bold text-sm">Keep your herd healthy — vaccinations are free under NADCP.</div></div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800">Nearby Alerts for Your District</h2></div>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><Icon name="alert-triangle" className="w-4 h-4" /></div><div className="flex-1"><div className="text-[12px] font-bold text-slate-700">LSD alert · Malda</div><div className="text-[10px] text-slate-400">Vaccinate calves. Avoid animal movement.</div></div><span className="tag bg-rose-50 text-rose-700">2 km</span></div>
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Icon name="syringe" className="w-4 h-4" /></div><div className="flex-1"><div className="text-[12px] font-bold text-slate-700">Free vaccination camp</div><div className="text-[10px] text-slate-400">This Sunday · Community Centre</div></div><span className="tag bg-emerald-50 text-emerald-700">Free</span></div>
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Icon name="truck" className="w-4 h-4" /></div><div className="flex-1"><div className="text-[12px] font-bold text-slate-700">MVU visit confirmed</div><div className="text-[10px] text-slate-400">Tomorrow 10:00 · Your farm</div></div><span className="tag bg-blue-50 text-blue-700">Confirmed</span></div>
          </div>
        </div>
      </section>

      <section className="kpi-card p-5 fade-up">
        <h2 className="text-sm font-extrabold text-slate-800 mb-4">Common Diseases — What To Watch</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition"><div className="text-lg font-black text-rose-600">FMD</div><div className="text-[11px] text-slate-500 mt-1">Blistering, drooling, hoof pain. Isolate &amp; report.</div></div>
          <div className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition"><div className="text-lg font-black text-emerald-600">LSD</div><div className="text-[11px] text-slate-500 mt-1">Skin nodules, fever, milk drop. Vaccinate calves.</div></div>
          <div className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition"><div className="text-lg font-black text-blue-600">PPR</div><div className="text-[11px] text-slate-500 mt-1">Fever, nasal discharge. Common in goats/sheep.</div></div>
          <div className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition"><div className="text-lg font-black text-amber-600">Anthrax</div><div className="text-[11px] text-slate-500 mt-1">Sudden death. Handle with gloves, report at once.</div></div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Farmer Support · Farmer Helpline 1962 (Toll Free)</footer>
    </main>
  )
}

// ============================================================
// pane-officer
// ============================================================

function OfficerPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal3.jpg" alt="Field officer operations"
        tag="FIELD OFFICER CONSOLE" tagCls="bg-sky-500/25 text-sky-100 border border-sky-400/50"
        title="Field Officer" titleSpan="Command" spanCls="text-sky-300"
        desc="Log cases, assign containment zones and drive district action from a single tactical console."
        btn1={{ icon: 'log-in', label: 'My Cases' }}
        btn2={{ icon: 'user-plus', label: 'Assign Team' }}
        ring={{ label: 'My District', value: 'Malda', sub: 'Zone: North', bg: 'bg-blue-900', subCls: 'text-sky-200' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(30,58,138,.95) 0%, rgba(30,58,138,.7) 50%, rgba(30,58,138,.25) 100%)' }}
      />

      <ModKpis kpis={[
        { tag: 'OPEN', tagBg: 'sky-50', tagTxt: 'sky-700', icBg: 'bg-sky-50', icTxt: 'text-sky-600', icon: 'folder', value: '23', label: 'Open Cases' },
        { tag: 'PENDING', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'clock', value: '7', label: 'Verification Pending', pulse: true },
        { tag: 'DONE', tagBg: 'emerald-50', tagTxt: 'emerald-700', icBg: 'bg-emerald-50', icTxt: 'text-emerald-600', icon: 'check-check', value: '142', label: 'Resolved This Month' },
        { tag: 'TEAM', tagBg: 'violet-50', tagTxt: 'violet-700', icBg: 'bg-violet-50', icTxt: 'text-violet-600', icon: 'users', value: '18', label: 'Field Agents' }
      ]} />

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 kpi-card p-5 fade-up">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-extrabold text-slate-800">District Case Pipeline</h2><span className="tag bg-sky-50 text-sky-700">This month</span></div>
          <div className="flex items-end gap-3 h-48">
            {[[60, 'W1'], [72, 'W2'], [66, 'W3'], [84, 'W4']].map(([h, lb]) => (
              <div key={lb} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-sky-400 bar-anim" style={{ height: h + '%' }}></div>
                <span className="text-[9px] text-slate-400">{lb}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800">Action Required</h2></div>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><Icon name="alert-triangle" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Verify LSD-221</div><div className="text-[10px] text-slate-400">Farm visit due · 10 min</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Icon name="map" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Assign containment zone</div><div className="text-[10px] text-slate-400">Howrah · blocking</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Icon name="clipboard-list" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Submit weekly report</div><div className="text-[10px] text-slate-400">Due today · 2:00 PM</div></div></div>
          </div>
        </div>
      </section>

      <SectionTable
        title="My Field Cases"
        btn={{ icon: 'plus', label: 'Log Case', cls: 'bg-gradient-to-r from-blue-700 to-sky-600' }}
        head={['Case', 'Village', 'Type', 'Status', 'Assigned To']}
        rows={[
          <tr key="1" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">C-2214</td><td className="px-5 py-3 text-slate-500">Bhutni</td><td className="px-5 py-3 text-slate-500">LSD</td><td className="px-5 py-3"><span className="live-dot"></span> In Progress</td><td className="px-5 py-3 text-slate-500">MVU-2214</td></tr>,
          <tr key="2" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">C-2213</td><td className="px-5 py-3 text-slate-500">Kaliachak</td><td className="px-5 py-3 text-slate-500">FMD</td><td className="px-5 py-3"><span className="tag bg-amber-50 text-amber-700">Pending</span></td><td className="px-5 py-3 text-slate-500">Unassigned</td></tr>,
          <tr key="3" className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-700">C-2211</td><td className="px-5 py-3 text-slate-500">Shamsi</td><td className="px-5 py-3 text-slate-500">PPR</td><td className="px-5 py-3"><span className="tag bg-emerald-50 text-emerald-700">Resolved</span></td><td className="px-5 py-3 text-slate-500">RRT-09</td></tr>
        ]}
      />

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Field Officer Console · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ============================================================
// pane-epidemic
// ============================================================

function EpidemicPane() {
  return (
    <main className="w-full px-4 py-5 space-y-5">
      <ModHero
        img="animal1.jpg" alt="Epidemic command operations"
        tag="LIVE · CONTAINMENT COMMAND" tagCls="bg-rose-500/25 text-rose-100 border border-rose-400/50"
        title="Epidemic" titleSpan="Response Command" spanCls="text-rose-300"
        desc="Command chain for FMD, LSD, PPR, Anthrax &amp; ASF — quarantine enforcement, ring vaccination and containment zone management."
        btn1={{ icon: 'shield', label: 'Ring Vaccination', cls: 'bg-rose-600 border-0 shadow hover:bg-rose-500' }}
        btn2={{ icon: 'lock', label: 'Quarantine Zones' }}
        ring={{ label: 'Containment', value: '14', sub: 'zones active', bg: 'bg-rose-900', subCls: 'text-rose-200' }}
        overlay={{ background: 'linear-gradient(90deg, rgba(136,19,55,.95) 0%, rgba(136,19,55,.7) 50%, rgba(136,19,55,.28) 100%)' }}
      />

      <ModKpis kpis={[
        { tag: 'RING', tagBg: 'rose-50', tagTxt: 'rose-700', icBg: 'bg-rose-50', icTxt: 'text-rose-600', icon: 'shield', value: '1.2L', label: 'Ring Vaccinated' },
        { tag: 'QUAR', tagBg: 'amber-50', tagTxt: 'amber-700', icBg: 'bg-amber-50', icTxt: 'text-amber-600', icon: 'lock', value: '36', label: 'Quarantine Units', pulse: true },
        { tag: 'ZONES', tagBg: 'blue-50', tagTxt: 'blue-700', icBg: 'bg-blue-50', icTxt: 'text-blue-600', icon: 'map-pin', value: '214', label: 'Risk Districts' },
        { tag: 'CPZ', tagBg: 'violet-50', tagTxt: 'violet-700', icBg: 'bg-violet-50', icTxt: 'text-violet-600', icon: 'radar', value: '68', label: 'Contained CPZ' }
      ]} />

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 grid md:grid-cols-3 gap-4">
          <div className="kpi-card p-4 border-t-4 border-rose-500 fade-up"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><Icon name="alert-triangle" className="w-4 h-4" /></div><div><div className="text-xs font-extrabold text-slate-800">FMD</div><div className="text-[10px] text-slate-400">Quarantine + ring</div></div></div></div>
          <div className="kpi-card p-4 border-t-4 border-emerald-500 fade-up"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="syringe" className="w-4 h-4" /></div><div><div className="text-xs font-extrabold text-slate-800">LSD</div><div className="text-[10px] text-slate-400">Ring vaccination live</div></div></div></div>
          <div className="kpi-card p-4 border-t-4 border-amber-500 fade-up"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Icon name="lock" className="w-4 h-4" /></div><div><div className="text-xs font-extrabold text-slate-800">PPR</div><div className="text-[10px] text-slate-400">Movement restricted</div></div></div></div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="kpi-card p-5 fade-up">
          <div className="flex items-center gap-2 mb-4"><span className="live-dot"></span><h2 className="text-sm font-extrabold text-slate-800">Containment Activity</h2></div>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><Icon name="lock" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Quarantine enforced · Malda</div><div className="text-[10px] text-slate-400">3-km exclusion zone · 8 min ago</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Icon name="syringe" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Ring vaccination · Howrah</div><div className="text-[10px] text-slate-400">1,240 doses · 22 min ago</div></div></div>
            <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Icon name="radio" className="w-4 h-4" /></div><div><div className="text-[11px] font-semibold text-slate-700">Zone alert broadcast</div><div className="text-[10px] text-slate-400">North-East belt · 1 hr ago</div></div></div>
          </div>
        </div>
        <div className="photo-chip min-h-[220px] fade-up">
          <BgImg src="animal2.jpg" alt="Containment field operations" cls="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="tag bg-white/90 text-slate-800 shadow">Command Post</div>
            <div className="text-white font-bold text-sm mt-2">Ring vaccination under way across 2 Eastern zones</div>
          </div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuRaksha · Epidemic Response Command · National Livestock Surveillance Network</footer>
    </main>
  )
}

// ---------- router ----------

const PANES = {
  'gis-map': GisMapPane,
  'nadcp': NadcpPane,
  'outbreak': OutbreakPane,
  'mvu': MvuPane,
  'vet-lab': VetLabPane,
  'reports': ReportsPane,
  'farmers': FarmersPane,
  'officer': OfficerPane,
  'epidemic': EpidemicPane
}

export default function ModulePanes({ id }) {
  const Pane = PANES[id] || GisMapPane
  return <div id={'pane-' + id} className="flex-1 min-h-full w-full bg-slate-100"><Pane /></div>
}