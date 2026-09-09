import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import AIHelpDesk from '../components/AIHelpDesk'
import ModulePanes from './LandingPanes'
import {
  Shield, MapPin, Syringe, Truck, Phone, Mail, Moon, Sun, LogIn, Home, ShieldAlert,
  FlaskConical, BarChart3, User, Search, Megaphone, AlertTriangle, Bug, Radio,
  PhoneCall, ArrowRight, Zap, Globe, Grid3x3, Sparkles, Radar, Command, Tractor,
  Workflow, FilePlus2, Microscope, Navigation, ShieldCheck, Users, UserCheck,
  Activity, ChevronDown, ChevronRight, Building2, Twitter, Facebook, Youtube
} from 'lucide-react'

const navLinks = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'gis-map', label: 'PashuSahaya GIS Map', icon: MapPin },
  { id: 'nadcp', label: 'NADCP Drive', icon: Syringe },
  { id: 'outbreak', label: 'Outbreak Alerts', icon: ShieldAlert },
  { id: 'mvu', label: 'MVU Dispatch', icon: Truck },
  { id: 'vet-lab', label: 'Vet Lab', icon: FlaskConical },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'farmers', label: 'For Farmers', icon: User },
  { id: 'officer', label: 'Field Officer', icon: Shield },
]

const modules = [
  {
    title: 'GIS Disease Map',
    icon: MapPin,
    mod: 'gis-map',
    desc: 'District / block / village level outbreak heatmaps with real-time cluster status and vector overlays.',
    grad: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30 hover:shadow-emerald-500/10',
  },
  {
    title: 'NADCP Vaccination',
    icon: Syringe,
    mod: 'nadcp',
    desc: 'Track every dose from cold-chain to cattle tag — coverage cards, milestones and state dashboards.',
    grad: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/30 hover:shadow-blue-500/10',
  },
  {
    title: 'Outbreak Corridor',
    icon: ShieldAlert,
    mod: 'outbreak',
    desc: 'Outbreak alerts mapped along livestock corridors with RRT escalation, containment zones and SOPs.',
    grad: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-500/30 hover:shadow-red-500/10',
  },
  {
    title: 'MVU / RRT Dispatch',
    icon: Truck,
    mod: 'mvu',
    desc: 'Mobile veterinary units and rapid response teams geo-tracked and dispatched to the nearest hotspot.',
    grad: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/30 hover:shadow-amber-500/10',
  },
  {
    title: 'Vet Lab Network',
    icon: FlaskConical,
    mod: 'vet-lab',
    desc: 'Sample intake, chain of custody, RT-PCR and serology results pushed straight to district dashboards.',
    grad: 'from-purple-500 to-fuchsia-600',
    shadow: 'shadow-purple-500/30 hover:shadow-purple-500/10',
  },
  {
    title: 'Reports & Compliance',
    icon: BarChart3,
    mod: 'reports',
    desc: 'Auto-generated weekly coverage cards, milestone reports and regulatory export ready for ministries.',
    grad: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-500/30 hover:shadow-cyan-500/10',
  },
]

const whyCards = [
  {
    title: 'Real-time Intelligence',
    icon: Radar,
    desc: 'Field reports, lab results and GPS feeds converge into one national surveillance picture in seconds.',
  },
  {
    title: 'Command-level Coordination',
    icon: Command,
    desc: 'State, district and block teams act on the same verified data — no telephonic chaos, no duplicated effort.',
  },
  {
    title: 'Farmer-First Mobility',
    icon: Tractor,
    desc: 'Veterinary help and vaccine drives reach the last mile through the nearest MVU and village networks.',
  },
]

