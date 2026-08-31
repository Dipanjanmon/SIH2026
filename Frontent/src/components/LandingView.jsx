import React, { useEffect, useRef, useState } from 'react'
import Icon from '../icons.jsx'
import { useApp } from '../App.jsx'
import HomePane from './landing/HomePane.jsx'
import ModulePanes from './landing/ModulePanes.jsx'
import { heroImages, neural as neuralLogo } from '../img/index.js'

const NAV_LINKS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'gis-map', label: 'PashuRaksha GIS Map', icon: 'map-pin' },
  { id: 'nadcp', label: 'NADCP Drive', icon: 'syringe' },
  { id: 'outbreak', label: 'Outbreak Alerts', icon: 'shield-alert' },
  { id: 'mvu', label: 'MVU Dispatch', icon: 'truck' },
  { id: 'vet-lab', label: 'Vet Lab', icon: 'flask-conical' },
  { id: 'reports', label: 'Reports', icon: 'bar-chart-3' },
  { id: 'farmers', label: 'For Farmers', icon: 'user' },
  { id: 'officer', label: 'Field Officer', icon: 'shield' }
]

function NavLink({ id, label, icon, cls = '', baseCls }) {
  const { module, spaShow } = useApp()
  const active = module === id
  return (
    <a
      href="#"
      data-module={id}
      onClick={(e) => { e.preventDefault(); spaShow(id) }}
      className={baseCls + (active ? ' nav-active' : '') + (cls.includes('ml-auto') ? ' ml-auto' : '') + (cls.includes('hidden md:flex') ? ' hidden md:flex' : '') + (cls.includes('hidden lg:flex') ? ' hidden lg:flex' : '')}
    >
      <Icon name={icon} className="w-3 h-3" />
      {label}
    </a>
  )
}

export default function LandingView() {
  const { module, startLogin, darkTheme, toggleTheme, showHome } = useApp()
  const [heroIdx, setHeroIdx] = useState(0)
  const [heroDotOver, setHeroDotOver] = useState(null)
  const bannerTimer = useRef(null)
  const viewRef = useRef(null)
  const HERO_IMAGES = heroImages
  const [heroImgSrc, setHeroImgSrc] = useState(HERO_IMAGES[0])
  const [imgReady, setImgReady] = useState(true)

  useEffect(() => {
    bannerTimer.current = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 4000)
    return () => clearInterval(bannerTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (viewRef.current) viewRef.current.scrollTop = 0
  }, [module])

  useEffect(() => {
    setImgReady(false)
    const t = setTimeout(() => {
      setHeroImgSrc(HERO_IMAGES[heroIdx])
      setImgReady(true)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroIdx])

  return (
    <div id="landingView" ref={viewRef} className="fixed inset-0 z-40 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-gov-900 transition-colors duration-500">
      <div className="min-h-full flex flex-col">

        {/* ===== TOP UTILITY BAR ===== */}
        <div className="bg-[#0a58a0] text-white text-[11px]">
          <div className="w-full px-4 py-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                <Icon name="shield" className="w-3 h-3 text-emerald-300" /> PashuRaksha<span className="text-emerald-300">™</span> Grid
              </span>
              <span className="hidden md:inline text-blue-200">|</span>
              <NavLink id="gis-map" label="Live GIS Map" icon="map-pin" baseCls="hover:underline flex items-center gap-1.5" />
              <span className="hidden md:inline text-blue-200">|</span>
              <NavLink id="nadcp" label="NADCP Vaccination" icon="syringe" baseCls="hover:underline hidden md:flex items-center gap-1.5" />
              <span className="hidden lg:inline text-blue-200">|</span>
              <NavLink id="mvu" label="MVU / RRT Dispatch" icon="truck" baseCls="hover:underline hidden lg:flex items-center gap-1.5" />
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-200">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300"></span></span>
                Live National Surveillance
              </span>
              <span className="hidden sm:inline text-blue-200">|</span>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline flex items-center gap-1.5">
                <Icon name="phone" className="w-3 h-3" /> Farmer Helpline <span className="font-bold">1962</span>
              </a>
              <span className="hidden md:inline text-blue-200">|</span>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline hidden md:flex items-center gap-1.5">
                <Icon name="mail" className="w-3 h-3" /> helpdesk@pashuraksha.in
              </a>
            </div>
          </div>
        </div>

        {/* ===== HEADER : Brand + Logo ===== */}
        <header className="bg-white dark:bg-gov-800 border-b border-slate-200 dark:border-gov-700">
          <div className="w-full px-4 py-4 flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-center text-center shrink-0">
              <div className="relative logo-glow p-1 rounded-full overflow-hidden bg-white border border-slate-200 shadow-lg shadow-blue-900/10">
                <img src={neuralLogo} alt="PashuRaksha Logo" className="w-16 h-16 rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">National Surveillance Grid</span>
              </div>
              <h1 className="mt-1 text-blue-900 dark:text-blue-300 font-extrabold text-xl md:text-3xl leading-tight">
                PashuRaksha <span className="text-slate-400 dark:text-slate-500 font-medium text-sm md:text-lg">— Livestock Epidemic Response Platform</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-medium text-[11px] md:text-sm">Real-time Disease Surveillance · NADCP Vaccination Tracking · RRT &amp; MVU Dispatch</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} title="Toggle Light / Dark" className="p-2 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gov-700 rounded-full border border-slate-300 dark:border-gov-600 transition">
                  <Icon id="landingThemeIcon" name={darkTheme ? 'sun' : 'moon'} className="w-4 h-4" />
                </button>
                <button onClick={startLogin} className="text-[11px] font-bold text-white bg-[#0a58a0] hover:bg-[#0a4a85] px-5 py-2.5 rounded shadow transition inline-flex items-center gap-1.5">
                  <Icon name="log-in" className="w-3.5 h-3.5" /> Sign In / Register
                </button>
              </div>
              <span className="text-[10px] text-slate-400">Farmer Helpline · <span className="font-bold text-emerald-600 dark:text-emerald-400">1962 (Toll Free)</span></span>
            </div>
          </div>
        </header>

        {/* ===== NAV MENU BAR ===== */}
        <nav className="bg-[#0a58a0] text-white shadow sticky top-0 z-30">
          <div className="w-full px-4 flex items-center text-[12px] font-semibold overflow-x-auto custom-scrollbar">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.id} id={l.id} label={l.label} icon={l.icon}
                baseCls={'px-3.5 py-2.5 hover:bg-white/10 whitespace-nowrap inline-flex items-center gap-1.5' + (module === 'home' && l.id === 'home' ? ' bg-white/20' : '')} />
            ))}
            <a href="#" onClick={(e) => e.preventDefault()} className="px-3.5 py-2.5 hover:bg-white/10 whitespace-nowrap ml-auto inline-flex items-center gap-1.5">
              <Icon name="search" className="w-3 h-3" /> Search
            </a>
          </div>
        </nav>

        {/* ===== PANES ===== */}
        {module === 'home' ? <HomePane heroIdx={heroIdx} heroImgSrc={heroImgSrc} imgReady={imgReady} heroDotOver={heroDotOver} setHeroDotOver={setHeroDotOver} setHeroIdx={setHeroIdx} showHome={showHome} startLogin={startLogin} /> : <ModulePanes id={module} />}
      </div>
    </div>
  )
}