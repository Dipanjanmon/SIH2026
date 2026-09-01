import React from 'react'
import Icon from '../../icons.jsx'
import { useApp } from '../../App.jsx'
import { neural as neuralLogo } from '../../img/index.js'

const MOD_TILES = [
  { id: 'gis-map', label: 'GIS Disease Map', sub: 'Live outbreak view', icon: 'map-pin', color: 'blue' },
  { id: 'nadcp', label: 'NADCP Vaccination', sub: 'Drive tracker', icon: 'syringe', color: 'emerald' },
  { id: 'mvu', label: 'MVU / RRT Dispatch', sub: 'Rapid response', icon: 'truck', color: 'amber' },
  { id: 'epidemic', label: 'Epidemic Response', sub: 'Containment ops', icon: 'shield-alert', color: 'red' }
]

const COLOR_MAP = {
  blue: { border: 'border-blue-200 dark:border-gov-600', hover: 'hover:border-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-500/15', icon: 'text-blue-600', text: 'text-blue-800 dark:text-blue-200' },
  emerald: { border: 'border-emerald-200 dark:border-gov-600', hover: 'hover:border-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: 'text-emerald-600', text: 'text-emerald-800 dark:text-emerald-200' },
  amber: { border: 'border-amber-200 dark:border-gov-600', hover: 'hover:border-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-500/15', icon: 'text-amber-600', text: 'text-amber-800 dark:text-amber-200' },
  red: { border: 'border-red-200 dark:border-gov-600', hover: 'hover:border-red-400', iconBg: 'bg-red-100 dark:bg-red-500/15', icon: 'text-red-600', text: 'text-red-800 dark:text-red-200' }
}

const CORE_MODULES = [
  { id: 'gis-map', title: 'GIS Disease Surveillance', desc: 'Interactive national map with live outbreak clusters, risk zones, livestock density and animal movement tracking across all districts.', icon: 'map-pin', color: 'blue' },
  { id: 'nadcp', title: 'NADCP Vaccination Drive', desc: 'Round-wise FMD &amp; Brucellosis vaccination coverage tracking, dose administration logs and reminder scheduling per district and farm.', icon: 'syringe', color: 'emerald' },
  { id: 'mvu', title: 'MVU & RRT Dispatch', desc: 'Rapid deployment of 1,962 Mobile Veterinary Units and Rapid Response Teams to the farmer\'s doorstep with live tracking.', icon: 'truck', color: 'amber' },
  { id: 'epidemic', title: 'Epidemic Response', desc: 'Command chain for FMD, LSD, PPR, Anthrax &amp; ASF — quarantine enforcement, ring vaccination and containment zone management.', icon: 'shield-alert', color: 'red' },
  { id: 'vet-lab', title: 'Laboratory & Diagnostics', desc: 'Sample submission, test status and lab reports from veterinary diagnostic laboratories, integrated with disease alerts.', icon: 'flask-conical', color: 'violet' },
  { id: 'reports', title: 'Reports & Analytics', desc: 'District dashboards, vaccination coverage analytics, outbreak trend reports and executive summaries for policy decisions.', icon: 'bar-chart-3', color: 'cyan' }
]

const CORE_COLOR_MAP = {
  blue: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 hover:border-[#0a58a0]/50',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 hover:border-emerald-500/50',
  amber: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 hover:border-amber-500/50',
  red: 'bg-red-50 dark:bg-red-500/15 text-red-600 hover:border-red-500/50',
  violet: 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 hover:border-violet-500/50',
  cyan: 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 hover:border-cyan-500/50'
}

const BENEFITS = [
  { title: 'Real-time Intelligence', desc: 'Live outbreak data verified across districts, minutes after field reporting.', icon: 'radio-tower', color: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600' },
  { title: 'Unified Field Teams', desc: 'Farmers, officers, veterinarians, labs and MVUs on a single coordinated grid.', icon: 'users', color: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600' },
  { title: 'Fast Containment', desc: 'Quarantine, ring vaccination & RRT dispatch initiated in under two hours.', icon: 'zap', color: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600' },
  { title: 'Policy-ready Insight', desc: 'District analytics and reports that power better, faster Government decisions.', icon: 'shield-check', color: 'bg-red-50 dark:bg-red-500/15 text-red-600' }
]

const WORKFLOW = [
  { n: '1', title: 'Report', desc: 'Field officers & farmers log suspected cases with location and symptoms.', color: 'bg-[#0a58a0]' },
  { n: '2', title: 'Verify', desc: 'Veterinarians & laboratories confirm the diagnosis through testing.', color: 'bg-emerald-600' },
  { n: '3', title: 'Contain', desc: 'Zone lockdown, quarantine and ring vaccination are triggered on the map.', color: 'bg-amber-600' },
  { n: '4', title: 'Respond', desc: 'MVU / RRT reaches the farm and updated status flows back to command.', color: 'bg-red-600' }
]

const ROLES = [
  { id: 'farmers', title: 'Livestock Farmers', desc: 'Report sick animals, request MVU visits, and get vaccination reminders.', icon: 'user', color: 'bg-emerald-500/20 text-emerald-300', link: 'text-emerald-300' },
  { id: 'officer', title: 'Field Officers', desc: 'Log cases, assign containment zones and monitor district-level action.', icon: 'shield', color: 'bg-blue-500/20 text-blue-300', link: 'text-blue-300' },
  { id: 'vet-lab', title: 'Veterinarians & Labs', desc: 'Verify diagnoses, upload test results and manage vaccination rounds.', icon: 'stethoscope', color: 'bg-amber-500/20 text-amber-300', link: 'text-amber-300' },
  { id: 'reports', title: 'Administrators', desc: 'Access national dashboards, KPIs and analytics for policy making.', icon: 'landmark', color: 'bg-red-500/20 text-red-300', link: 'text-red-300' }
]

const DISEASES = [
  { abbr: 'FMD', name: 'Foot & Mouth Disease', color: 'text-red-600' },
  { abbr: 'LSD', name: 'Lumpy Skin Disease', color: 'text-emerald-600' },
  { abbr: 'PPR', name: 'Peste des Petits Ruminants', color: 'text-blue-600' },
  { abbr: 'ASF', name: 'African Swine Fever', color: 'text-amber-600' },
  { abbr: 'ANTHRAX', name: 'Zoonotic risk', color: 'text-violet-600' },
  { abbr: 'BRUCELLOSIS', name: 'NADCP Targeted', color: 'text-cyan-600' },
  { abbr: 'RANIKHET', name: 'Poultry Viral', color: 'text-fuchsia-600' },
  { abbr: '+ MORE', name: 'Under surveillance', color: 'text-slate-600' }
]

function ModuleLink({ id, children, cls }) {
  const { spaShow } = useApp()
  return (
    <a href="#" data-module={id} onClick={(e) => { e.preventDefault(); spaShow(id) }} className={cls}>
      {children}
    </a>
  )
}

export default function HomePane({ heroIdx, heroImgSrc, imgReady, setHeroIdx, startLogin }) {
  const { spaShow, diseaseGridOpen, setDiseaseGridOpen } = useApp()

  return (
    <div id="pane-home" className="flex-1 min-h-full w-full">

      {/* ===== NEWS TICKER ===== */}
      <div className="bg-amber-50 dark:bg-gov-800 border-b border-amber-200 dark:border-gov-700">
        <div className="w-full px-4 py-1.5 flex items-center gap-2 text-[11px]">
          <span className="shrink-0 inline-flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15 px-2 py-0.5 rounded">
            <Icon name="megaphone" className="w-3.5 h-3.5" /> Advisory
          </span>
          <div className="overflow-hidden relative flex-1">
            <div className="whitespace-nowrap animate-[marquee_32s_linear_infinite] hover:[animation-play-state:paused] inline-block">
              <span className="inline-block">&nbsp;[LIVE] 14 active outbreak clusters under containment — NADCP-R4 vaccination at 84.6% coverage — 1,962 Mobile Veterinary Units deployed nationwide — LSD &amp; FMD surveillance intensified across Eastern &amp; North-Eastern zones — New quarantine advisory issued for livestock movement routes &nbsp;•&nbsp; Farmer Helpline 1962 (Toll Free) &nbsp;•&nbsp; &nbsp;[LIVE] 14 active outbreak clusters under containment — NADCP-R4 vaccination at 84.6% coverage — 1,962 Mobile Veterinary Units deployed nationwide &nbsp;•&nbsp;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO BANNER + QUICK LINKS ===== */}
      <section className="flex-1 w-full px-4 py-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-gov-700">
          <img
            id="heroBannerImg"
            src={heroImgSrc}
            alt="Livestock district surveillance banner"
            className="w-full h-56 md:h-80 object-cover"
            style={{ opacity: imgReady ? 1 : 0, transition: 'opacity 0.4s ease' }}
            onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27320%27%3E%3Crect width=%27600%27 height=%27320%27 fill=%27%230a58a0%27/%3E%3Ctext x=%27300%27 y=%27170%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2720%27 text-anchor=%27middle%27%3EPashuRaksha%3C/text%3E%3C/svg%3E" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"></div>
          <div className="absolute inset-x-0 bottom-0 left-0 right-0 p-4 md:p-6 z-10">
            <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span></span> PASHURAKSHA · LIVE NATIONAL SURVEILLANCE
            </span>
            <h2 className="mt-2.5 text-white font-extrabold text-lg md:text-3xl leading-tight">Protect Every Herd — <span className="text-emerald-300">Detect, Contain, Vaccinate, Respond</span></h2>
            <p className="mt-1.5 text-white/85 text-[11px] md:text-sm max-w-xl">PashuRaksha unifies outbreak detection, containment command, NADCP vaccination tracking and MVU rapid response — so district teams and farmers act on verified, real-time intelligence.</p>
            <div className="mt-3.5 flex flex-wrap gap-3">
              <button onClick={startLogin} className="group inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 ring-1 ring-white/30 hover:shadow-xl hover:from-emerald-400 hover:to-emerald-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
                <Icon name="arrow-right" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> Get Started
              </button>
              <button onClick={startLogin} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/10 border border-white/40 px-6 py-2.5 rounded-lg backdrop-blur-sm hover:bg-white/25 hover:border-white/70 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
                <Icon name="shield-check" className="w-3.5 h-3.5" /> Field Officer Access
              </button>
            </div>
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <span
                key={k}
                onClick={(e) => { e.stopPropagation(); setHeroIdx(k) }}
                className={"hero-dot " + (k === heroIdx ? "w-4 h-2 rounded-full bg-white shadow ring-1 ring-black/30 transition-all cursor-pointer" : "w-2 h-2 rounded-full bg-white/50 transition-all cursor-pointer")}
              />
            ))}
          </div>
        </div>

        {/* Right: Quick access + KPIs */}
        <div className="space-y-4">
          <div className="group bg-white dark:bg-gov-900 border border-slate-200 dark:border-gov-700 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/30 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0a58a0] to-[#0e7bb5] text-white px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5"><Icon name="zap" className="w-3.5 h-3.5" /> Quick Access</span>
              <span className="text-[9px] font-bold bg-white/15 ring-1 ring-white/30 px-2 py-0.5 rounded-full">4 MODULES</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2.5">
              {MOD_TILES.map((t) => {
                const c = COLOR_MAP[t.color]
                return (
                  <ModuleLink key={t.id} id={t.id} cls={"text-left text-[11px] font-semibold " + c.text + " bg-white dark:bg-gov-800 " + c.border + " rounded-xl p-2.5 " + c.hover + " hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2.5 group/tile"}>
                    <span className={"shrink-0 w-8 h-8 rounded-lg " + c.iconBg + " flex items-center justify-center"}><Icon name={t.icon} className={"w-4 h-4 " + c.icon} /></span>
                    <span><span className="block font-bold">{t.label}</span><span className="block text-[9px] font-normal text-slate-400 mt-0.5">{t.sub}</span></span>
                  </ModuleLink>
                )
              })}
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-[#0a58a0] via-[#0b5f9e] to-[#0f3d66] text-white rounded-2xl shadow-lg shadow-blue-900/20 dark:shadow-black/30 p-4">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5"></div>
            <div className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full bg-white/5"></div>
            <div className="relative flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-blue-100/80 font-bold flex items-center gap-1.5"><Icon name="activity" className="w-3.5 h-3.5 text-emerald-300" /> National Coverage</span>
              <span className="text-[9px] font-bold text-emerald-200 bg-emerald-500/20 ring-1 ring-emerald-300/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300"></span></span> LIVE
              </span>
            </div>
            <div className="relative mt-3 flex items-end gap-2">
              <div className="text-4xl font-extrabold leading-none">736<span className="text-2xl text-blue-200/70 font-semibold">/766</span></div>
              <div className="text-[10px] text-blue-200/80 mb-0.5 font-medium">Districts</div>
            </div>
            <div className="relative mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500"></div>
            </div>
            <div className="relative mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
              <div className="rounded-lg bg-white/5 py-2"><div className="text-lg font-extrabold text-white">14</div><div className="text-[9px] text-blue-100/70">Outbreaks</div></div>
              <div className="rounded-lg bg-white/5 py-2"><div className="text-lg font-extrabold text-white">84.6%</div><div className="text-[9px] text-blue-100/70">Vaccinated</div></div>
              <div className="rounded-lg bg-white/5 py-2"><div className="text-lg font-extrabold text-white">1,962</div><div className="text-[9px] text-blue-100/70">MVUs</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEY STATS BAND ===== */}
      <section className="bg-[#0a58a0] text-white">
        <div className="w-full px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl md:text-3xl font-extrabold text-white">736<span className="text-base text-white/60">/766</span></div><div className="text-[10px] md:text-[11px] text-emerald-200 mt-0.5">Districts Covered</div></div>
          <div><div className="text-2xl md:text-3xl font-extrabold text-white">14</div><div className="text-[10px] md:text-[11px] text-emerald-200 mt-0.5">Active Outbreak Clusters</div></div>
          <div><div className="text-2xl md:text-3xl font-extrabold text-white">84.6%</div><div className="text-[10px] md:text-[11px] text-emerald-200 mt-0.5">NADCP Vaccination</div></div>
          <div><div className="text-2xl md:text-3xl font-extrabold text-white">1,962</div><div className="text-[10px] md:text-[11px] text-emerald-200 mt-0.5">Mobile Vet Units (MVU)</div></div>
        </div>
      </section>

      {/* ===== CORE MODULES ===== */}
      <section className="w-full px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-7 rounded bg-[#0a58a0]"></div>
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white">PashuRaksha Core Modules</h3>
            <p className="text-[11px] text-slate-400">Every module of the national livestock response grid, in one command floor.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_MODULES.map((m) => (
            <ModuleLink key={m.id} id={m.id} cls={"bg-white dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-xl p-5 hover:shadow-lg " + CORE_COLOR_MAP[m.color].split(' ').pop() + " hover:-translate-y-0.5 transition block"}>
              <div className="flex items-center justify-between">
                <div className={"w-11 h-11 rounded-xl " + CORE_COLOR_MAP[m.color].split(' ').slice(0, 2).join(' ') + " flex items-center justify-center"}><Icon name={m.icon} className="w-5 h-5" /></div>
                <Icon name="arrow-up-right" className="w-4 h-4 text-slate-300" />
              </div>
              <h4 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">{m.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{m.desc}</p>
            </ModuleLink>
          ))}
        </div>
      </section>

      {/* ===== WHY PASHURAKSHA ===== */}
      <section className="bg-slate-100 dark:bg-gov-800/40 border-y border-slate-200 dark:border-gov-700">
        <div className="w-full px-4 py-10">
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Why PashuRaksha</p>
            <h3 className="mt-1 text-lg md:text-2xl font-extrabold text-slate-800 dark:text-white">Built to Protect Livelihoods, One Herd at a Time</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-xl p-5 text-center">
                <div className={"w-12 h-12 mx-auto rounded-full " + b.color + " flex items-center justify-center"}><Icon name={b.icon} className="w-6 h-6" /></div>
                <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">{b.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RESPONSE WORKFLOW ===== */}
      <section className="w-full px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">How it works</p>
          <h3 className="mt-1 text-lg md:text-2xl font-extrabold text-slate-800 dark:text-white">From Detection to Response in Four Steps</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {WORKFLOW.map((s) => (
            <div key={s.n} className="relative bg-white dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-xl p-5 text-center">
              <div className={"w-11 h-11 mx-auto rounded-full " + s.color + " text-white flex items-center justify-center text-lg font-extrabold"}>{s.n}</div>
              <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">{s.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="bg-[#0a2e52] text-white">
        <div className="w-full px-4 py-10">
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">Who it's for</p>
            <h3 className="mt-1 text-lg md:text-2xl font-extrabold text-white">Every Role, One Connected Platform</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => (
              <ModuleLink key={r.id} id={r.id} cls="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition block">
                <div className={"w-11 h-11 rounded-lg " + r.color + " flex items-center justify-center"}><Icon name={r.icon} className="w-5 h-5" /></div>
                <h4 className="mt-3 text-sm font-bold text-white">{r.title}</h4>
                <p className="text-[11px] text-white/70 mt-1.5">{r.desc}</p>
                <span className={"mt-3 inline-flex items-center gap-1 text-[10px] font-semibold " + r.link}>Sign In <Icon name="arrow-right" className="w-3 h-3" /></span>
              </ModuleLink>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DISEASE COVERAGE ===== */}
      <section className="w-full px-4 py-10">
        <div className="bg-white dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/15 text-red-600 flex items-center justify-center"><Icon name="activity" className="w-5 h-5" /></div>
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white">Notifiable Diseases Under Watch</h3>
              <p className="text-[11px] text-slate-400">Continuous surveillance &amp; epidemic response for high-impact diseases.</p>
            </div>
          </div>
          <button type="button" onClick={() => setDiseaseGridOpen((v) => !v)} className="w-full text-left border-2 border-dashed border-slate-200 dark:border-gov-700 rounded-lg px-4 py-4 bg-slate-50/70 dark:bg-gov-800/60 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/15 text-red-600 flex items-center justify-center shrink-0"><Icon name="eye" className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">7 diseases under surveillance</div>
                  <div className="text-[11px] text-slate-400">Tap to view the disease watch list</div>
                </div>
              </div>
              <Icon name="chevron-down" className={"w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 " + (diseaseGridOpen ? 'rotate-180' : '')} />
            </div>
          </button>
          {diseaseGridOpen && (
            <div className="mt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DISEASES.map((d) => (
                  <div key={d.abbr} className="border border-slate-200 dark:border-gov-700 rounded-lg p-3 text-center bg-slate-50 dark:bg-gov-800">
                    <div className={"text-lg font-extrabold " + d.color}>{d.abbr}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{d.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="w-full px-4 pb-10">
        <div className="bg-gradient-to-r from-[#0a2e52] to-[#0a58a0] text-white rounded-xl p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-lg md:text-xl font-extrabold">Ready to join the national response grid?</h3>
            <p className="mt-2 text-white/85 text-[11px] md:text-sm">Sign in to access live maps, vaccination drives, outbreak alerts and dispatch tools — or register a new field team.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <button onClick={startLogin} className="text-[12px] font-bold bg-white text-[#0a58a0] px-6 py-3 rounded-lg hover:bg-blue-50 transition shadow inline-flex items-center gap-1.5"><Icon name="log-in" className="w-4 h-4" /> Sign In</button>
            <button onClick={startLogin} className="text-[12px] font-semibold bg-white/15 border border-white/40 text-white px-6 py-3 rounded-lg hover:bg-white/25 transition">Register Team</button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="mt-auto bg-[#0a2e52] text-white/80">
        <div className="w-full px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-[11px]">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="relative logo-glow p-0.5 rounded-full overflow-hidden bg-white w-8 h-8">
                <img src={neuralLogo} alt="PashuRaksha" className="w-full h-full rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <div>
                <div className="text-white font-extrabold text-sm">PashuRaksha</div>
                <div className="text-[9px] text-white/50">Livestock Epidemic Response Platform</div>
              </div>
            </div>
            <p className="mt-3 text-white/60 leading-relaxed">A unified national grid for livestock disease surveillance, NADCP vaccination tracking and MVU/veterinary rapid response — built to protect India's farmers and their herds.</p>
            <div className="mt-3 flex gap-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"><Icon name="facebook" className="w-3.5 h-3.5" /></a>
              <a href="#" onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"><Icon name="twitter" className="w-3.5 h-3.5" /></a>
              <a href="#" onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"><Icon name="youtube" className="w-3.5 h-3.5" /></a>
            </div>
          </div>
          <div>
            <h5 className="text-white font-bold mb-2.5 border-b border-white/20 pb-1.5 text-xs">Platform</h5>
            <ul className="space-y-1.5">
              {[['gis-map', 'Live Disease Map'], ['nadcp', 'NADCP Vaccination'], ['outbreak', 'Outbreak Alerts'], ['mvu', 'MVU / RRT Dispatch'], ['reports', 'Reports & Analytics']].map(([id, label]) => (
                <li key={id}><ModuleLink id={id} cls="hover:underline flex items-center gap-1.5"><Icon name="chevron-right" className="w-3 h-3 text-emerald-300" /> {label}</ModuleLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-2.5 border-b border-white/20 pb-1.5 text-xs">For Teams</h5>
            <ul className="space-y-1.5">
              {[['officer', 'Field Officer Access'], ['vet-lab', 'Veterinarian / Vet Hospital'], ['mvu', 'Mobile Vet Unit (MVU)'], ['vet-lab', 'Laboratory (Lab)'], ['reports', 'Admin Console']].map(([id, label]) => (
                <li key={label}><ModuleLink id={id} cls="hover:underline flex items-center gap-1.5"><Icon name="chevron-right" className="w-3 h-3 text-emerald-300" /> {label}</ModuleLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-2.5 border-b border-white/20 pb-1.5 text-xs">Helpline &amp; Contact</h5>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><Icon name="phone-call" className="w-3.5 h-3.5 text-emerald-300" /> Farmer Helpline: <span className="text-emerald-300 font-bold">1962 (Toll Free)</span></li>
              <li className="flex items-center gap-1.5"><Icon name="headset" className="w-3.5 h-3.5 text-emerald-300" /> District Command: 1800-11-4000</li>
              <li className="flex items-center gap-1.5"><Icon name="mail" className="w-3.5 h-3.5 text-emerald-300" /> helpdesk@pashuraksha.in</li>
              <li className="flex items-center gap-1.5"><Icon name="clock" className="w-3.5 h-3.5 text-emerald-300" /> Service Hours: 24×7 Emergency</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="w-full px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]">
            <span>PashuRaksha - National Livestock Surveillance Grid - v1.0</span>
            <span className="text-white/50">&copy; PashuRaksha - All Rights Reserved - Best viewed in Chrome / Firefox</span>
          </div>
        </div>
      </footer>
    </div>
  )
}