const workflowSteps = [
  { num: '01', label: 'Report', icon: FilePlus2, color: 'text-emerald-600', desc: 'Farmers & officers file case / symptom reports from any device, online or offline.' },
  { num: '02', label: 'Analyze', icon: Microscope, color: 'text-blue-600', desc: 'Lab and AI triage pins the pathogen and flags containment risk instantly.' },
  { num: '03', label: 'Dispatch', icon: Navigation, color: 'text-amber-600', desc: 'Nearest RRT / MVU auto-assigned and directed to the exact GPS coordinate.' },
  { num: '04', label: 'Resolve', icon: ShieldCheck, color: 'text-emerald-600', desc: 'Vaccination, quarantine and follow-up close the case on record — fully audit-able.' },
]

const roles = [
  { title: 'District V.O.', icon: Shield, color: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300', desc: 'Monitor district health, approve action plans, track coverage cards.' },
  { title: 'Field Officer', icon: UserCheck, color: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300', desc: 'Report cases on the spot, receive RRT alerts, submit proof of vaccination.' },
  { title: 'Laboratory', icon: FlaskConical, color: 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300', desc: 'Log sample status, push diagnostic results, keep audit trails clean.' },
  { title: 'Farmers', icon: Tractor, color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300', desc: 'Report sick animals, get injection reminders and nearest-vet directions.' },
]

const diseaseTags = [
  { name: 'FMD', dot: 'bg-red-500' },
  { name: 'LSD', dot: 'bg-purple-500' },
  { name: 'PPR', dot: 'bg-amber-500' },
  { name: 'BQ', dot: 'bg-blue-500' },
  { name: 'Anthrax', dot: 'bg-orange-500' },
  { name: 'Brucellosis', dot: 'bg-green-600' },
  { name: 'Avian Flu', dot: 'bg-teal-500' },
]

const diseaseGrid = [
  { code: 'FMD', name: 'Foot & Mouth Disease', cls: 'text-red-600' },
  { code: 'LSD', name: 'Lumpy Skin Disease', cls: 'text-purple-600' },
  { code: 'PPR', name: 'Peste des Petits Ruminants', cls: 'text-amber-600' },
  { code: 'BQ', name: 'Black Quarter', cls: 'text-blue-600' },
  { code: 'ANTHRAX', name: 'Zoonotic risk', cls: 'text-orange-600' },
  { code: 'BRUCELLOSIS', name: 'NADCP Targeted', cls: 'text-green-600' },
  { code: 'AVIAN FLU', name: 'HPAI surveillance', cls: 'text-teal-600' },
  { code: 'SWINE FEVER', name: 'ASF / CSF watch', cls: 'text-pink-600' },
  { code: 'MASTITIS', name: 'Milk quality', cls: 'text-indigo-600' },
  { code: 'RABIES', name: 'Post-bite protocol', cls: 'text-neutral-600' },
]

export default function Landing() {
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const [module, setModule] = useState('home')
  const [slide, setSlide] = useState(0)

  const heroSlides = [
    '/img/farms/animal1.jpg',
    '/img/farms/animal2.jpg',
    '/img/farms/animal3.jpg',
    '/img/dashboard/farmer.jpg',
    '/img/lab/lab.jpg',
    '/img/lab/lab2.jpg',
  ]

  const switchModule = (id) => {
    setModule(id)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (module !== 'home') return undefined
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4000)
    return () => clearInterval(t)
  }, [module])

  const quickLinks = [
    { id: 'gis-map', label: 'Live Disease Map', icon: ChevronRight },
    { id: 'nadcp', label: 'NADCP Vaccination Drives', icon: ChevronRight },
    { id: 'outbreak', label: 'Outbreak Alerts', icon: ChevronRight },
    { id: 'mvu', label: 'MVU / RRT Dispatch', icon: ChevronRight },
    { id: 'vet-lab', label: 'Vet Lab Network', icon: ChevronRight },
    { id: 'reports', label: 'Reports & Compliance', icon: ChevronRight },
  ]

  const platformLinks = [
    { id: 'farmers', label: 'For Farmers', icon: ChevronRight },
    { id: 'officer', label: 'Field Officer Access', icon: ChevronRight },
  ]

  return (
    <div className="w-full overflow-x-hidden bg-slate-50 dark:bg-gov-900 text-slate-800 dark:text-slate-200 min-h-screen">
      <div className="shrink-0 bg-[#0a58a0] text-white text-[11px]">
        <div className="w-full px-4 py-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              <Shield className="w-3 h-3 text-emerald-300" /> PashuSahaya<span className="text-emerald-300">&trade;</span> Grid
            </span>
            <span className="hidden md:inline text-blue-200">|</span>
            <a href="#" onClick={() => switchModule('gis-map')} className="hover:underline flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Live GIS Map
            </a>
            <span className="hidden md:inline text-blue-200">|</span>
            <a href="#" onClick={() => switchModule('nadcp')} className="hover:underline hidden md:flex items-center gap-1.5">
              <Syringe className="w-3 h-3" /> NADCP Vaccination
            </a>
            <span className="hidden lg:inline text-blue-200">|</span>
            <a href="#" onClick={() => switchModule('mvu')} className="hover:underline hidden lg:flex items-center gap-1.5">
              <Truck className="w-3 h-3" /> MVU / RRT Dispatch
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300"></span>
              </span>
              Live National Surveillance
            </span>
            <span className="hidden sm:inline text-blue-200">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Farmer Helpline <span className="font-bold">1962</span>
            </a>
            <span className="hidden md:inline text-blue-200">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline hidden md:flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> pashusahaya@gmail.com
            </a>
          </div>
        </div>
      </div>

      <header className="shrink-0 bg-white dark:bg-gov-800 border-b border-slate-200 dark:border-gov-700">
        <div className="w-full px-4 py-4 flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-center text-center shrink-0">
            <div className="logo-glow p-1 rounded-full overflow-hidden bg-white dark:bg-gov-800 border border-slate-200 dark:border-gov-700 shadow-lg shadow-blue-900/10">
              <img src="/img/icon/Neural_Knights.jpeg" alt="PashuSahaya Logo" className="w-16 h-16 rounded-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">National Surveillance Grid</span>
            </div>
            <h1 className="mt-1 text-blue-900 dark:text-blue-300 font-extrabold text-xl md:text-3xl leading-tight">
              PashuSahaya <span className="text-slate-400 dark:text-slate-500 font-medium text-sm md:text-lg">&mdash; Livestock Epidemic Response Platform</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-[11px] md:text-sm">Real-time Disease Surveillance &middot; NADCP Vaccination Tracking &middot; RRT &amp; MVU Dispatch</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} title="Toggle Light / Dark" className="p-2 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gov-700 rounded-full border border-slate-300 dark:border-gov-600 transition">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => navigate('/login')} className="text-[11px] font-bold text-white bg-[#0a58a0] hover:bg-[#0a4a85] px-5 py-2.5 rounded shadow transition inline-flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" /> Sign In / Register
              </button>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Farmer Helpline &middot; <span className="font-bold text-emerald-600 dark:text-emerald-400">1962 (Toll Free)</span></span>
          </div>
        </div>
      </header>

      <nav className="shrink-0 bg-[#0a58a0] text-white shadow sticky top-0 z-30">
        <div className="w-full px-4 flex items-center text-[12px] font-semibold overflow-x-auto custom-scrollbar">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={() => switchModule(item.id)}
              className={`px-3.5 py-2.5 hover:bg-white/10 whitespace-nowrap inline-flex items-center gap-1.5 ${module === item.id ? 'bg-white/20 nav-active' : ''}`}
            >
              <item.icon className="w-3 h-3" /> {item.label}
            </a>
          ))}
          <a href="#" onClick={(e) => e.preventDefault()} className="px-3.5 py-2.5 hover:bg-white/10 whitespace-nowrap ml-auto inline-flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Search
          </a>
        </div>
      </nav>

      <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar">
        <div className="bg-amber-50 dark:bg-gov-800 border-b border-amber-200 dark:border-gov-700">
          <div className="w-full px-4 py-1.5 flex items-center gap-3 text-[11px]">
            <span className="shrink-0 inline-flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15 px-2 py-0.5 rounded">
              <Megaphone className="w-3.5 h-3.5" /> Advisory
            </span>
            <div className="overflow-hidden whitespace-nowrap flex-1 relative">
              <div className="ticker-track inline-flex items-center gap-8 animate-marquee-40s whitespace-nowrap">
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" /> Lumpy Skin Disease (LSD) outbreak reported in <b>Deoghar, Jharkhand</b> - 17 active clusters</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Syringe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> NADCP Round-VIII vaccination drive active across 26 states - vaccination coverage at <b>46.8%</b></span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Truck className="w-3 h-3 text-blue-700 dark:text-blue-300" /> 12 MVUs dispatched to West Bengal flood-affected areas for emergency relief</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Bug className="w-3 h-3 text-purple-600 dark:text-purple-400" /> FMD sero-surveillance round II underway - lab samples tracking on PashuSahaya</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-cyan-700 dark:text-cyan-300" /> District veterinary officers asked to upload weekly coverage cards by <b>Friday 17:00 IST</b></span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><PhoneCall className="w-3 h-3 text-red-600 dark:text-red-400" /> Farmer Helpline 1962 - 24x7 toll free for quarantine &amp; vaccination guidance</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" /> Lumpy Skin Disease (LSD) outbreak reported in <b>Deoghar, Jharkhand</b> - 17 active clusters</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Syringe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> NADCP Round-VIII vaccination drive active across 26 states - vaccination coverage at <b>46.8%</b></span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Truck className="w-3 h-3 text-blue-700 dark:text-blue-300" /> 12 MVUs dispatched to West Bengal flood-affected areas for emergency relief</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Bug className="w-3 h-3 text-purple-600 dark:text-purple-400" /> FMD sero-surveillance round II underway - lab samples tracking on PashuSahaya</span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-cyan-700 dark:text-cyan-300" /> District veterinary officers asked to upload weekly coverage cards by <b>Friday 17:00 IST</b></span>
                <span className="text-amber-500">&bull;</span>
                <span className="flex items-center gap-1.5"><PhoneCall className="w-3 h-3 text-red-600 dark:text-red-400" /> Farmer Helpline 1962 - 24x7 toll free for quarantine &amp; vaccination guidance</span>
                <span className="text-amber-500">&bull;</span>
              </div>
            </div>
          </div>
        </div>

        {module === 'home' ? (
          <>
        <section className="flex-1 w-full px-4 py-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-gov-700">
            <img
              key={heroSlides[slide]}
              src={heroSlides[slide]}
              alt="Livestock district surveillance banner"
              className="w-full h-56 md:h-80 object-cover transition-opacity duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"></div>
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
              {heroSlides.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlide(i)}
                  className={`rounded-full shadow transition-all ${i === slide ? 'w-4 bg-white ring-1 ring-black/30' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                  style={{ height: 8 }}
                  aria-label={`Slide ${i + 1}`}
                ></button>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 z-10">
              <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                PashuSahaya &middot; LIVE NATIONAL SURVEILLANCE
              </span>
              <h2 className="mt-2.5 text-white font-extrabold text-lg md:text-3xl leading-tight">Protect Every Herd &mdash;
                <span className="text-emerald-300">Detect, Contain, Vaccinate, Respond</span></h2>
              <p className="mt-1.5 text-white/85 text-[11px] md:text-sm max-w-xl">PashuSahaya unifies outbreak detection, containment command, NADCP vaccination tracking and MVU rapid response &mdash; so district teams and farmers act on verified, real-time intelligence.</p>
              <div className="mt-3.5 flex flex-wrap gap-3">
                <button onClick={() => navigate('/login')} className="group inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 ring-1 ring-white/30 hover:shadow-xl hover:from-emerald-400 hover:to-emerald-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> Get Started
                </button>
                <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/10 border border-white/40 px-6 py-2.5 rounded-lg backdrop-blur-sm hover:bg-white/25 hover:border-white/70 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Field Officer Access
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gov-900 border border-slate-200 dark:border-gov-700 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/30 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0a58a0] to-[#0e7bb5] text-white px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Quick Access
                </span>
                <span className="text-[9px] font-bold bg-white/15 ring-1 ring-white/30 px-2 py-0.5 rounded-full">4 MODULES</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <a href="#" onClick={() => switchModule('gis-map')} className="block p-2.5 rounded-lg bg-slate-50 dark:bg-gov-800 hover:bg-blue-50 dark:hover:bg-gov-700 ring-1 ring-slate-200 dark:ring-gov-700 transition">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">GIS Disease Map</span>
                  </div>
                  <span className="block text-[13px] font-extrabold text-slate-800 dark:text-white mt-1">12 Active Outbreak Clusters</span>
                </a>
                <a href="#" onClick={() => switchModule('nadcp')} className="block p-2.5 rounded-lg bg-slate-50 dark:bg-gov-800 hover:bg-blue-50 dark:hover:bg-gov-700 ring-1 ring-slate-200 dark:ring-gov-700 transition">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">NADCP</span>
                  </div>
                  <span className="block text-[13px] font-extrabold text-slate-800 dark:text-white mt-1">Vaccination @ 46.8%</span>
                </a>
                <a href="#" onClick={() => switchModule('mvu')} className="block p-2.5 rounded-lg bg-slate-50 dark:bg-gov-800 hover:bg-blue-50 dark:hover:bg-gov-700 ring-1 ring-slate-200 dark:ring-gov-700 transition">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">MVU Dispatch</span>
                  </div>
                  <span className="block text-[13px] font-extrabold text-slate-800 dark:text-white mt-1">14 Mobile Units Live</span>
                </a>
                <a href="#" onClick={() => switchModule('vet-lab')} className="block p-2.5 rounded-lg bg-slate-50 dark:bg-gov-800 hover:bg-blue-50 dark:hover:bg-gov-700 ring-1 ring-slate-200 dark:ring-gov-700 transition">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vet Lab</span>
                  </div>
                  <span className="block text-[13px] font-extrabold text-slate-800 dark:text-white mt-1">2,840 Samples Tested</span>
                </a>
              </div>
            </div>

            <div className="bg-white dark:bg-gov-900 border border-slate-200 dark:border-gov-700 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/30 p-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0a58a0]" /> National Coverage
                </span>
                <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">LIVE MAP</span>
              </div>
              <div className="mt-2.5 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">736 / 766</h3>
                  <p className="text-[10px] font-semibold text-slate-400">districts reporting on PashuSahaya</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="block w-3 h-3 rounded-sm bg-red-500"></span>
                  <span className="block w-3 h-5 rounded-sm bg-amber-500"></span>
                  <span className="block w-3 h-7 rounded-sm bg-emerald-500"></span>
                  <span className="block w-3 h-9 rounded-sm bg-emerald-600"></span>
                  <span className="block w-3 h-11 rounded-sm bg-blue-600"></span>
                </div>
              </div>
              <div className="mt-2.5 bg-slate-100 dark:bg-gov-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full w-[96%] rounded-full"></div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-gov-800 rounded-lg p-2">
                  <span className="block text-lg font-black text-red-600 dark:text-red-400">546</span>
                  <span className="text-[10px] font-bold text-slate-400">Cases Present</span>
                </div>
                <div className="bg-slate-50 dark:bg-gov-800 rounded-lg p-2">
                  <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">220</span>
                  <span className="text-[10px] font-bold text-slate-400">Zero Cases</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0a58a0]">
          <div className="w-full px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl font-black text-white">736 / 766</div>
              <div className="text-[10px] font-semibold text-blue-200 mt-1">Districts Reporting</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl font-black text-white">1,962</div>
              <div className="text-[10px] font-semibold text-blue-200 mt-1">Veterinary Units On Grid</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl font-black text-white">46.8%</div>
              <div className="text-[10px] font-semibold text-blue-200 mt-1">NADCP Vaccination Coverage</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl font-black text-white">12</div>
              <div className="text-[10px] font-semibold text-blue-200 mt-1">Active Outbreak Clusters</div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gov-900 border-b border-slate-200 dark:border-gov-700">
          <div className="max-w-7xl mx-auto w-full px-4 py-8">
            <div className="text-center mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0a58a0] dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Grid3x3 className="w-3 h-3" /> Core Functional Modules
              </span>
              <h2 className="mt-1.5 text-2xl font-black text-slate-800 dark:text-white">Command, Control &amp; Coverage</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-xs mt-1">Six integrated modules power the national livestock surveillance grid.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod) => (
                <a key={mod.title} href="#" onClick={() => switchModule(mod.mod)} className={`group block bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-2xl p-5 hover:shadow-xl ${mod.shadow} hover:-translate-y-1 transition-all`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.grad} text-white flex items-center justify-center shadow-lg`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-3 font-extrabold text-slate-800 dark:text-white text-sm">{mod.title}</h3>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">{mod.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#0a58a0] dark:text-emerald-400">
                    Explore Module <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0a58a0] text-white">
          <div className="max-w-7xl mx-auto w-full px-4 py-8">
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Why PashuSahaya
              </span>
              <h2 className="mt-1.5 text-2xl font-black">National Command. District Action.</h2>
              <p className="text-blue-100 text-[11px] md:text-xs mt-1">One verdict for every herd &mdash; built for the way India reports, responds and recovers.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {whyCards.map((card) => (
                <div key={card.title} className="bg-white/10 border border-white/15 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-3 font-extrabold text-sm">{card.title}</h3>
                  <p className="mt-1.5 text-[11px] text-blue-100">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gov-900 border-b border-slate-200 dark:border-gov-700">
          <div className="max-w-7xl mx-auto w-full px-4 py-8">
            <div className="text-center mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0a58a0] dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Workflow className="w-3 h-3" /> Operations Workflow
              </span>
              <h2 className="mt-1.5 text-2xl font-black text-slate-800 dark:text-white">Detect &rarr; Contain &rarr; Vaccinate &rarr; Respond</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-xs mt-1">The four-step cycle keeps every district ahead of the next outbreak.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step) => (
                <div key={step.num} className="relative bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-2xl p-5">
                  <span className="text-3xl font-black text-slate-200 dark:text-gov-600">{step.num}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">{step.label}</h3>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-gov-800 border-b border-slate-200 dark:border-gov-700">
          <div className="max-w-7xl mx-auto w-full px-4 py-8">
            <div className="text-center mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0a58a0] dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Users className="w-3 h-3" /> Who It&apos;s For
              </span>
              <h2 className="mt-1.5 text-2xl font-black text-slate-800 dark:text-white">Built For Every Role In The Grid</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-xs mt-1">From the control room to the cattle-shed &mdash; PashuSahaya keeps everyone connected.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map((role) => (
                <div key={role.title} className="bg-white dark:bg-gov-900 border border-slate-200 dark:border-gov-700 rounded-2xl p-5 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full ${role.color} flex items-center justify-center`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-3 font-extrabold text-slate-800 dark:text-white text-sm">{role.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gov-900 border-b border-slate-200 dark:border-gov-700">
          <div className="max-w-7xl mx-auto w-full px-4 py-8">
            <div className="text-center mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0a58a0] dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Activity className="w-3 h-3" /> Diseases Covered
              </span>
              <h2 className="mt-1.5 text-2xl font-black text-slate-800 dark:text-white">National Disease Watch-List</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-xs mt-1">Priority diseases under the National Livestock Mission surveillance framework.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {diseaseTags.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                  <span className={`w-2 h-2 rounded-full ${d.dot}`}></span> {d.name}
                </span>
              ))}
              <button onClick={() => setShowAll((s) => !s)} className="text-[11px] font-bold text-[#0a58a0] dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer">
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} /> View full list
              </button>
            </div>
            {showAll && (
              <div className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {diseaseGrid.map((d) => (
                    <div key={d.code} className="border border-slate-200 dark:border-gov-700 rounded-lg p-3 text-center bg-slate-50 dark:bg-gov-800">
                      <div className={`text-lg font-extrabold ${d.cls}`}>{d.code}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{d.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#0a58a0] to-[#0e7bb5] text-white">
          <div className="max-w-7xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center"><PhoneCall className="w-6 h-6" /></div>
              <div>
                <h2 className="font-black text-lg md:text-xl">Farmer Helpline <span className="text-emerald-300">1962</span></h2>
                <p className="text-blue-100 text-[11px] md:text-xs">24 &times; 7 toll-free &mdash; quarantine, vaccination and emergency support in every language.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#072142] text-white text-[11px]">
          <div className="max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2">
                <img src="/img/icon/Neural_Knights.jpeg" alt="PashuSahaya Logo" className="w-9 h-9 rounded-full object-cover border border-white/20" />
                <div>
                  <p className="font-black text-sm">PashuSahaya</p>
                  <p className="text-white/50 text-[9px]">National Surveillance Grid</p>
                </div>
              </div>
              <p className="mt-3 text-white/60 text-[10px] leading-relaxed">A National Digital Livestock Mission initiative unifying disease surveillance, vaccination tracking and rapid response across India.</p>
              <div className="mt-3 flex items-center gap-2">
                <a href="#" onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"><Twitter className="w-3.5 h-3.5" /></a>
                <a href="#" onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"><Facebook className="w-3.5 h-3.5" /></a>
                <a href="#" onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"><Youtube className="w-3.5 h-3.5" /></a>
              </div>
            </div>
            <div>
              <h5 className="text-white font-bold mb-2.5 border-b border-white/20 pb-1.5 text-xs">Quick Links</h5>
              <ul className="space-y-1.5">
                {quickLinks.map((link) => (
                  <li key={link.label}><a href="#" onClick={() => switchModule(link.id)} className="hover:underline flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-emerald-300" /> {link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-2.5 border-b border-white/20 pb-1.5 text-xs">Emergency Contacts</h5>
              <ul className="space-y-1.5 text-white/70">
                <li className="flex items-center gap-1.5"><PhoneCall className="w-3 h-3 text-emerald-300" /> Helicopter Line: <b>1962</b></li>
                <li className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-300" /> Animal Helpline: <b>1800-11-1962</b></li>
                <li className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-emerald-300" /> Control Room: <b>011-2331-9921</b></li>
                <li className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-emerald-300" /> pashusahaya@gmail.com</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-2.5 border-b border-white/20 pb-1.5 text-xs">Platform</h5>
              <ul className="space-y-1.5">
                {platformLinks.map((link) => (
                  <li key={link.label}><a href="#" onClick={() => switchModule(link.id)} className="hover:underline flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-emerald-300" /> {link.label}</a></li>
                ))}
                <li><a href="#" onClick={() => navigate('/login')} className="hover:underline flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-emerald-300" /> Command Dashboard</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-emerald-300" /> Help &amp; Support</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-emerald-300" /> Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto w-full px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]">
              <span>PashuSahaya - National Livestock Surveillance Grid - v1.0</span>
              <span className="text-white/50">National Livestock Mission 2026 - All Rights Reserved - Best viewed in Chrome / Firefox</span>
            </div>
          </div>
        </footer>
          </>
        ) : (
        <ModulePanes module={module} />
        )}
      </div>
      <AIHelpDesk />
    </div>
  )
}
