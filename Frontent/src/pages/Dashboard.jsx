import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import AIHelpDesk from '../components/AIHelpDesk'
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, Tooltip, Polyline, LayerGroup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Home,
  Syringe,
  FlaskConical,
  BarChart3,
  Truck,
  FileText,
  Bell,
  BellRing,
  User,
  ChevronDown,
  Moon,
  Sun,
  PanelLeftClose,
  Search,
  Download,
  PlusCircle,
  Filter,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Radar,
  Flame,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Landmark,
  Stethoscope,
  Inbox,
  Timer,
  RefreshCw,
  SatelliteDish,
  Building2,
  Fingerprint,
  Tag,
  RadioTower,
  TrendingUp,
  PawPrint,
  Beef,
  ArrowRight,
  Baby,
  BookOpen,
  Brain,
  Bug,
  ChartLine,
  Clock,
  Cpu,
  Dna,
  Eye,
  Hourglass,
  Navigation,
  ShieldCheck,
  Snowflake,
  Target,
  Thermometer,
  TrendingDown,
  Users,
  Bird,
  Fish,
  Rabbit,
  Footprints,
  Info,
  Wheat,
  Images,
  Siren,
  Scale,
  FileCheck,
  CheckCircle2,
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, ChartLegend)

const navItems = [
  { id: 'dashboard', label: 'Surveillance Dashboard', icon: LayoutDashboard },
  { id: 'gis-map', label: 'GIS Disease Map', icon: Map, live: true },
  { id: 'cases', label: 'Case Registry & Alerts', icon: ClipboardList },
  { id: 'farms', label: 'Animals · All India', icon: Home },
  { id: 'vaccination', label: 'NADCP Vaccination Drive', icon: Syringe },
  { id: 'lab', label: 'Lab Diagnostic Workflow', icon: FlaskConical },
  { id: 'analytics', label: 'Epidemiology Analytics', icon: BarChart3 },
]

const fieldItems = [
  { id: 'mvu', label: 'Live Vet Field Updates', icon: Truck },
  { id: 'reports', label: 'Outbreak Bulletins', icon: FileText },
]

const notifications = [
  { title: 'FMD Serotype O Confirmed', desc: 'Barmer District, Rajasthan · 14 cattle showing clinical lesions.', time: '12 mins ago', tone: 'red' },
  { title: 'Avian Influenza H5N1 Suspected', desc: 'Alappuzha, Kerala · Mortality in commercial duck farm.', time: '45 mins ago', tone: 'orange' },
  { title: 'Brucellosis Cluster Warning', desc: 'Mehsana, Gujarat · 5 bovines third-trimester abortions.', time: '2 hours ago', tone: 'amber' },
]

const focusSlides = [
  {
    icon: ShieldAlert,
    title: 'Foot & Mouth Disease (FMD)',
    desc: 'Highly contagious viral infection affecting cattle, buffalo, sheep & goats. Blisters on mouth and feet.',
    index: 'L2',
    severity: 'Critical',
    stat: 'Affected: 14 Clusters',
    spread: 'Vaccine Cover: 84.6%',
    img: 'img/cases/cow.png',
    iconColor: 'text-amber-400',
  },
  {
    icon: ShieldAlert,
    title: 'Lumpy Skin Disease (LSD)',
    desc: 'Poxviral infection of cattle characterised by cutaneous nodules, fever and emaciation.',
    index: 'L3',
    severity: 'High',
    stat: 'Affected: 38 Clusters',
    spread: 'Vaccine Cover: 71.2%',
    img: 'img/goverment/Veterinarian%20Examining%20Animal%20Skin%20Disease.png',
    iconColor: 'text-orange-400',
  },
  {
    icon: ShieldAlert,
    title: 'Brucellosis (Bang Disease)',
    desc: 'Bacterial zoonosis causing abortions and infertility in bovines. Sero-surveillance active.',
    index: 'L2',
    severity: 'Moderate',
    stat: 'Affected: 5 Clusters',
    spread: 'Vaccine Cover: 75.6%',
    img: 'img/goverment/Human%20Hospital%20and%20Animal%20Hospital%20Coordination.png',
    iconColor: 'text-sky-400',
  },
  {
    icon: ShieldAlert,
    title: 'Peste des Petits Ruminants (PPR)',
    desc: 'Contagious viral disease of sheep and goats with pneumo-enteritis syndrome.',
    index: 'L4',
    severity: 'Watch',
    stat: 'Affected: 3 Clusters',
    spread: 'Vaccine Cover: 82.1%',
    img: 'img/goverment/Community%20Animal%20Health%20Meeting.png',
    iconColor: 'text-emerald-400',
  },
]

const outbreaks = [
  { id: 'OB-2026-089', loc: 'Barmer, Rajasthan', disease: 'Foot & Mouth (FMD)', species: 'Cattle / Buffalo', risk: 'CRITICAL', riskCls: 'bg-red-600 border border-red-700', containment: 'Quarantine Enforced', contCls: 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200' },
  { id: 'OB-2026-077', loc: 'Mehsana, Gujarat', disease: 'Lumpy Skin (LSD)', species: 'Bovine', risk: 'HIGH', riskCls: 'bg-orange-500 border border-orange-600', containment: 'Ring Vaccination', contCls: 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200' },
  { id: 'OB-2026-064', loc: 'Alappuzha, Kerala', disease: 'Avian Influenza (H5N1)', species: 'Poultry / Avian', risk: 'CRITICAL', riskCls: 'bg-red-600 border border-red-700', containment: 'Culling Zone Active', contCls: 'text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200' },
  { id: 'OB-2026-052', loc: 'Kamrup, Assam', disease: 'African Swine Fever', species: 'Swine / Pigs', risk: 'HIGH', riskCls: 'bg-orange-500 border border-orange-600', containment: 'Movement Ban', contCls: 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200' },
  { id: 'OB-2026-041', loc: 'Dharwad, Karnataka', disease: 'Bluetongue Virus', species: 'Sheep & Goat', risk: 'LOW', riskCls: 'bg-emerald-600 border border-emerald-700', containment: 'Symptomatic Care', contCls: 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' },
]

const triageCards = [
  { id: 'CS-2026-9921', img: 'img/cases/cow.png', tag: 'FMD · Foot-and-Mouth Disease', tagCls: 'bg-red-600 text-white', status: 'LAB CONFIRMED', statusCls: 'bg-red-600 text-white', title: 'Bovine (Gir Cow), Ear Tag 1009-8829-4410', desc: 'High Fever, Blisters on Tongue, Salivation', owner: 'Dr. A. Sharma (MVU-14)', border: 'border-l-red-500' },
  { id: 'CS-2026-9918', img: 'img/cases/dog.png', tag: 'PPR · Goat Plague', tagCls: 'bg-amber-500 text-white', status: 'SAMPLE EN ROUTE', statusCls: 'bg-amber-500 text-white', title: 'Caprine (Sirohi Goat), Ear Tag 1009-4412-0092', desc: 'Nasal Discharge, Ocular Secretion, Diarrhea', owner: 'Pashu Sakhi Sunita', border: 'border-l-amber-400' },
  { id: 'CS-2026-9905', img: 'img/cases/brid.png', tag: 'LSD · Lumpy Skin Disease', tagCls: 'bg-blue-600 text-white', status: 'UNDER INVESTIGATION', statusCls: 'bg-blue-600 text-white', title: 'Bovine (Murrah Buffalo), Ear Tag 1009-7718-3321', desc: 'Cutaneous Nodule Lesions', owner: 'Dr. R. Verma (Block Vet)', border: 'border-l-blue-500' },
  { id: 'CS-2026-9902', img: 'img/cases/cat.png', tag: 'FCV · Feline Calicivirus', tagCls: 'bg-violet-600 text-white', status: 'SAMPLE EN ROUTE', statusCls: 'bg-violet-600 text-white', title: 'Feline (Domestic Cat), Ear Tag 1009-0204-7744', desc: 'Oral Ulcers, Ocular Discharge, Sneezing', owner: 'Dr. M. Iyer (MVU-21)', border: 'border-l-violet-500' },
]

const caseRegistry = [
  { id: 'CS-2026-9921', tag: '1009-8829-4410 / Bovine (Gir Cow)', sym: 'High Fever, Blisters, Salivation', symCls: 'text-red-700 dark:text-red-400', auth: 'Dr. A. Sharma (MVU-14)', status: 'LAB CONFIRMED', statusCls: 'bg-red-600 text-white' },
  { id: 'CS-2026-9918', tag: '1009-4412-0092 / Caprine (Sirohi Goat)', sym: 'Nasal Discharge, Diarrhea', symCls: 'text-amber-700 dark:text-amber-400', auth: 'Pashu Sakhi Sunita', status: 'SAMPLE EN ROUTE', statusCls: 'bg-amber-500 text-white' },
  { id: 'CS-2026-9911', tag: '1009-5566-1024 / Swine (Desi)', sym: 'Sudden Mortality, Haemorrhagic Spots', symCls: 'text-red-700 dark:text-red-400', auth: 'Dr. N. Das (Kamrup)', status: 'CRITICAL', statusCls: 'bg-red-600 text-white' },
  { id: 'CS-2026-9905', tag: '1009-7718-3321 / Bovine (Murrah Buffalo)', sym: 'Cutaneous Nodule Lesions', symCls: 'text-slate-700 dark:text-slate-300', auth: 'Dr. R. Verma (Block Vet)', status: 'UNDER INVESTIGATION', statusCls: 'bg-blue-600 text-white' },
  { id: 'CS-2026-9899', tag: '1009-2203-7788 / Ovine (Marwari Sheep)', sym: 'Fever, Oculo-nasal Discharge', symCls: 'text-amber-700 dark:text-amber-400', auth: 'Pashu Sakhi Rekha', status: 'NEW ALERT', statusCls: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
]

const caseDetailData = {
  'CS-2026-9921': { status: 'LAB CONFIRMED', statusCls: 'bg-red-600 text-white', title: 'Case CS-2026-9921', img: 'img/cases/cow.png', disease: 'FMD · Foot-and-Mouth Disease', diseaseTagCls: 'bg-red-600 text-white', id: 'CS-2026-9921', species: 'Bovine (Gir Cow)', tag: '1009-8829-4410', officer: 'Dr. A. Sharma (MVU-14)', loc: 'Barmer, Rajasthan', lat: '25.7520', lng: '71.3924', access: 'view-only', symptoms: ['High Fever', 'Blisters on Tongue', 'Salivation', 'Lameness'], summary: 'Laboratory-confirmed Foot-and-Mouth Disease in a Gir cow. Vesicular lesions on tongue confirmed via RT-PCR (IVRI-2026-8941). Animal isolated, supportive therapy started. Ring vaccination and 5km quarantine zone in effect.' },
  'CS-2026-9918': { status: 'SAMPLE EN ROUTE', statusCls: 'bg-amber-500 text-white', title: 'Case CS-2026-9918', img: 'img/cases/dog.png', disease: 'PPR · Goat Plague', diseaseTagCls: 'bg-amber-500 text-white', id: 'CS-2026-9918', species: 'Caprine (Sirohi Goat)', tag: '1009-4412-0092', officer: 'Pashu Sakhi Sunita', loc: 'Sirohi, Rajasthan', lat: '24.8850', lng: '72.8584', access: 'Track available', symptoms: ['Nasal Discharge', 'Ocular Secretion', 'Diarrhea', 'Pyrexia'], summary: 'Suspected Peste des Petits Ruminants (goat plague) in a Sirohi goat. Sample collected and en route to IVRI regional lab; PCR confirmation pending. Livestock SDS (Sunita) monitoring herd; suspect batch segregated.' },
  'CS-2026-9911': { status: 'CRITICAL', statusCls: 'bg-red-600 text-white', title: 'Case CS-2026-9911', img: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%2364748b%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2728%27 text-anchor=%27middle%27%3EASF%20%C2%B7%20Kamrup%3C/text%3E%3C/svg%3E', disease: 'ASF · African Swine Fever', diseaseTagCls: 'bg-red-600 text-white', id: 'CS-2026-9911', species: 'Swine (Desi)', tag: '1009-5566-1024', officer: 'Dr. N. Das (Kamrup)', loc: 'Kamrup, Assam', lat: '26.1300', lng: '91.7900', access: 'restricted', symptoms: ['Sudden Mortality', 'Haemorrhagic Spots', 'High Fever', 'Anorexia'], summary: 'Multiple sudden deaths reported in a backyard swine holding in Kamrup, Assam. ASF suspected on clinical grounds; samples dispatched for PCR. Culling protocol under review and biosecurity zone notified.' },
  'CS-2026-9905': { status: 'UNDER INVESTIGATION', statusCls: 'bg-blue-600 text-white', title: 'Case CS-2026-9905', img: 'img/cases/brid.png', disease: 'LSD · Lumpy Skin Disease', diseaseTagCls: 'bg-blue-600 text-white', id: 'CS-2026-9905', species: 'Bovine (Murrah Buffalo)', tag: '1009-7718-3321', officer: 'Dr. R. Verma (Block Vet)', loc: 'Mehsana, Gujarat', lat: '23.5880', lng: '72.3693', access: 'view-only', symptoms: ['Cutaneous Nodule Lesions', 'Low-grade Fever', 'Reduced Appetite'], summary: 'Multiple firm cutaneous nodules over dorsum and neck of a Murrah buffalo, consistent with Lumpy Skin Disease. Field re-visit pending; anti-LSD vaccination status under review. Vector-control zone flagged for follow-up.' },
  'CS-2026-9899': { status: 'NEW ALERT', statusCls: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200', title: 'Case CS-2026-9899', img: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27400%27%3E%3Crect width=%27600%27 height=%27400%27 fill=%27%234b5563%27/%3E%3Ctext x=%27300%27 y=%27210%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2728%27 text-anchor=%27middle%27%3EPPR%20%C2%B7%20Suspected%3C/text%3E%3C/svg%3E', disease: 'PPR · Peste des Petits Ruminants', diseaseTagCls: 'bg-amber-500 text-white', id: 'CS-2026-9899', species: 'Ovine (Marwari Sheep)', tag: '1009-2203-7788', officer: 'Pashu Sakhi Rekha', loc: 'Jodhpur, Rajasthan', lat: '26.2400', lng: '73.0200', access: 'view-only', symptoms: ['Fever', 'Oculo-nasal Discharge', 'Coughing', 'Anorexia'], summary: 'A Marwari sheep in a Jodhpur flock presenting with fever and oculo-nasal discharge, clinically consistent with Peste des Petits Ruminants. Oral swab collected by Pashu Sakhi Rekha and sent for lab confirmation; flock under observation.' },
  'CS-2026-9902': { status: 'SAMPLE EN ROUTE', statusCls: 'bg-violet-600 text-white', title: 'Case CS-2026-9902', img: 'img/cases/cat.png', disease: 'FCV · Feline Calicivirus', diseaseTagCls: 'bg-violet-600 text-white', id: 'CS-2026-9902', species: 'Feline (Domestic Cat)', tag: '1009-0204-7744', officer: 'Dr. M. Iyer (MVU-21)', loc: 'Alappuzha, Kerala', lat: '9.4985', lng: '76.3384', access: 'view-only', symptoms: ['Oral Ulcers', 'Ocular Discharge', 'Sneezing', 'Drooling'], summary: 'Suspected Feline Calicivirus with lingual ulceration and ocular discharge in a domestic cat. Oropharyngeal swab en route for PCR. Symptomatic care initiated; littermates under 48h observation.' },
}

const farmRows = [
  [
    { name: 'Bovine', pct: '40%', grad: 'linear-gradient(135deg,#34d399 0%,#059669 50%,#0b1026 100%)', icon: Beef },
    { name: 'Buffalo', pct: '18%', grad: 'linear-gradient(135deg,#38bdf8 0%,#0284c7 50%,#0b1026 100%)', icon: Beef },
    { name: 'Ovine', pct: '13%', grad: 'linear-gradient(135deg,#60a5fa 0%,#2563eb 50%,#0b1026 100%)', icon: PawPrint },
    { name: 'Caprine', pct: '9%', grad: 'linear-gradient(135deg,#fbbf24 0%,#d97706 50%,#0b1026 100%)', icon: PawPrint },
    { name: 'Swine', pct: '5%', grad: 'linear-gradient(135deg,#fb7185 0%,#e11d48 50%,#0b1026 100%)', icon: PawPrint },
  ],
  [
    { name: 'Poultry', pct: '4%', grad: 'linear-gradient(135deg,#a78bfa 0%,#7c3aed 50%,#0b1026 100%)', icon: Bird },
    { name: 'Equine', pct: '3%', grad: 'linear-gradient(135deg,#818cf8 0%,#4f46e5 50%,#0b1026 100%)', icon: PawPrint },
    { name: 'Camel', pct: '2%', grad: 'linear-gradient(135deg,#2dd4bf 0%,#0d9488 50%,#0b1026 100%)', icon: Footprints },
    { name: 'Yak', pct: '2%', grad: 'linear-gradient(135deg,#f472b6 0%,#db2777 50%,#0b1026 100%)', icon: Beef },
    { name: 'Mithun', pct: '2%', grad: 'linear-gradient(135deg,#22d3ee 0%,#0891b2 50%,#0b1026 100%)', icon: Beef },
  ],
  [
    { name: 'Pisciculture', pct: '1%', grad: 'linear-gradient(135deg,#7dd3fc 0%,#0ea5e9 50%,#0b1026 100%)', icon: Fish },
    { name: 'Apiculture', pct: '1%', grad: 'linear-gradient(135deg,#fdba74 0%,#ea580c 50%,#0b1026 100%)', icon: Bug },
    { name: 'Rabbit', pct: '1%', grad: 'linear-gradient(135deg,#f472b6 0%,#db2777 50%,#0b1026 100%)', icon: Rabbit },
    { name: 'Emu', pct: '1%', grad: 'linear-gradient(135deg,#fb7185 0%,#e11d48 50%,#0b1026 100%)', icon: Bird },
    { name: 'Backyard Poultry', pct: '1%', grad: 'linear-gradient(135deg,#34d399 0%,#0d9488 50%,#0b1026 100%)', icon: Bird },
  ],
]

const farmHoldings = [
  { id: 'HD-2026-3401', dist: 'Barmer, Rajasthan', owner: 'Ramesh Patel', n: '18', tag: 'SYNCED', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { id: 'HD-2026-3387', dist: 'Mehsana, Gujarat', owner: 'K. Shah', n: '42', tag: 'SYNCED', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { id: 'HD-2026-3355', dist: 'Alappuzha, Kerala', owner: 'S. Pillai', n: '220', tag: 'PENDING', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  { id: 'HD-2026-3309', dist: 'Kamrup, Assam', owner: 'N. Das', n: '11', tag: 'SYNCED', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
]

const gisStats = [
  { label: 'Active Clusters', value: '14', sub: 'live confirmed', bar: '#f43f5e', icon: Radar, dot: 'bg-rose-400' },
  { label: 'Districts', value: '736', suffix: '/766', sub: 'grid coverage', bar: '#38bdf8', icon: Map, dot: 'bg-sky-400' },
  { label: 'Risk Zones', value: '38', sub: 'heat-zones active', bar: '#f59e0b', icon: Flame, dot: 'bg-amber-400' },
  { label: 'MVU Fleet', value: '1,962', sub: 'GPS tracked units', bar: '#a78bfa', icon: Truck, dot: 'bg-violet-400' },
  { label: 'Live Coverage', value: '96.1', suffix: '%', sub: 'field grid · refreshed 2m ago', bar: '#34d399', icon: SatelliteDish, dot: 'bg-emerald-400' },
]

const wm = (name) => `https://commons.wikimedia.org/wiki/Special:FilePath/${name}?width=640`

const speciesFallback = {
  Cattle: 'img/farms/animal2.jpg',
  Buffalo: 'img/cases/cow.png',
  Goat: 'img/dashboard/farmer.jpg',
  Sheep: 'img/farms/animal1.jpg',
  Poultry: 'img/lab/lab2.jpg',
}

const indiaAnimalStats = [
  { label: 'Cattle', value: '193.46', unit: 'M', img: wm('Cattle_(1).jpg'), bar: '#34d399', dot: 'bg-emerald-400' },
  { label: 'Buffalo', value: '109.85', unit: 'M', img: wm('Water_buffalo_calf,_India.jpg'), bar: '#38bdf8', dot: 'bg-sky-400' },
  { label: 'Goat', value: '148.88', unit: 'M', img: wm('Goat_01.jpg'), bar: '#fbbf24', dot: 'bg-amber-400' },
  { label: 'Sheep', value: '74.26', unit: 'M', img: wm('Sheep.jpg'), bar: '#a78bfa', dot: 'bg-violet-400' },
  { label: 'Poultry', value: '851.81', unit: 'M', img: wm('Chicken.jpg'), bar: '#fb7185', dot: 'bg-rose-400' },
]

const indiaMapPins = [
  { name: 'Uttar Pradesh', cap: 'Lucknow', lat: 26.85, lng: 80.95, pop: '30.1M', top: 'Cattle 18.1M', cls: 'bg-emerald-400' },
  { name: 'Rajasthan', cap: 'Jaipur', lat: 26.91, lng: 75.79, pop: '57.3M', top: 'Cattle 13.9M', cls: 'bg-emerald-400' },
  { name: 'Madhya Pradesh', cap: 'Bhopal', lat: 23.25, lng: 77.41, pop: '18.6M', top: 'Cattle 9.1M', cls: 'bg-emerald-400' },
  { name: 'Bihar', cap: 'Patna', lat: 25.59, lng: 85.14, pop: '12.4M', top: 'Cattle 7.3M', cls: 'bg-emerald-400' },
  { name: 'Andhra Pradesh', cap: 'Amaravati', lat: 16.51, lng: 80.52, pop: '40.6M', top: 'Goat 14.1M', cls: 'bg-amber-400' },
  { name: 'Karnataka', cap: 'Bengaluru', lat: 12.97, lng: 77.59, pop: '29.7M', top: 'Poultry 89M', cls: 'bg-rose-400' },
  { name: 'Punjab', cap: 'Chandigarh', lat: 30.73, lng: 76.78, pop: '9.1M', top: 'Buffalo 5.2M', cls: 'bg-sky-400' },
  { name: 'Assam', cap: 'Guwahati', lat: 26.14, lng: 90.79, pop: '18.8M', top: 'Pig 1.1M', cls: 'bg-violet-400' },
]

const caseStats = [
  { label: 'Open Cases', value: '14', sub: 'active triage', bar: '#f59e0b', icon: Inbox, dot: 'bg-amber-400' },
  { label: 'Lab Confirmed', value: '7', sub: 'PCR positive', bar: '#f87171', icon: FlaskConical, dot: 'bg-rose-400' },
  { label: 'Under Investigation', value: '4', sub: 'field follow-up', bar: '#60a5fa', icon: Radar, dot: 'bg-sky-400' },
  { label: 'Avg Resolution', value: '48', suffix: 'h', sub: 'case to closure', bar: '#34d399', icon: Timer, dot: 'bg-emerald-400' },
]

const gisClusters = [
  { id: 'Barmer', d: 'FMD · Barmer cluster', loc: 'Barmer, Rajasthan', lat: 25.752, lng: 71.3924, sev: 'severe', risk: 92, trend: 'up', cases: 5, caseId: 'CS-2026-9921' },
  { id: 'Kutch', d: 'FMD · Kutch border', loc: 'Kutch, Gujarat', lat: 23.24, lng: 69.67, sev: 'severe', risk: 95, trend: 'up', cases: 7 },
  { id: 'Guwahati', d: 'ASF · Guwahati cluster', loc: 'Guwahati, Assam', lat: 26.14, lng: 91.74, sev: 'severe', risk: 90, trend: 'up', cases: 4 },
  { id: 'Kamrup', d: 'ASF · Kamrup cluster', loc: 'Kamrup, Assam', lat: 26.13, lng: 91.79, sev: 'severe', risk: 89, trend: 'up', cases: 6, caseId: 'CS-2026-9911' },
  { id: 'Hyderabad', d: 'FMD · Hyderabad cluster', loc: 'Hyderabad, Telangana', lat: 17.39, lng: 78.49, sev: 'severe', risk: 87, trend: 'up', cases: 4 },
  { id: 'Ludhiana', d: 'FMD · Ludhiana cluster', loc: 'Ludhiana, Punjab', lat: 30.9, lng: 75.85, sev: 'severe', risk: 86, trend: 'up', cases: 4 },
  { id: 'Ajmer', d: 'PPR · Ajmer cluster', loc: 'Ajmer, Rajasthan', lat: 26.45, lng: 74.64, sev: 'severe', risk: 85, trend: 'up', cases: 4 },
  { id: 'Nashik', d: 'FMD · Nashik cluster', loc: 'Nashik, Maharashtra', lat: 20.0, lng: 73.78, sev: 'severe', risk: 84, trend: 'up', cases: 5 },
  { id: 'Patna', d: 'FMD · Patna cluster', loc: 'Patna, Bihar', lat: 25.59, lng: 85.14, sev: 'high', risk: 81, trend: 'down', cases: 2 },
  { id: 'Mehsana', d: 'LSD · Mehsana cluster', loc: 'Mehsana, Gujarat', lat: 23.588, lng: 72.3693, sev: 'high', risk: 78, trend: 'down', cases: 4, caseId: 'CS-2026-9905' },
  { id: 'Imphal', d: 'ASF · Imphal cluster', loc: 'Imphal, Manipur', lat: 24.82, lng: 93.94, sev: 'high', risk: 77, trend: 'down', cases: 2 },
  { id: 'Sirohi', d: 'PPR · Sirohi cluster', loc: 'Sirohi, Rajasthan', lat: 24.885, lng: 72.8584, sev: 'high', risk: 76, trend: 'up', cases: 3, caseId: 'CS-2026-9918' },
  { id: 'Mathura', d: 'FMD · Mathura cluster', loc: 'Mathura, Uttar Pradesh', lat: 27.49, lng: 77.67, sev: 'high', risk: 75, trend: 'down', cases: 3 },
  { id: 'Lucknow', d: 'FMD · Lucknow cluster', loc: 'Lucknow, Uttar Pradesh', lat: 26.85, lng: 80.95, sev: 'high', risk: 74, trend: 'down', cases: 3 },
  { id: 'Bhubaneswar', d: 'LSD · Bhubaneswar cluster', loc: 'Bhubaneswar, Odisha', lat: 20.3, lng: 85.83, sev: 'high', risk: 73, trend: 'down', cases: 2 },
  { id: 'Alappuzha', d: 'FCV · Alappuzha cluster', loc: 'Alappuzha, Kerala', lat: 9.4985, lng: 76.3384, sev: 'high', risk: 72, trend: 'down', cases: 2, caseId: 'CS-2026-9902' },
  { id: 'Ranchi', d: 'PPR · Ranchi cluster', loc: 'Ranchi, Jharkhand', lat: 23.36, lng: 85.33, sev: 'high', risk: 72, trend: 'down', cases: 1 },
  { id: 'Varanasi', d: 'PPR · Varanasi cluster', loc: 'Varanasi, Uttar Pradesh', lat: 25.32, lng: 82.99, sev: 'high', risk: 71, trend: 'down', cases: 1 },
  { id: 'Indore', d: 'PPR · Indore cluster', loc: 'Indore, Madhya Pradesh', lat: 22.72, lng: 75.86, sev: 'high', risk: 70, trend: 'down', cases: 1 },
  { id: 'Jhansi', d: 'LSD · Jhansi cluster', loc: 'Jhansi, Uttar Pradesh', lat: 25.45, lng: 78.57, sev: 'moderate', risk: 68, trend: 'down', cases: 2 },
  { id: 'Junagadh', d: 'LSD · Junagadh cluster', loc: 'Junagadh, Gujarat', lat: 21.52, lng: 70.46, sev: 'moderate', risk: 66, trend: 'down', cases: 1 },
  { id: 'Nagpur', d: 'LSD · Nagpur cluster', loc: 'Nagpur, Maharashtra', lat: 21.15, lng: 79.09, sev: 'moderate', risk: 65, trend: 'down', cases: 1 },
  { id: 'Raipur', d: 'LSD · Raipur cluster', loc: 'Raipur, Chhattisgarh', lat: 21.25, lng: 81.63, sev: 'moderate', risk: 64, trend: 'down', cases: 1 },
  { id: 'Anand', d: 'FMD · Anand cluster', loc: 'Anand, Gujarat', lat: 22.56, lng: 72.95, sev: 'moderate', risk: 63, trend: 'down', cases: 2 },
  { id: 'Nagaur', d: 'PPR · Nagaur cluster', loc: 'Nagaur, Rajasthan', lat: 27.2, lng: 73.75, sev: 'moderate', risk: 62, trend: 'down', cases: 1 },
  { id: 'Vijayawada', d: 'PPR · Vijayawada cluster', loc: 'Vijayawada, Andhra Pradesh', lat: 16.51, lng: 80.65, sev: 'moderate', risk: 61, trend: 'down', cases: 2 },
  { id: 'Sikar', d: 'FMD · Sikar cluster', loc: 'Sikar, Rajasthan', lat: 27.61, lng: 75.14, sev: 'moderate', risk: 60, trend: 'down', cases: 1 },
  { id: 'Udaipur', d: 'FMD · Udaipur cluster', loc: 'Udaipur, Rajasthan', lat: 24.58, lng: 73.71, sev: 'moderate', risk: 59, trend: 'down', cases: 1 },
  { id: 'Bengaluru', d: 'LSD · Bengaluru cluster', loc: 'Bengaluru, Karnataka', lat: 12.97, lng: 77.59, sev: 'moderate', risk: 58, trend: 'down', cases: 1 },
  { id: 'Coimbatore', d: 'FMD · Coimbatore cluster', loc: 'Coimbatore, Tamil Nadu', lat: 11.02, lng: 76.96, sev: 'moderate', risk: 57, trend: 'down', cases: 1 },
  { id: 'Krishnagiri', d: 'FMD · Krishnagiri cluster', loc: 'Krishnagiri, Tamil Nadu', lat: 12.52, lng: 78.21, sev: 'moderate', risk: 55, trend: 'down', cases: 1 },
  { id: 'Cuttack', d: 'PPR · Cuttack cluster', loc: 'Cuttack, Odisha', lat: 20.46, lng: 85.88, sev: 'watch', risk: 51, trend: 'down', cases: 1 },
  { id: 'Mahabubnagar', d: 'FMD · Mahabubnagar cluster', loc: 'Mahabubnagar, Telangana', lat: 16.74, lng: 77.99, sev: 'watch', risk: 49, trend: 'down', cases: 1 },
  { id: 'Surat', d: 'LSD · Surat cluster', loc: 'Surat, Gujarat', lat: 21.17, lng: 72.83, sev: 'watch', risk: 48, trend: 'down', cases: 1 },
  { id: 'Solapur', d: 'FMD · Solapur cluster', loc: 'Solapur, Maharashtra', lat: 17.66, lng: 75.91, sev: 'watch', risk: 47, trend: 'down', cases: 1 },
  { id: 'Purnia', d: 'PPR · Purnia cluster', loc: 'Purnia, Bihar', lat: 25.78, lng: 87.47, sev: 'watch', risk: 46, trend: 'down', cases: 1 },
  { id: 'Kurnool', d: 'LSD · Kurnool cluster', loc: 'Kurnool, Andhra Pradesh', lat: 15.83, lng: 78.04, sev: 'watch', risk: 44, trend: 'down', cases: 1 },
  { id: 'Kozhikode', d: 'LSD · Kozhikode cluster', loc: 'Kozhikode, Kerala', lat: 11.26, lng: 75.78, sev: 'watch', risk: 43, trend: 'down', cases: 1 },
]

const gisMapCases = [
  { id: 'CS-2026-9921', status: 'LAB CONFIRMED', cls: '#dc2626', species: 'Bovine (Gir Cow)', tag: '1009-8829-4410', symptoms: ['High Fever', 'Blisters on Tongue', 'Salivation', 'Lameness'], officer: 'Dr. A. Sharma (MVU-14)', lat: 25.752, lng: 71.3924 },
  { id: 'CS-2026-9918', status: 'SAMPLE EN ROUTE', cls: '#f59e0b', species: 'Caprine (Sirohi Goat)', tag: '1009-4412-0092', symptoms: ['Nasal Discharge', 'Ocular Secretion', 'Diarrhea', 'Pyrexia'], officer: 'Pashu Sakhi Sunita', lat: 24.885, lng: 72.8584 },
  { id: 'CS-2026-9905', status: 'UNDER INVESTIGATION', cls: '#2563eb', species: 'Bovine (Murrah Buffalo)', tag: '1009-7718-3321', symptoms: ['Cutaneous Nodule Lesions', 'Low-grade Fever'], officer: 'Dr. R. Verma (Block Vet)', lat: 23.588, lng: 72.3693 },
  { id: 'CS-2026-9902', status: 'SAMPLE EN ROUTE', cls: '#f59e0b', species: 'Feline (Domestic Cat)', tag: '1009-0204-7744', symptoms: ['Oral Ulcers', 'Ocular Discharge', 'Sneezing'], officer: 'Dr. M. Iyer (MVU-21)', lat: 9.4985, lng: 76.3384 },
]

const gisMvuHubs = [
  ['Jaipur', 26.91, 75.79, 20], ['Jodhpur', 26.24, 73.02, 18],
  ['Ahmedabad', 23.02, 72.57, 20], ['Mumbai', 19.08, 72.88, 18],
  ['Pune', 18.52, 73.86, 14], ['Delhi', 28.61, 77.21, 16],
  ['Lucknow', 26.85, 80.95, 18], ['Patna', 25.59, 85.14, 14],
  ['Kolkata', 22.57, 88.36, 14], ['Hyderabad', 17.39, 78.49, 16],
  ['Bengaluru', 12.97, 77.59, 16], ['Chennai', 13.08, 80.27, 12],
  ['Guwahati', 26.14, 91.74, 12], ['Bhopal', 23.26, 77.41, 14],
  ['Ranchi', 23.36, 85.33, 10], ['Raipur', 21.25, 81.63, 12],
  ['Nagpur', 21.15, 79.09, 12], ['Chandigarh', 30.73, 76.78, 8],
  ['Dehradun', 30.32, 78.03, 8], ['Bhubaneswar', 20.3, 85.83, 10],
  ['Vijayawada', 16.51, 80.65, 10], ['Thiruvananthapuram', 8.52, 76.94, 10],
]

const gisMvuDots = (() => {
  const out = []
  let n = 1
  gisMvuHubs.forEach((hub) => {
    for (let k = 0; k < hub[3]; k++) {
      const deg = ((n * 137507.37) % 360000) / 1000
      const rad = (deg * Math.PI) / 180
      const spread = 0.3 + ((n * 7919) % 100) / 1000
      out.push({ lat: hub[1] + Math.cos(rad) * spread, lng: hub[2] + Math.sin(rad) * spread, id: 'MVU-' + String(n).padStart(2, '0'), city: hub[0] })
      n++
    }
  })
  return out
})()

const pastoralRoutes = [
  [
    [31.1, 75.8], [30.9, 75.85], [28.95, 74.55], [25.752, 71.3924],
    [24.885, 72.8584], [23.588, 72.3693], [21.52, 70.46], [15.2, 74.4], [9.4985, 76.3384],
  ],
  [
    [26.85, 80.95], [23.26, 77.41], [20.0, 73.78], [17.39, 78.49],
    [12.97, 77.59], [11.02, 76.96],
  ],
  [
    [26.14, 91.74], [24.82, 93.94], [25.6, 94.2],
  ],
]

const sevColor = { severe: '#dc2626', high: '#f97316', moderate: '#facc15', watch: '#38bdf8' }
const sevSize = { severe: 12, high: 9, moderate: 7, watch: 6 }
const sevLabel = { severe: 'Severe', high: 'High', moderate: 'Moderate', watch: 'Watch' }

const gisCounts = gisClusters.reduce((a, c) => { a[c.sev]++; return a }, { severe: 0, high: 0, moderate: 0, watch: 0 })
const gisRising = gisClusters.filter((c) => c.trend === 'up').length
const caseStatusColor = { 'LAB CONFIRMED': '#dc2626', 'SAMPLE EN ROUTE': '#f59e0b', 'UNDER INVESTIGATION': '#2563eb' }

function Hero({ bg, crumb, crumbCls, icon: Icon, iconTag, tag, tagDot, title, desc, stats, actions }) {
  return (
    <section className="mod-hero fade-up px-6 py-6 overflow-hidden" style={{ background: bg }}>
      <div className="mod-hero-overlay"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '32px 32px' }}></div>
      <div className="relative z-[2]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase ${crumbCls}`}>
            <span className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" style={{ color: iconTag }} />
            </span>
            <span>PashuSahaya</span>
            <span className="text-slate-500">/</span>
            <span className="text-white">{crumb}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag bg-white/10 text-white/80 border border-white/15">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${tagDot}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${tagDot}`}></span>
              </span>
              {tag}
            </span>
            {actions}
          </div>
        </div>
        <div className="mt-5">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">{title}</h1>
          <p className="mt-1.5 text-[11px] text-slate-300 max-w-xl">{desc}</p>
        </div>
        <div className={`mt-5 grid grid-cols-2 gap-2.5 ${stats.length >= 5 ? 'md:grid-cols-3 xl:grid-cols-5' : 'md:grid-cols-4'}`}>
          {stats.map((s) => (
            <div className="gov-stat" style={{ ['--bar']: s.bar }} key={s.label}>
              <div className="gov-stat-top">
                <span className="gov-stat-label">{s.label}</span>
                <span className="gov-stat-icon"><s.icon /></span>
              </div>
              <div className="gov-stat-value">{s.value}<span className="text-[12px] text-slate-300 font-bold">{s.suffix}</span></div>
              <div className="gov-stat-foot"><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span> {s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const vacGallery = [
  { name: 'Rajasthan', pct: '91%', img: 'img/goverment/Local%20Team%20Responding%20to%20Cluster.png' },
  { name: 'Gujarat', pct: '88%', img: 'img/goverment/Community%20Animal%20Health%20Meeting.png' },
  { name: 'Maharashtra', pct: '84.6%', img: 'img/local/Gemini_Generated_Image_123e8i123e8i123e.png' },
  { name: 'Uttar Pradesh', pct: '81%', img: 'img/local/Gemini_Generated_Image_ao1lo3ao1lo3ao1l.png' },
  { name: 'Assam', pct: '74%', img: 'img/goverment/Rural%20Skin%20Disease%20Surveillance.png' },
  { name: 'Kerala', pct: '79%', img: 'img/local/Gemini_Generated_Image_gc89blgc89blgc89.png' },
  { name: 'Punjab', pct: '87%', img: 'img/goverment/vac2.png' },
  { name: 'Haryana', pct: '82%', img: 'img/medical/Veterinary%20Team%20Vaccination%20Drive.png' },
  { name: 'Madhya Pradesh', pct: '76%', img: 'img/local/Gemini_Generated_Image_judu0ajudu0ajudu.png' },
  { name: 'Telangana', pct: '78%', img: 'img/local/Gemini_Generated_Image_lnpx3plnpx3plnpx.png' },
  { name: 'Karnataka', pct: '85%', img: 'img/local/loc4.png' },
  { name: 'Bihar', pct: '71%', img: 'img/goverment/One%20Health%20Medical%20Environment.png' },
  { name: 'Odisha', pct: '73%', img: 'img/local/Gemini_Generated_Image_lqffoxlqffoxlqff.png' },
  { name: 'West Bengal', pct: '69%', img: 'img/local/loc5.jpeg' },
  { name: 'Tamil Nadu', pct: '77%', img: 'img/medical/Medical%20Team%20Investigating%20Sick%20Animals.png' },
  { name: 'Chhattisgarh', pct: '75%', img: 'img/medical/Combined%20Human%20and%20Veterinary%20Hospital.png' },
]

const vacProgressCols = [
  [
    { name: 'Rajasthan', pct: '91%', w: '91%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Gujarat', pct: '88%', w: '88%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Maharashtra', pct: '84.6%', w: '84.6%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Punjab', pct: '87%', w: '87%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Haryana', pct: '82%', w: '82%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Madhya Pradesh', pct: '76%', w: '76%', bar: 'bg-sky-500', tag: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
    { name: 'Karnataka', pct: '85%', w: '85%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Odisha', pct: '73%', w: '73%', bar: 'bg-amber-500', tag: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  ],
  [
    { name: 'Uttar Pradesh', pct: '81%', w: '81%', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { name: 'Assam', pct: '74%', w: '74%', bar: 'bg-amber-500', tag: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
    { name: 'Kerala', pct: '79%', w: '79%', bar: 'bg-sky-500', tag: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
    { name: 'Telangana', pct: '78%', w: '78%', bar: 'bg-sky-500', tag: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
    { name: 'Bihar', pct: '71%', w: '71%', bar: 'bg-amber-500', tag: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
    { name: 'West Bengal', pct: '69%', w: '69%', bar: 'bg-amber-500', tag: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
    { name: 'Tamil Nadu', pct: '77%', w: '77%', bar: 'bg-sky-500', tag: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
    { name: 'Chhattisgarh', pct: '75%', w: '75%', bar: 'bg-sky-500', tag: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
  ],
]

function VaccinationTab() {
  const scrollRef = useRef(null)
  return (
    <div className="space-y-4">
      <Hero
        bg="linear-gradient(135deg,#15803d 0%,#166534 55%,#0b1026 100%)"
        crumb="NADCP Vaccination Drive"
        crumbCls="text-emerald-200"
        icon={Syringe}
        iconTag="#6ee7b7"
        tag="NATIONAL ROLLOUT"
        tagDot="bg-emerald-400"
        title="National Animal Disease Control Programme"
        desc="Biannual FMD mass vaccination and female calf brucellosis immunization across 766 districts."
        stats={[
          { label: 'FMD Round 7', value: '84.6', suffix: '%', sub: '535M doses target', bar: '#34d399', icon: ShieldCheck, dot: 'bg-emerald-400' },
          { label: 'Brucellosis Calves', value: '75.6', suffix: '%', sub: '4-8 month cohort', bar: '#60a5fa', icon: Baby, dot: 'bg-sky-400' },
          { label: 'Doses Given', value: '452.6', suffix: 'M', sub: 'cumulative this round', bar: '#a78bfa', icon: PlusCircle, dot: 'bg-violet-400' },
          { label: 'Districts', value: '698', suffix: '/766', sub: 'camp blitz synced', bar: '#38bdf8', icon: MapPin, dot: 'bg-sky-400' },
        ]}
      />

      <section className="grid lg:grid-cols-2 gap-2">
        <div className="relative">
          <div ref={scrollRef} className="grid grid-cols-2 gap-2 items-start overflow-y-auto custom-scrollbar" style={{ maxHeight: 400 }}>
            {vacGallery.map((g) => (
              <div key={g.name} className="kpi-card overflow-hidden fade-up">
                <div className="relative h-48 overflow-hidden">
                  <img src={g.img} alt={`${g.name} field camp`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white drop-shadow">{g.name}</span>
                    <span className="text-[10px] font-black text-white drop-shadow">{g.pct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#0b213f] to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 pointer-events-none">
            <button
              onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
              type="button"
              className="pointer-events-auto tag bg-white dark:bg-[#0b213f] border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-1.5 transition hover:text-emerald-600"
            >
              <ChevronDown size={12} />scroll · more states
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2" style={{ height: 400 }}>
          <div className="kpi-card p-3 fade-up shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><ShieldCheck size={16} /></div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Rollout Progress</h2>
              </div>
              <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">on schedule</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">FMD Round 7 National Target (535M Doses)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">84.6% Completed</span>
                </div>
                <div className="mini-progress" style={{ height: 12 }}><i style={{ width: '84.6%' }} className="bg-emerald-500"></i></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Brucellosis Bovine Calves Target</span>
                  <span className="text-blue-700 dark:text-blue-400">75.6% Completed</span>
                </div>
                <div className="mini-progress" style={{ height: 12 }}><i style={{ width: '75.6%' }} className="bg-blue-500"></i></div>
              </div>
            </div>
            <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 mr-1">Round Plan</span>
              <span className="tag bg-white text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">R6 Apr 2026</span>
              <ArrowRight size={14} className="text-emerald-500" />
              <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">R7 Live</span>
              <ArrowRight size={14} className="text-slate-300" />
              <span className="tag bg-white text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">R8 Nov 2026</span>
              <span className="ml-auto text-[10px] text-slate-400">next mass-camp cycle opens 01 Nov</span>
            </div>
          </div>
          <div className="kpi-card overflow-hidden fade-up flex-1">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">State-wise Vaccination Progress</h2>
            </div>
            <div className="grid grid-cols-2 items-stretch divide-x divide-slate-100 dark:divide-slate-800 overflow-y-auto custom-scrollbar" style={{ maxHeight: 164 }}>
              {vacProgressCols.map((col, ci) => (
                <div key={ci} className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {col.map((s) => (
                    <div key={s.name} className="h-10 flex flex-col justify-center px-4 py-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                        <span className={`tag ${s.tag}`}>{s.pct}</span>
                      </div>
                      <div className="mt-1.5 mini-progress"><i style={{ width: s.w }} className={s.bar}></i></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400 shrink-0">PashuSahaya · National Animal Disease Control Programme · 766 districts synced</footer>
    </div>
  )
}

const labInstruments = [
  { icon: Cpu, name: 'CFX96', val: '94.0°C', status: 'RUNNING', statusCls: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', bar: 'bg-emerald-500', w: '55%', iconCls: 'text-cyan-600 dark:text-cyan-400' },
  { icon: Cpu, name: 'ABI 7500', val: '4.0°C', status: 'HOLD', statusCls: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', bar: 'bg-amber-400', w: '12%', iconCls: 'text-blue-600 dark:text-blue-400' },
  { icon: Snowflake, name: '-20°C Freezer', val: '-18.6°C', status: 'STABLE', statusCls: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', bar: 'bg-sky-400', w: '74%', iconCls: 'text-sky-600 dark:text-sky-400' },
  { icon: Snowflake, name: 'LN2 Dewar', val: '-196°C', status: 'OK', statusCls: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', bar: 'bg-indigo-500', w: '88%', iconCls: 'text-indigo-600 dark:text-indigo-400' },
  { icon: Thermometer, name: '4°C Fridge', val: '2.4°C', status: 'STABLE', statusCls: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', bar: 'bg-emerald-500', w: '66%', iconCls: 'text-emerald-600 dark:text-emerald-400' },
  { icon: ShieldAlert, name: 'BSC Class II', val: 'in-use', status: 'ACTIVE', statusCls: 'text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500', bar: 'bg-cyan-400', w: '38%', iconCls: 'text-rose-600 dark:text-rose-400' },
]

const labAssays = [
  { id: 'SMP-2026-8941', sample: 'Oropharyngeal Swab', assay: 'FMD RT-PCR', method: 'qPCR', methodCls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', analyst: 'P. Kulkarni', eta: '09:40', case: 'CS-2026-9921', hasCase: true, status: 'CONFIRMED POSITIVE', statusCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
  { id: 'SMP-2026-8819', sample: 'Blood Serum', assay: 'FMD NSP ELISA', method: 'ELISA', methodCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', analyst: 'S. Menon', eta: 'run 2', case: 'sero-survey', hasCase: false, status: 'TESTING IN PROGRESS', statusCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  { id: 'SMP-2026-8814', sample: 'Skin Scab Tissue', assay: 'LSD Real-Time PCR', method: 'qPCR', methodCls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', analyst: 'P. Kulkarni', eta: '10:15', case: 'CS-2026-9905', hasCase: true, status: 'CONFIRMED POSITIVE', statusCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
  { id: 'SMP-2026-8830', sample: 'Nasal Swab', assay: 'PPR RT-PCR', method: 'qPCR', methodCls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', analyst: 'R. Dubey', eta: '11:00', case: 'CS-2026-9918', hasCase: true, status: 'RECEIVED', statusCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
  { id: 'SMP-2026-8770', sample: 'Oral Swab', assay: 'FCV PCR', method: 'qPCR', methodCls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', analyst: 'S. Menon', eta: '12:05', case: 'CS-2026-9902', hasCase: true, status: 'CONFIRMED POSITIVE', statusCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
  { id: 'SMP-2026-8798', sample: 'Splenic Tissue', assay: 'ASF Detection PCR', method: 'qPCR', methodCls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', analyst: 'R. Dubey', eta: 'hold', case: 'Kamrup cluster', hasCase: false, status: 'CONFIRMED ASF', statusCls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
]

function LabTab() {
  return (
    <div className="space-y-4">
      <Hero
        bg="linear-gradient(135deg,#0891b2 0%,#0e4a5e 55%,#0b1026 100%)"
        crumb="All India PashuSahaya Laboratory"
        crumbCls="text-cyan-200"
        icon={FlaskConical}
        iconTag="#67e8f9"
        tag="LIVE INTAKE · NABL ISO 15189"
        tagDot="bg-cyan-400"
        title="Molecular Diagnostic & Genomic Surveillance Unit"
        desc="Sample intake, viral RNA extraction, RT-PCR amplification, serotyping and whole-genome sequencing across ICAR-IVRI & 6 regional laboratories."
        stats={[
          { label: 'Intake Received', value: '214', sub: 'across 6 network labs', bar: '#22d3ee', icon: Inbox, dot: 'bg-cyan-400' },
          { label: 'QC Pending', value: '68', sub: 'extraction queue', bar: '#fbbf24', icon: Hourglass, dot: 'bg-amber-400' },
          { label: 'Confirmed Positive', value: '9', sub: 'RT-PCR verified', bar: '#f87171', icon: AlertTriangle, dot: 'bg-rose-400' },
          { label: 'Avg Turnaround', value: '26', suffix: 'h', sub: 'intake to report', bar: '#34d399', icon: Timer, dot: 'bg-emerald-400' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        <div className="grid grid-cols-2 gap-1.5 items-start">
          {['lab1.png', 'lab2.png', 'lab3.png', 'lab4.png'].map((im, i) => (
            <img key={im} src={`img/lab/${im}`} alt={`Lab ${i + 1} workstation`} className="w-full h-40 object-cover rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-start">
          <section className="kpi-card p-4 fade-up" style={{ animationDelay: '.22s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center"><Dna size={16} /></div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Genomic Surveillance &amp; QC</h2>
              </div>
              <span className="tag bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">WGS pipeline</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center shrink-0"><Dna size={16} /></span>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Genomes Sequenced</div>
                    <div className="text-[10px] text-slate-400">submitted to GenBank</div>
                  </div>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 stat-ticker">12</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shrink-0"><ShieldCheck size={16} /></span>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">QC Pass Rate</div>
                    <div className="text-[10px] text-slate-400">2 re-runs flagged</div>
                  </div>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 stat-ticker">99.4%</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center shrink-0"><Bug size={16} /></span>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Marker Panel v3</div>
                    <div className="text-[10px] text-slate-400">ASF genot. II · LSD lineage watch</div>
                  </div>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 stat-ticker">LIVE</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400"><Target size={12} className="inline" /> Bioinformatic pipe: SPAdes assembly · auto-annotate <span className="font-black text-slate-500 dark:text-slate-300">&le; 6h</span> per isolate · submitted with ISO 20387 trace log.</div>
          </section>

          <section className="kpi-card p-4 fade-up" style={{ animationDelay: '.30s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 flex items-center justify-center"><Cpu size={16} /></div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Instrument &amp; Cold-Chain Monitor</h2>
              </div>
              <span className="tag bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">auto-logged · 2-min</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {labInstruments.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.name} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                    <div className="flex items-center gap-2"><Icon size={14} className={m.iconCls} /><span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{m.name}</span></div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-500 dark:text-slate-400">{m.val}</span>
                      <span className={`flex items-center gap-1 text-[10px] ${m.statusCls}`}><span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}></span>{m.status}</span>
                    </div>
                    <div className="mini-progress mt-1.5 h-1"><i style={{ width: m.w }} className={m.bar}></i></div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      <section className="kpi-card overflow-hidden fade-up" style={{ animationDelay: '.34s' }}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Active Assay Queue</h2>
          <span className="text-[10px] font-semibold text-slate-400">ICAR-IVRI &amp; regional labs · linked to case registry</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Sample ID</th>
                <th className="px-5 py-3 font-semibold">Assay</th>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Analyst</th>
                <th className="px-5 py-3 font-semibold">ETA</th>
                <th className="px-5 py-3 font-semibold">Case</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {labAssays.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">{a.id}</td>
                  <td className="px-5 py-3">{a.sample} <span className="text-slate-400">/</span> {a.assay}</td>
                  <td className="px-5 py-3"><span className={`tag ${a.methodCls}`}>{a.method}</span></td>
                  <td className="px-5 py-3">{a.analyst}</td>
                  <td className="px-5 py-3 font-mono text-[10px] text-slate-400">{a.eta}</td>
                  <td className="px-5 py-3">
                    {a.hasCase ? (
                      <button className="cursor-pointer text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">{a.case}</button>
                    ) : (
                      <span className="text-[10px] text-slate-400">{a.case}</span>
                    )}
                  </td>
                  <td className="px-5 py-3"><span className={`tag ${a.statusCls}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · All India PashuSahaya Laboratory · BSL-3 National Reference</footer>
    </div>
  )
}

const titreStates = ['UP', 'MP', 'Rajasthan', 'Punjab', 'Haryana', 'Gujarat', 'Bihar', 'Kerala']
const titreValues = [81, 76, 91, 87, 82, 88, 71, 79]

function ImmunityChart({ dark }) {
  const data = {
    labels: titreStates,
    datasets: [
      {
        label: 'Protective titre %',
        data: titreValues,
        backgroundColor: dark ? 'rgba(56,189,248,.75)' : 'rgba(37,99,235,.7)',
        borderRadius: 6,
        maxBarThickness: 26,
      },
    ],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? '#0f172a' : '#ffffff',
        titleColor: dark ? '#e2e8f0' : '#0f172a',
        bodyColor: dark ? '#cbd5e1' : '#334155',
        borderColor: 'rgba(100,116,139,.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: dark ? '#94a3b8' : '#64748b', font: { size: 9, weight: 600 } },
      },
      y: {
        min: 50,
        max: 100,
        grid: { color: dark ? 'rgba(148,163,184,.12)' : 'rgba(100,116,139,.15)' },
        ticks: { color: dark ? '#94a3b8' : '#64748b', font: { size: 9 }, callback: (v) => `${v}%` },
      },
    },
  }
  return <Bar data={data} options={options} />
}

const riskIndex = [
  { label: 'High Border Vulnerability (Western Corridor)', value: '88/100', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' },
  { label: 'Vector Proliferation Index (Monsoon Belt)', value: '64/100', text: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' },
  { label: 'Flood-Zone Exposure (NE States)', value: '58/100', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-400' },
  { label: 'Transport-Corridor Exposure', value: '47/100', text: 'text-sky-600 dark:text-sky-400', bar: 'bg-sky-400' },
]

const trendBars = [
  { label: 'Mar', h: '100%', c: 'bg-red-500' },
  { label: 'Apr', h: '90%', c: 'bg-red-500' },
  { label: 'May', h: '60%', c: 'bg-orange-500' },
  { label: 'Jun', h: '43%', c: 'bg-orange-500' },
  { label: 'Jul', h: '33%', c: 'bg-amber-400' },
  { label: 'Aug', h: '29%', c: 'bg-emerald-500' },
]

function AnalyticsTab({ dark }) {
  return (
    <div className="space-y-4">
      <Hero
        bg="linear-gradient(135deg,#7c3aed 0%,#5b21b6 55%,#0b1026 100%)"
        crumb="Epidemiology Analytics"
        crumbCls="text-violet-200"
        icon={Brain}
        iconTag="#c4b5fd"
        tag="MODEL v3.1"
        tagDot="bg-violet-400"
        title="Predictive Intelligence & Epidemiology"
        desc="Outbreak trend forecasting, sero-conversion rates and seasonal vulnerability models."
        stats={[
          { label: 'Forecast Accuracy', value: '87', suffix: '%', sub: '30-day outlook', bar: '#a78bfa', icon: Target, dot: 'bg-violet-400' },
          { label: 'Risk Districts', value: '38', sub: '-12 vs last month', bar: '#38bdf8', icon: Flame, dot: 'bg-amber-400' },
          { label: 'Antibody Coverage', value: '75.7', suffix: '%', sub: 'sero-monitoring', bar: '#60a5fa', icon: ShieldCheck, dot: 'bg-sky-400' },
          { label: 'Data Nodes', value: '766', sub: 'district feeds live', bar: '#e879f9', icon: RadioTower, dot: 'bg-fuchsia-400' },
        ]}
      />

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="kpi-card p-5 fade-up" style={{ animationDelay: '.24s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center"><Activity size={16} /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">FMD Protective Antibody Titre Level</h2>
            </div>
            <span className="tag bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">Round 7</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">Post-vaccination sero-monitoring showing &gt;75% immunity threshold across key states.</p>
          <div className="h-52 relative"><ImmunityChart dark={dark} /></div>
        </div>
        <div className="kpi-card p-5 fade-up" style={{ animationDelay: '.28s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center"><MapPin size={16} /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">District Risk Vulnerability Index</h2>
            </div>
            <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">weighted</span>
          </div>
          <div className="space-y-4">
            {riskIndex.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">{r.label}</span>
                  <span className={`${r.text} font-black`}>{r.value}</span>
                </div>
                <div className="mini-progress" style={{ height: 8 }}><i style={{ width: r.value.split('/')[0] + '%' }} className={r.bar}></i></div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400"><TrendingDown size={12} className="inline" /> Western corridor risk -8 points after Round 7 vaccinations.</div>
        </div>
      </section>

      <section className="kpi-card p-5 fade-up" style={{ animationDelay: '.32s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 flex items-center justify-center"><ChartLine size={16} /></div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Monitored Outbreak Trend 2026</h2>
          </div>
          <span className="tag bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">declining</span>
        </div>
        <div className="flex items-end gap-3 h-32">
          {trendBars.map((b) => (
            <div key={b.label} className="flex-1 h-full flex flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 min-h-0 items-end">
                <div className={`w-full max-w-8 rounded-t-md ${b.c} bar-anim`} style={{ height: b.h }}></div>
              </div>
              <span className="text-[9px] font-semibold text-slate-400">{b.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span>FMD + LSD combined monthly outbreaks (FF: 42, 38, 25, 18, 14, 12)</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">-71% since Mar</span>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · Epidemiological Analytics &amp; Predictive Intelligence</footer>
    </div>
  )
}

const mvuUpdates = [
  { id: 'MR-2026-04118', unit: 'MVU-14', doc: 'Dr. A. Sharma', loc: 'Barmer, Rajasthan', task: 'FMD clinical visit completed; ear-tag 1009-8829-4410 treated', time: '06:42' },
  { id: 'MR-2026-04116', unit: 'MVU-08', doc: 'Dr. M. Khan', loc: 'Mehsana, Gujarat', task: 'LSD ring vaccination; 220 doses across 2 villages', time: '07:02' },
  { id: 'MR-2026-04114', unit: 'MVU-17', doc: 'Dr. S. Banerjee', loc: 'Kamrup, Assam', task: 'Mobile camp at North Guwahati; 34 animals vaccinated', time: '08:47' },
]

const mvuLive = [
  { id: 'MVU-21', idCls: 'text-blue-700 dark:text-blue-400', task: 'Avian influenza sampling', loc: 'Alappuzha', tag: 'IN PROGRESS', tagCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
  { id: 'MVU-03', idCls: 'text-amber-700 dark:text-amber-400', task: 'PPR flock check', loc: 'Mathura', tag: 'ON STANDBY', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  { id: 'MVU-11', idCls: 'text-violet-700 dark:text-violet-400', task: 'Kennel clinic', loc: 'Nizamabad', tag: 'PENDING', tagCls: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400' },
]

const mvuDispatch = [
  { unit: 'MVU-14', loc: 'Barmer, Rajasthan', task: 'FMD clinical visit', time: '06:42', tag: 'ON FIELD', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { unit: 'MVU-21', loc: 'Alappuzha, Kerala', task: 'Avian influenza sampling', time: '07:18', tag: 'EN ROUTE', tagCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
  { unit: 'MVU-08', loc: 'Mehsana, Gujarat', task: 'LSD ring vaccination', time: '07:02', tag: 'ON FIELD', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { unit: 'MVU-03', loc: 'Mathura, Uttar Pradesh', task: 'PPR flock check', time: '08:15', tag: 'ON STANDBY', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
]

function MVUTab() {
  return (
    <div className="space-y-4">
      <Hero
        bg="linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 55%,#0b1026 100%)"
        crumb="Live Vet Field Updates"
        crumbCls="text-blue-200"
        icon={Radar}
        iconTag="#93c5fd"
        tag="LIVE FEED"
        tagDot="bg-blue-400"
        title="Live Vet Field Updates"
        desc="Live field reports from the Mobile Veterinary Unit fleet - treatment, sampling and vaccination updates as they arrive."
        stats={[
          { label: 'Units in Fleet', value: '1,962', sub: 'national helpline active', bar: '#60a5fa', icon: Truck, dot: 'bg-sky-400' },
          { label: 'Operational', value: '96.8', suffix: '%', sub: 'units reporting live', bar: '#34d399', icon: Activity, dot: 'bg-emerald-400' },
          { label: 'On Active Run', value: '1,248', sub: 'pending field visits', bar: '#38bdf8', icon: Navigation, dot: 'bg-sky-400' },
          { label: 'Avg Arrival', value: '22', suffix: 'min', sub: 'call to doorstep', bar: '#fbbf24', icon: Clock, dot: 'bg-amber-400' },
        ]}
      />

      <section className="kpi-card overflow-hidden fade-up" style={{ animationDelay: '.24s' }}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Live Vet Field Updates</h2>
          <span className="text-[10px] font-semibold text-slate-400"><span className="live-dot" style={{ color: '#22c55e' }}></span> updated 30s ago</span>
        </div>
        <div className="p-4">
          <div className="overflow-hidden mvu-cinema">
            <div className="mvu-marquee">
              {mvuUpdates.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 shrink-0 mvu-comp">
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-[11px] shrink-0">{u.id}</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 shrink-0">{u.unit} <span className="text-slate-400 font-medium">/</span> {u.doc}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">{u.loc}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-600 dark:text-slate-300">{u.task}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{u.time}</span>
                  <span className="tag bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 shrink-0">COMPLETED</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2"><span className="live-dot" style={{ color: '#38bdf8' }}></span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span></div>
            <div className="mvu-ticker">
              <div className="mvu-ticker-track">
                {[...mvuLive, ...mvuLive].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className={`font-mono font-bold ${m.idCls} text-[11px]`}>{m.id}</span>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{m.task}</span>
                    <span className="text-[10px] text-slate-400">{m.loc}</span>
                    <span className={`tag ${m.tagCls}`}>{m.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="kpi-card overflow-hidden fade-up" style={{ animationDelay: '.28s' }}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Dispatch Log</h2>
          <span className="text-[10px] font-semibold text-slate-400">doorstep response cells</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Unit</th>
                <th className="px-5 py-3 font-semibold">District / State</th>
                <th className="px-5 py-3 font-semibold">Task</th>
                <th className="px-5 py-3 font-semibold">Dispatched</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mvuDispatch.map((d) => (
                <tr key={d.unit}>
                  <td className="px-5 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">{d.unit}</td>
                  <td className="px-5 py-3">{d.loc}</td>
                  <td className="px-5 py-3">{d.task}</td>
                  <td className="px-5 py-3 text-[10px] text-slate-400 stat-ticker">{d.time}</td>
                  <td className="px-5 py-3"><span className={`tag ${d.tagCls}`}>{d.tag}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · Live Vet Field Updates · MVU field feed</footer>
    </div>
  )
}

const bulletins = [
  { title: 'BLD-38 Weekly Situation Report', desc: 'West corridor focus, FMD & LSD movement forecast', tag: 'EMERGENCY', tagCls: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400', icon: AlertTriangle, iconCls: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400', date: '01 Sep', action: 'download' },
  { title: 'NEDI-07 Monthly Incidence, July 2026', desc: 'Disease incidence notifications & sero-surveillance digest', tag: 'PUBLISHED', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: FileText, iconCls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', date: '15 Aug', action: 'download' },
  { title: 'ASF-06 Desk Note, NE Swine Corridor', desc: 'Movement-ban review after Kamrup cluster', tag: 'DRAFT', tagCls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: BookOpen, iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', date: '28 Aug', action: 'preview' },
  { title: 'FMD-12 Sero-Sentinel Guide, Round 7', desc: 'Post-vaccination titre protocol for field units', tag: 'INTERNAL', tagCls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', icon: Syringe, iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', date: '10 Aug', action: 'download' },
  { title: 'LSD-09 Vector Reduction Campaign Note', desc: 'Post-monsoon vector control & vaccination linkage', tag: 'PUBLISHED', tagCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: Bug, iconCls: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400', date: '02 Aug', action: 'download' },
]

const reportBars = [
  { label: 'May', h: '56%', c: 'bg-cyan-400' },
  { label: 'Jun', h: '83%', c: 'bg-cyan-400' },
  { label: 'Jul', h: '44%', c: 'bg-cyan-500' },
  { label: 'Aug', h: '67%', c: 'bg-cyan-500' },
  { label: 'Sep', h: '100%', c: 'bg-cyan-600' },
]

function ReportsTab() {
  return (
    <div className="space-y-4">
      <Hero
        bg="linear-gradient(135deg,#0e7490 0%,#155e75 55%,#0b1026 100%)"
        crumb="Outbreak Bulletins"
        crumbCls="text-cyan-200"
        icon={FileText}
        iconTag="#67e8f9"
        tag="CIRCULATION"
        tagDot="bg-cyan-400"
        title="Official Epidemiological Bulletins"
        desc="Weekly disease forecasts and monthly incidence notifications from DAHD & ICAR."
        stats={[
          { label: 'Bulletins', value: '42', sub: 'weekly + monthly', bar: '#60a5fa', icon: BookOpen, dot: 'bg-sky-400' },
          { label: 'Forecast Accuracy', value: '87', suffix: '%', sub: '30-day risk outlook', bar: '#34d399', icon: Target, dot: 'bg-emerald-400' },
          { label: 'Critical Alerts', value: '3', sub: 'action-required', bar: '#f87171', icon: AlertTriangle, dot: 'bg-rose-400' },
          { label: 'Subscribers', value: '128', suffix: 'K', sub: 'district desks & MVUs', bar: '#38bdf8', icon: Users, dot: 'bg-sky-400' },
        ]}
      />

      <section className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 kpi-card overflow-hidden fade-up" style={{ animationDelay: '.24s' }}>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Latest Bulletins</h2>
            <span className="tag bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400">5 in queue</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bulletins.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className={`w-9 h-9 rounded-lg ${b.iconCls} flex items-center justify-center shrink-0`}><Icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{b.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{b.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`tag ${b.tagCls}`}>{b.tag}</span>
                    <span className="text-[10px] text-slate-400 stat-ticker">{b.date}</span>
                    <button className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition" title={b.action === 'download' ? 'Download bulletin' : 'Preview bulletin'}>
                      {b.action === 'download' ? <Download size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="lg:col-span-2 kpi-card p-5 fade-up" style={{ animationDelay: '.28s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400 flex items-center justify-center"><BarChart3 size={16} /></div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Monthly Releases</h2>
            </div>
            <span className="tag bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400">2026</span>
          </div>
          <div className="flex items-end gap-2.5 h-32">
            {reportBars.map((b) => (
              <div key={b.label} className="flex-1 h-full flex flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 min-h-0 items-end">
                  <div className={`w-full rounded-t-md ${b.c} bar-anim`} style={{ height: b.h }}></div>
                </div>
                <span className="text-[9px] font-semibold text-slate-400">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center justify-between"><span className="text-slate-400">Reports on time</span><span className="font-black text-emerald-600 dark:text-emerald-400">92%</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">Field feedback loop</span><span className="font-black text-slate-800 dark:text-slate-100">24h</span></div>
          </div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · DAHD &amp; ICAR Epidemiological Bulletin Desk</footer>
    </div>
  )
}

function CaseDetailModal({ d, onClose }) {
  if (!d) return null
  return (
    <div className="casemodal-open fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="casemodal-card bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <span className={`tag ${d.statusCls || 'bg-red-600 text-white'}`}>{d.status}</span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{d.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Photo</span>
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 mt-1.5">
                <img src={d.img} alt="Case photo" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <span className={`absolute bottom-2 left-2 tag ${d.diseaseTagCls || 'bg-red-600 text-white'}`}>{d.disease}</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[11px] text-slate-500">Case Ref ID</span><span className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400">{d.id}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[11px] text-slate-500">Species / Breed</span><span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{d.species}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[11px] text-slate-500">Ear Tag</span><span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{d.tag}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[11px] text-slate-500">Reporting Authority</span><span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{d.officer}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[11px] text-slate-500">Location</span><span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{d.loc}</span></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[11px] text-slate-500">Access</span><span className="text-[11px] font-semibold text-slate-400">{d.access}</span></div>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Reported Symptoms</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{d.symptoms.map((s) => <span key={s} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200">{s}</span>)}</div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Clinical Summary</span>
            <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg p-3 leading-relaxed">{d.summary}</p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Close</button>
            <button className="px-4 py-2 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition">Open Full Report <ArrowRight size={12} className="inline" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapOverlays({ active, onOpenCase }) {
  return (
    <>
      {active.quarantine && (
        <LayerGroup>
          {gisClusters.map((c) => (
            <Circle key={`q-${c.id}`} center={[c.lat, c.lng]} radius={5000} pathOptions={{ color: '#ef4444', weight: 1.5, fillColor: '#ef4444', fillOpacity: 0.1, dashArray: '6 6' }}>
              <Popup><b>5km Quarantine Zone</b><br />{c.loc}<br />~78.5 km² restricted · entry monitored</Popup>
            </Circle>
          ))}
        </LayerGroup>
      )}

      {active.density && (
        <LayerGroup>
          {gisClusters.map((c) => (
            <Circle key={`d-${c.id}`} center={[c.lat, c.lng]} radius={c.sev === 'severe' ? 75000 : c.sev === 'high' ? 60000 : c.sev === 'moderate' ? 45000 : 30000} pathOptions={{ color: '#fb923c', weight: 1, fillColor: '#fb923c', fillOpacity: 0.13 }}>
              <Popup><b>Sero-prevalence density</b><br />{c.loc} · post-vax titre coverage {c.sev === 'severe' ? 58 : c.sev === 'high' ? 71 : c.sev === 'moderate' ? 82 : 90}%</Popup>
            </Circle>
          ))}
        </LayerGroup>
      )}

      {active.clusters && (
        <LayerGroup>
          {gisClusters.map((c) => (
            <CircleMarker
              key={`c-${c.id}`}
              center={[c.lat, c.lng]}
              radius={sevSize[c.sev] || 8}
              pathOptions={{ color: '#fff', weight: 2, fillColor: sevColor[c.sev] || '#facc15', fillOpacity: 0.95 }}
              eventHandlers={c.caseId ? { click: () => onOpenCase && onOpenCase(c.caseId) } : undefined}
            >
              <Popup>
                <div style={{ fontSize: 11, minWidth: 180 }}>
                  <b>{c.d}</b><br />
                  <span style={{ color: sevColor[c.sev] || '#facc15', fontWeight: 700 }}>{c.loc.toUpperCase()}</span><br />
                  {c.cases} open case(s) · {c.sev === 'watch' ? 'passive field monitoring' : c.sev === 'moderate' ? 'surveillance intensified' : 'ring-vaccination + vector control active'}
                  {c.caseId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ color: '#94a3b8', fontSize: 10 }}>{c.caseId}</span>
                      <a style={{ color: '#2563eb', fontWeight: 700, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onOpenCase && onOpenCase(c.caseId) }}>View Full Case →</a>
                    </div>
                  )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </LayerGroup>
      )}

      {active.cases && (
        <LayerGroup>
          {gisMapCases.map((c) => {
            const sc = caseStatusColor[c.status] || '#64748b'
            return (
              <Marker key={c.id} position={[c.lat - 0.1, c.lng + 0.18]} icon={L.divIcon({
                className: '',
                html: `<div style="width:20px;height:20px;border-radius:6px;background:${sc};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45)"></div>`,
                iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
              })} riseOnHover>
                <Tooltip>{c.id}</Tooltip>
                <Popup>
                  <div style={{ fontSize: 11, minWidth: 200, lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <b style={{ fontFamily: 'monospace', fontSize: 12, color: '#1d4ed8' }}>{c.id}</b>
                      <span style={{ background: sc, color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>{c.status}</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 6 }}>{c.species}, Ear Tag {c.tag}</div>
                    <div style={{ color: '#64748b', marginTop: 2 }}>{c.symptoms.join(', ')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ color: '#94a3b8' }}>{c.officer}</span>
                      <a style={{ color: '#2563eb', fontWeight: 700, cursor: 'pointer' }} onClick={() => onOpenCase && onOpenCase(c.id)}>View Full Case →</a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </LayerGroup>
      )}

      {active.mvu && (
        <LayerGroup>
          {gisMvuDots.map((m) => (
            <CircleMarker key={m.id} center={[m.lat, m.lng]} radius={4} pathOptions={{ color: '#fff', weight: 1, fillColor: '#8b5cf6', fillOpacity: 0.9 }}>
              <Tooltip direction="top" offset={[0, -4]}>{m.id} · {m.city} · GPS live</Tooltip>
              <Popup><b>{m.id}</b><br />Mobile Veterinary Unit · {m.city}<br />GPS real-time · fleet unit of 1,962</Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {active.routes && (
        <LayerGroup>
          {pastoralRoutes.map((route, i) => (
            <Polyline key={i} positions={route} pathOptions={i === 0 ? { color: '#f59e0b', weight: 3, dashArray: '8 6', opacity: 0.85 } : { color: '#f59e0b', weight: 2.5, dashArray: '6 8', opacity: 0.6 }}>
              <Popup><b>Migratory Pastoral Route</b><br />{i === 0 ? 'Western highland corridor · Punjab to Kerala' : i === 1 ? 'Deccan transhumance corridor' : 'NE hill grazing corridor'}</Popup>
            </Polyline>
          ))}
        </LayerGroup>
      )}
    </>
  )
}

function HeroDots({ count, active }) {
  return (
    <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`w-2 h-2 rounded-full transition-all ${i === active ? 'bg-amber-400' : 'bg-white/40'}`}></span>
      ))}
    </div>
  )
}

function MedTeamTab() {
  const stats = [
    { label: 'Total Response Teams', value: '12', suffix: '', sub: '2 per medical zone', dot: 'bg-blue-500' },
    { label: 'Deployed in Field', value: '7', suffix: '', sub: 'treatment & vaccination', dot: 'bg-emerald-500' },
    { label: 'En Route / Standby', value: '5', suffix: '', sub: '2 en route · 3 standby', dot: 'bg-amber-500' },
    { label: 'States / UTs Covered', value: '11', suffix: '', sub: 'across the country', dot: 'bg-blue-500' },
  ]
  const photos = [
    { src: 'img/medical/Emergency%20Animal%20Disease%20Response%20Team.png', label: 'Emergency Response', unit: 'MVU-14' },
    { src: 'img/medical/Veterinary%20Team%20Vaccination%20Drive.png', label: 'Vaccination Drive', unit: 'MVU-08' },
    { src: 'img/medical/Veterinarian%20Examining%20Animal%20Skin%20Disease.png', label: 'Skin Disease Exam', unit: 'MVU-21' },
    { src: 'img/medical/Veterinary%20Medical%20Team%20Examining%20Animals.png', label: 'Field Examination', unit: 'MVU-03' },
    { src: 'img/medical/Medical%20Team%20Investigating%20Sick%20Animals.png', label: 'Sick Animal Investigation', unit: 'MVU-11' },
    { src: 'img/medical/Combined%20Human%20and%20Veterinary%20Hospital.png', label: 'One Health Facility', unit: 'HOSPITAL' },
  ]
  const rows = [
    ['Barmer, Rajasthan', 'MVU-14 & 02', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', 'DEPLOYED'],
    ['Alappuzha, Kerala', 'MVU-21', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', 'DEPLOYED'],
    ['Mehsana, Gujarat', 'MVU-08', 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', 'EN ROUTE'],
    ['Mathura, Uttar Pradesh', 'MVU-03', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', 'ON STANDBY'],
    ['Nizamabad, Telangana', 'MVU-11', 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', 'PENDING'],
    ['Kamrup, Assam', 'MVU-17', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', 'DEPLOYED'],
    ['Ludhiana, Punjab', 'MVU-09', 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', 'ON STANDBY'],
  ]
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="flex h-1"><div className="flex-1 bg-[#FF9933]"></div><div className="flex-1 bg-white dark:bg-gov-800"></div><div className="flex-1 bg-[#138808]"></div></div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center shrink-0"><Wheat className="w-5 h-5 text-blue-800 dark:text-blue-400" /></div>
              <div>
                <div className="text-[10px] font-bold tracking-[.18em] text-slate-400 uppercase">Government of India · Dept. of Animal Husbandry &amp; Dairying</div>
                <h1 className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">Medical Response Team — Veterinary Field Operations</h1>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl">Rapid-deployment treatment triage, mobile field units and bio-safety-cleared clinical care under the National Livestock Mission.</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="tag bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">NATIONWIDE DEPLOYMENT</span>
              <span className="text-[10px] font-semibold text-slate-400">Updated: 09 Sep 2026 · 10:42 Hrs</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="border border-slate-200 dark:border-gov-700 rounded-lg bg-slate-50 dark:bg-gov-800 px-3 py-2.5">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</div>
                <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-[10px] text-slate-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center shrink-0"><Images className="w-4 h-4 text-blue-700 dark:text-blue-400" /></div>
            <div><h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Field Operations Gallery</h2><p className="text-[10px] font-medium text-slate-400">verified field captures · slide to view</p></div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 hidden sm:block">7 captures</span>
        </div>
        <div className="p-4">
          <div className="flex gap-3 overflow-x-auto custom-scrollbar">
            {photos.map((p) => (
              <div key={p.src} className="photo-chip h-44 w-64 shrink-0">
                <img src={p.src} alt={p.label} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white bg-blue-900/90 px-2 py-0.5 rounded uppercase tracking-wider shadow">{p.label}</span>
                  <span className="text-[10px] font-bold text-white/80">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-blue-700 dark:text-blue-400" /></div>
          <div><h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Medical Team Deployment</h2><p className="text-[10px] font-medium text-slate-400">by location · live status</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-gov-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider"><tr><th className="px-5 py-3 font-semibold">Location</th><th className="px-5 py-3 font-semibold">Unit</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r[0]}>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">{r[0]}</td>
                  <td className="px-5 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">{r[1]}</td>
                  <td className="px-5 py-3"><span className={`tag ${r[2]}`}>{r[3]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GovTeamTab({ dark }) {
  const badges = [
    { icon: Building2, label: 'District Control Rooms' },
    { icon: Scale, label: 'Policy Coordination' },
    { icon: FileCheck, label: 'Quarantine Orders' },
  ]
  const points = [
    'Rapid inter-department coordination across 11 states & union territories',
    'District control rooms & nodal point monitoring under one command',
    'Public grievance & quarantine assistance on helpline 1962',
  ]
  const photos = [
    { src: 'img/goverment/One%20Health%20Medical%20Environment.png', label: 'One Health Environment', unit: 'SURVEILLANCE' },
    { src: 'img/goverment/Human%20Hospital%20and%20Animal%20Hospital%20Coordination.png', label: 'Hospital Coordination', unit: 'ONE-HEALTH' },
    { src: 'img/goverment/Rural%20Skin%20Disease%20Surveillance.png', label: 'Rural Surveillance', unit: 'FIELD' },
    { src: 'img/goverment/Hyper-Realistic%20One%20Health%20Skin%20Surveillance%20Scene.png', label: 'Skin Surveillance', unit: 'LSD' },
    { src: 'img/goverment/Local%20Team%20Responding%20to%20Cluster.png', label: 'Cluster Response', unit: 'TASK' },
    { src: 'img/goverment/Community%20Animal%20Health%20Meeting.png', label: 'Community Meeting', unit: 'OUTREACH' },
    { src: 'img/goverment/vac2.png', label: 'Vaccination Drive', unit: 'CAMPAIGN' },
    { src: 'img/goverment/Gemini_Generated_Image_fqoc4sfqoc4sfqoc.png', label: 'Field Coordination', unit: 'HQS' },
  ]
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gov-900 rounded-lg border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-3">
          <div className="relative min-h-[190px] lg:min-h-full">
            <img src="img/goverment/Veterinarian%20and%20Medical%20Specialists%20Reviewing%20Disease%20Data.png" alt="Government response team coordinating disease data" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-2 left-3"><span className="text-[10px] font-bold text-white bg-blue-600/90 px-2 py-0.5 rounded uppercase tracking-wider shadow">Command & Coordination</span></div>
          </div>
          <div className="lg:col-span-2 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"><Landmark className="w-6 h-6" /></div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">Government Response Team</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">District administration, nodal officers & policy coordination cell</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {badges.map((b) => {
                const BIcon = b.icon
                return (
                  <div key={b.label} className="flex items-center gap-2 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-lg px-3 py-2">
                    <BIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{b.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-3">
          <div className="relative min-h-[210px]">
            <img src="img/goverment/One%20Health%20Medical%20Environment.png" alt="Government coordination environment" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-2 left-3"><span className="text-[10px] font-bold text-white bg-blue-900/90 px-2 py-0.5 rounded uppercase tracking-wider shadow">Government Coordination</span></div>
          </div>
          <div className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center shrink-0"><Landmark className="w-4 h-4 text-blue-700 dark:text-blue-400" /></div>
                <h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Government Coordination Cell</h2>
              </div>
              <span className="tag bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shrink-0">OFFICIAL · DAHD</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">The Government Response Team coordinates district administration, nodal officers and policy desks to enforce quarantine, drive mass vaccination and disburse compensation during livestock disease emergencies.</p>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" /> {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center shrink-0"><Images className="w-4 h-4 text-blue-700 dark:text-blue-400" /></div>
            <div><h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Government Field Operations Gallery</h2><p className="text-[10px] font-medium text-slate-400">verified field captures · slide to view</p></div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 hidden sm:block">8 captures</span>
        </div>
        <div className="p-4">
          <div className="flex gap-3 overflow-x-auto custom-scrollbar">
            {photos.map((p) => (
              <div key={p.src} className="photo-chip h-52 w-80 shrink-0">
                <img src={p.src} alt={p.label} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white bg-blue-900/90 px-2 py-0.5 rounded uppercase tracking-wider shadow">{p.label}</span>
                  <span className="text-[10px] font-bold text-white/80">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RescueTeamTab() {
  const stats = [
    { label: 'Rescue Units', value: '1,962', suffix: '', sub: 'national training fleet', dot: 'bg-blue-500' },
    { label: 'Sheltered', value: '1,340', suffix: '', sub: 'cattle at Barmer camp', dot: 'bg-emerald-500' },
    { label: 'On Run', value: '890', suffix: '', sub: 'evacuation convoy', dot: 'bg-sky-500' },
    { label: 'Kits Dispatched', value: '8,640', suffix: '', sub: 'feed & shelter', dot: 'bg-amber-500' },
  ]
  const photos = [
    { src: 'img/local/Gemini_Generated_Image_123e8i123e8i123e.png', label: 'Local Relief Support', unit: 'BAR-01' },
    { src: 'img/local/Gemini_Generated_Image_5jg1r85jg1r85jg1.png', label: 'Community Rescue', unit: 'MEH-02' },
    { src: 'img/local/Gemini_Generated_Image_ao1lo3ao1lo3ao1l.png', label: 'Field Help', unit: 'ALA-03' },
    { src: 'img/local/Gemini_Generated_Image_gc89blgc89blgc89.png', label: 'Livestock Care', unit: 'KUT-07' },
    { src: 'img/local/Gemini_Generated_Image_judu0ajudu0ajudu.png', label: 'Village Rescue', unit: 'CHA-11' },
    { src: 'img/local/Gemini_Generated_Image_lnpx3plnpx3plnpx.png', label: 'Neighbourhood Support', unit: 'NWK-15' },
    { src: 'img/local/Gemini_Generated_Image_lqffoxlqffoxlqff.png', label: 'Animal Relief', unit: 'BHM-18' },
    { src: 'img/local/loc4.png', label: 'Local Volunteers', unit: 'VLT-21' },
  ]
  const smallPhotos = [
    { src: 'img/local/loc2.jpeg', label: 'Local Rescuers', unit: 'VLT-22' },
    { src: 'img/local/loc3.jpeg', label: 'Evacuation Help', unit: 'VLT-23' },
    { src: 'img/local/loc.jpeg', label: 'Villager Support', unit: 'VLT-24' },
  ]
  const reports = [
    { t: 'Barmer Relief Camp', d: '1,340 cattle sheltered', ref: 'ARO-2026-014 · 08 Sep 18:40', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', tag: 'CLEARED' },
    { t: 'Mehsana Evacuation Convoy', d: '890 cattle on run', ref: 'ARO-2026-015 · 09 Sep 09:12', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', tag: 'EN ROUTE' },
    { t: 'Alappuzha Rescue', d: '620 bovine safe', ref: 'ARO-2026-011 · 08 Sep 21:05', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', tag: 'CLEARED' },
    { t: 'Kutch Sheep Cluster', d: '310 sheep rescued', ref: 'ARO-2026-016 · 09 Sep 07:48', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', tag: 'DEPLOYED' },
    { t: 'Chamoli Flood Evac', d: '75 poultry safe', ref: 'ARO-2026-012 · 08 Sep 16:22', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', tag: 'CLEARED' },
  ]
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
        <div className="flex h-1"><div className="flex-1 bg-[#FF9933]"></div><div className="flex-1 bg-white dark:bg-gov-800"></div><div className="flex-1 bg-[#138808]"></div></div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 flex items-center justify-center shrink-0"><Siren className="w-5 h-5 text-amber-700 dark:text-amber-400" /></div>
              <div>
                <div className="text-[10px] font-bold tracking-[.18em] text-slate-400 uppercase">Government of India · Dept. of Animal Husbandry &amp; Dairying</div>
                <h1 className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">Animal Rescue Team — Livestock Relief Operations</h1>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl">Rapid rescue, safe evacuation &amp; doorstep logistics for affected livestock with community-backed relief units.</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="tag bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"><span className="live-dot" style={{ color: '#f59e0b' }}></span> LIVE OPS</span>
              <span className="text-[10px] font-semibold text-slate-400">Updated: 09 Sep 2026 · 10:42 Hrs</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="border border-slate-200 dark:border-gov-700 rounded-lg bg-slate-50 dark:bg-gov-800 px-3 py-2.5">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</div>
                <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-[10px] text-slate-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid lg:grid-cols-5 gap-4 items-stretch">
        <div className="lg:col-span-3 bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 flex items-center justify-center shrink-0"><Images className="w-4 h-4 text-amber-700 dark:text-amber-400" /></div>
              <div><h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Local Rescue Operations Gallery</h2><p className="text-[10px] font-medium text-slate-400">community relief captures · slide to view</p></div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 hidden sm:block">8 captures</span>
          </div>
          <div className="p-4">
            <div className="flex gap-3 overflow-x-auto custom-scrollbar">
              {photos.map((p) => (
                <div key={p.src} className="photo-chip h-52 w-80 shrink-0">
                  <img src={p.src} alt={p.label} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white bg-amber-700/90 px-2 py-0.5 rounded uppercase tracking-wider shadow">{p.label}</span>
                    <span className="text-[10px] font-bold text-white/80">{p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {smallPhotos.map((p) => (
                <div key={p.src} className="photo-chip h-36">
                  <img src={p.src} alt={p.label} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white bg-amber-700/90 px-2 py-0.5 rounded uppercase tracking-wider shadow">{p.label}</span>
                    <span className="text-[10px] font-bold text-white/80">{p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-amber-700 dark:text-amber-400" /></div>
            <div><h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Rescue Reports</h2><p className="text-[10px] font-medium text-slate-400">incident log · latest first</p></div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((r) => (
              <div key={r.t} className="px-5 py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white">{r.t}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{r.d}</div>
                  <div className="mt-1 text-[9px] font-semibold text-slate-400">{r.ref}</div>
                </div>
                <span className={`tag ${r.cls} shrink-0`}>{r.tag}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-gov-800 border-t border-slate-200 dark:border-gov-700 text-[10px] font-semibold text-slate-400 flex items-center justify-between"><span>Report ref: ARO-1962-2026</span><span>Helpline 1962</span></div>
        </div>
      </section>

      <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · Animal Rescue Team · 1962 doorstep response</footer>
    </div>
  )
}

export default function Dashboard() {
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [stateFilter, setStateFilter] = useState('ALL')
  const [diseaseFilter, setDiseaseFilter] = useState('ALL')
  const [slide, setSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [gisLayers, setGisLayers] = useState({ clusters: true, cases: true, quarantine: true, mvu: true, routes: false, density: false })
  const [selectedCase, setSelectedCase] = useState(null)
  const triageRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % focusSlides.length), 5000)
    return () => clearInterval(t)
  }, [])

  const switchTab = (id) => {
    setActiveTab(id)
    setNotifOpen(false)
    setProfileOpen(false)
  }

  const toggleGisLayer = (key) => setGisLayers((s) => ({ ...s, [key]: !s[key] }))

  const openCase = (id) => setSelectedCase(caseDetailData[id] || null)

  const scrollTriage = (dir) => {
    if (triageRef.current) triageRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  const exportCSV = () => {
    const header = 'Outbreak ID,District / State,Target Disease,Affected Species,Risk Level,Containment Status'
    const rows = outbreaks.map((o) => `${o.id},${o.loc},${o.disease},${o.species},${o.risk},${o.containment}`).join('\n')
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pashusahaya-active-outbreaks.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredOutbreaks = outbreaks.filter((o) => {
    const q = searchTerm.toLowerCase()
    if (!q) return true
    return o.loc.toLowerCase().includes(q) || o.disease.toLowerCase().includes(q)
  })

  const activeSlide = focusSlides[slide]

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 antialiased">
      <header className="bg-white dark:bg-gov-900 text-slate-800 dark:text-white border-b border-slate-200 dark:border-gov-700 h-14 flex items-center gap-4 px-4 z-30 shrink-0 shadow-sm dark:shadow-none">
        <div className="flex items-center space-x-3">
          <div className="relative logo-glow p-1 rounded-full overflow-hidden bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20">
            <img src="img/icon/Neural_Knights.jpeg" alt="Neural Knights Logo" className="w-9 h-9 rounded-full object-cover" />
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-gov-700"></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wide text-base text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-emerald-300">PashuSahaya</span>
              <span className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md tracking-wider uppercase shadow-sm">PashuSahaya Portal</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 -mt-0.5">PashuSahaya · National Livestock Surveillance Network</p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-gov-700 hidden lg:block"></div>
          <div className="hidden xl:block text-[10px] leading-tight text-slate-500 dark:text-slate-400 pr-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">LHDCP · NADRS</span><br />
            <span>Integrated Surveillance Grid</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12 ml-auto">
          <button onClick={() => switchTab('medteam')} title="Medical Response Team" className={`group p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition relative ${activeTab === 'medteam' ? 'team-active' : ''}`}>
            <Stethoscope size={14} strokeWidth="2.6" />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button onClick={() => switchTab('govteam')} title="Government Response Team" className={`group p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition relative ${activeTab === 'govteam' ? 'team-active' : ''}`}>
            <Landmark size={14} strokeWidth="2.6" />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button onClick={() => switchTab('rescueteam')} title="Animal Rescue Team" className={`group p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition relative ${activeTab === 'rescueteam' ? 'team-active' : ''}`}>
            <Truck size={14} strokeWidth="2.6" />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/40 rounded-full px-2.5 py-1.5" title="System live status">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 tracking-wide">STATUS</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-600 rounded-full px-3 py-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              <User size={14} className="text-blue-600 dark:text-blue-400" />
              Role:
            </span>
            <select className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer appearance-none pl-0.5">
              <option className="bg-white dark:bg-gov-900 text-slate-900 dark:text-white">Government Officer (Central HQ)</option>
              <option className="bg-white dark:bg-gov-900 text-slate-900 dark:text-white">Field Veterinarian (MVU Unit 14)</option>
              <option className="bg-white dark:bg-gov-900 text-slate-900 dark:text-white">Livestock Owner / Farmer</option>
              <option className="bg-white dark:bg-gov-900 text-slate-900 dark:text-white">ICAR Diagnostic Lab Analyst</option>
              <option className="bg-white dark:bg-gov-900 text-slate-900 dark:text-white">System Administrator</option>
            </select>
          </div>

          <button onClick={toggleTheme} title="Toggle day / night mode" className="relative p-2 text-slate-500 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-gov-800 rounded-full border border-slate-200 dark:border-gov-700 transition">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }} title="Notifications" className="relative p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gov-800 rounded-full border border-slate-200 dark:border-gov-700 transition">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gov-900"></span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-gov-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold px-1.5 py-0.5 rounded-full">{notifications.length} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-gov-800">
                  {notifications.map((n) => (
                    <div key={n.title} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-gov-800 transition">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[11px] font-bold ${
                          n.tone === 'red' ? 'text-red-700 dark:text-red-400' : n.tone === 'orange' ? 'text-orange-700 dark:text-orange-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>{n.title}</span>
                        <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-200 dark:border-gov-700 text-center">
                  <button onClick={() => setNotifOpen(false)} className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline">Clear all notifications</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }} className="flex items-center gap-2.5 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-full pl-1.5 pr-3 py-1 transition hover:bg-slate-100 dark:hover:bg-gov-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center font-bold text-xs text-white border border-blue-400 shadow-inner">DR</div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold leading-none text-slate-900 dark:text-white">Dr. Rajesh Kumar</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1">Joint Commissioner (Epi)</div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-gov-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Dr. Rajesh Kumar</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Joint Commissioner (Epi)</div>
                  <div className="text-[10px] text-blue-700 dark:text-blue-400 mt-1">GOV-8941-RJ</div>
                </div>
                <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white dark:bg-gov-900 border-r border-slate-200 dark:border-gov-800 flex flex-col shrink-0 z-20 shadow-sm overflow-hidden transition-all duration-500`}>
          <div className="p-3 border-b border-slate-100 dark:border-gov-800 bg-slate-50 dark:bg-gov-800 flex items-center justify-between h-12 shrink-0">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Navigation Menu</span>
                <span className="text-[10px] bg-slate-200 dark:bg-gov-700 text-slate-700 dark:text-slate-200 font-semibold px-1.5 py-0.5 rounded">v1.0</span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle sidebar" className={`shrink-0 p-1 text-slate-500 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-gov-700 rounded transition ${sidebarCollapsed ? 'mx-auto' : ''}`}>
              <PanelLeftClose size={16} className={sidebarCollapsed ? 'rotate-180' : ''} />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition ${
                    active
                      ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gov-800 border-l-4 border-blue-700'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gov-800 hover:text-slate-900'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={16} className="shrink-0" />
                  {!sidebarCollapsed && <span className="nav-label whitespace-nowrap">{item.label}</span>}
                  {item.live && !sidebarCollapsed && (
                    <span className="nav-badge ml-auto bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
                  )}
                  {item.live && sidebarCollapsed && (
                    <span className="absolute left-0 top-0 w-1.5 h-full bg-red-500 rounded-r"></span>
                  )}
                </button>
              )
            })}

            {!sidebarCollapsed && (
              <div className="pt-4 pb-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Field Operatives</div>
              </div>
            )}

            {fieldItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition ${
                    active
                      ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gov-800 border-l-4 border-blue-700'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gov-800 hover:text-slate-900'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={16} className="shrink-0" />
                  {!sidebarCollapsed && <span className="nav-label whitespace-nowrap">{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-200 dark:border-gov-800 bg-slate-50 dark:bg-gov-800 text-[11px] space-y-1.5 whitespace-nowrap">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Emergency Helpline:</span>
                <span className="font-bold text-blue-800 dark:text-blue-400">1962</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>RCCIIT Feed:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">ONLINE</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-gov-800 text-[10px] text-slate-400 dark:text-slate-500 text-center">
                PashuSahaya Surveillance Network
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'dashboard' && (
          <div className="bg-white dark:bg-gov-900 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-gov-800 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Filter size={14} className="text-blue-600 dark:text-blue-400" /> Region Filter:
              </span>
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="border border-slate-300 dark:border-gov-700 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-gov-800 text-slate-700 dark:text-slate-200 font-medium hover:border-slate-400 transition">
                <option value="ALL">All States (National View)</option>
                <option value="RJ">Rajasthan</option>
                <option value="GJ">Gujarat</option>
                <option value="KA">Karnataka</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="MH">Maharashtra</option>
              </select>
              <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)} className="border border-slate-300 dark:border-gov-700 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-gov-800 text-slate-700 dark:text-slate-200 font-medium hover:border-slate-400 transition">
                <option value="ALL">All Monitored Diseases</option>
                <option value="FMD">Foot & Mouth Disease (FMD)</option>
                <option value="LSD">Lumpy Skin Disease (LSD)</option>
                <option value="BRU">Brucellosis</option>
                <option value="PPR">Peste des Petits Ruminants (PPR)</option>
                <option value="ASF">African Swine Fever (ASF)</option>
              </select>
              <select className="border border-slate-300 dark:border-gov-700 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-gov-800 text-slate-700 dark:text-slate-200 font-medium hover:border-slate-400 transition">
                <option>Timeframe: Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Current Quarter (Q3 2026)</option>
                <option>Annual 2026-27</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={exportCSV} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 shadow-sm transition">
                <Download size={14} className="text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-700/20 transition">
                <PlusCircle size={14} />
                <span>Report New Suspected Case</span>
              </button>
            </div>
          </div>
          )}

          <div key={activeTab} className="tab-enter">
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group reveal-up">
                  <div className="grid grid-cols-1 lg:grid-cols-3 bg-gradient-to-br from-gov-800 via-gov-900 to-slate-900 text-white min-h-[210px]">
                    <div className="relative col-span-1 sm:col-span-2 overflow-hidden min-h-[210px] lg:min-h-full">
                      <img
                        src={activeSlide.img}
                        alt={activeSlide.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          if (e.currentTarget.src.indexOf('img/farms/animal3.jpg') === -1) e.currentTarget.src = 'img/farms/animal3.jpg'
                          else e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gov-900/20 to-gov-900/95"></div>
                      <div className="absolute top-3 left-3">
                        <div className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center">
                          <ShieldAlert size={20} className={`${activeSlide.iconColor}`} />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-4 flex items-center gap-3">
                        <div>
                          <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Incidence Index</div>
                          <div className="text-3xl font-extrabold text-white">{activeSlide.index}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 flex flex-col justify-center px-5 py-6 lg:py-0 dis-slide-ltr">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
                        <Activity size={14} /> Live Disease Focus · Auto 5s
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold leading-tight">{activeSlide.title}</h2>
                      <p className="text-xs text-slate-300 mt-2">{activeSlide.desc}</p>
                      <div className="mt-4 flex flex-col items-start gap-2">
                        <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">{activeSlide.severity}</span>
                        <span className="bg-white/10 border border-white/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">{activeSlide.stat}</span>
                        <span className="bg-white/10 border border-white/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">{activeSlide.spread}</span>
                      </div>
                    </div>
                  </div>
                  <HeroDots count={focusSlides.length} active={slide} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden reveal-up">
                    <div className="px-2.5 py-1 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <MapPin size={14} className="text-blue-700" />
                        <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Live GIS Disease Outbreak Map · India Command Center</h2>
                      </div>
                      <div className="flex items-center space-x-2 text-[9px]">
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1"></span> Critical</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"></span> High</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></span> Moderate</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Low</span>
                        <button onClick={() => switchTab('gis-map')} className="text-blue-700 hover:underline font-bold ml-1 text-[10px]">Expand →</button>
                      </div>
                    </div>
                    <div className="px-2.5 py-1.5 border-b border-slate-200 bg-white flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide mr-1">GIS Layers</span>
                      {[['clusters', 'Clusters'], ['cases', 'Case Pins'], ['quarantine', 'Quarantine Zones'], ['mvu', 'MVU Trackers'], ['routes', 'Pastoral Routes'], ['density', 'Sero Density']].map(([k, l]) => (
                        <label key={l} className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={gisLayers[k]} onChange={() => toggleGisLayer(k)} className="rounded border-slate-300 text-blue-700 focus:ring-0 w-3.5 h-3.5 cursor-pointer" />
                          <span className="text-[9px] font-bold text-slate-600">{l}</span>
                        </label>
                      ))}
                    </div>
                    <div className="relative flex-1 min-h-[220px]">
                      <MapContainer
                        center={[23.5, 80.5]}
                        zoom={5}
                        scrollWheelZoom={false}
                        maxBounds={[[6.0, 68.0], [38.0, 98.0]]}
                        maxBoundsViscosity={1.0}
                        className="absolute inset-0 w-full h-full z-0"
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution='&copy; OpenStreetMap' />
                        <MapOverlays active={gisLayers} onOpenCase={openCase} />
                      </MapContainer>
                      <div className="absolute bottom-2 left-2 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 p-2.5 rounded text-[10px] text-slate-300 space-y-1">
                        <div className="font-bold text-white border-b border-slate-700 pb-1 mb-1">GIS Surveillance Overlay</div>
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-red-600"></span><span>Quarantine Zone (5km Radius)</span></div>
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span>Ring Vaccination Buffer (10km)</span></div>
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span>Active 1962 Mobile Vet Unit</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col reveal-up">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BellRing size={16} className="text-red-600" />
                        <span>Real-time Epidemic Alerts</span>
                      </h2>
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">3 CRITICAL</span>
                    </div>
                    <div className="p-3 flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                      <div className="p-2.5 rounded border border-red-200 bg-red-50/50 hover:bg-red-50 transition">
                        <div className="flex items-center justify-between">
                          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Critical Outbreak</span>
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
                          <span className="bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">High Risk Suspect</span>
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
                          <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Abortion Storm</span>
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

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col reveal-up">
                  <div className="p-3 border-b border-slate-200 dark:border-gov-700 bg-slate-50 dark:bg-gov-800 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Active District Outbreak Summary & Containment Protocol</h2>
                    <div className="relative">
                      <Search size={16} className="text-slate-500 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        {filteredOutbreaks.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono text-blue-700 font-bold">{o.id}</td>
                            <td className="p-2.5">{o.loc}</td>
                            <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-200">{o.disease}</td>
                            <td className="p-2.5">{o.species}</td>
                            <td className="p-2.5"><span className={`${o.riskCls} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>{o.risk}</span></td>
                            <td className="p-2.5"><span className={`${o.contCls} text-[10px] font-semibold`}>{o.containment}</span></td>
                            <td className="p-2.5 text-right"><button className="text-blue-700 hover:underline font-bold">Details</button></td>
                          </tr>
                        ))}
                        {filteredOutbreaks.length === 0 && (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-slate-400">No outbreaks match your search.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gis-map' && (
              <div className="space-y-4">
                <Hero
                  bg="linear-gradient(135deg,#0369a1 0%,#075985 55%,#0b1026 100%)"
                  crumb="GIS Disease Surveillance"
                  crumbCls="text-sky-200"
                  icon={Radar}
                  iconTag="#7dd3fc"
                  tag="LIVE FEED"
                  tagDot="bg-emerald-400"
                  title="National GIS Spatial Intelligence Map"
                  desc="Live outbreak clusters, risk heat-zones and vector movement tracked across every district - refreshed from the field grid."
                  stats={gisStats}
                  actions={
                    <>
                      <button className="gov-btn shrink-0"><Download size={14} /> Export Map GIS Layer</button>
                      <button className="gov-btn gov-btn-outline shrink-0" onClick={() => toggleGisLayer('density')}><Layers size={14} /> Toggle Heatmap</button>
                    </>
                  }
                />

                <section className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden fade-up">
                  <div className="flex flex-col lg:flex-row h-[620px]">
                    <div className="w-full lg:w-64 bg-slate-900/70 border-r border-slate-800 p-3 text-white z-20 flex flex-col justify-between shrink-0">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">GIS Data Layers</h3>
                          <div className="space-y-1.5 text-xs">
                            {[
                              { k: 'clusters', l: 'Confirmed Disease Clusters' },
                              { k: 'cases', l: 'Case Pins (Field Data)' },
                              { k: 'quarantine', l: '5km Quarantine Zones' },
                              { k: 'mvu', l: '1962 MVU GPS Real-time Trackers' },
                            ].map((it) => (
                              <label key={it.k} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={gisLayers[it.k]} onChange={() => toggleGisLayer(it.k)} className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800" />
                                <span>{it.l}</span>
                              </label>
                            ))}
                            {[
                              { k: 'routes', l: 'Migratory Pastoral Routes' },
                              { k: 'density', l: 'Sero-prevalence Density' },
                            ].map((it) => (
                              <label key={it.k} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={gisLayers[it.k]} onChange={() => toggleGisLayer(it.k)} className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800" />
                                <span>{it.l}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-slate-800 pt-3">
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">District Risk Threshold</h3>
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
                    <div className="relative flex-1">
                      <MapContainer
                        center={[23.5, 80.5]}
                        zoom={5}
                        scrollWheelZoom={false}
                        maxBounds={[[6.0, 68.0], [38.0, 98.0]]}
                        maxBoundsViscosity={1.0}
                        className="absolute inset-0 w-full h-full z-0"
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution='&copy; OpenStreetMap' />

                        <MapOverlays active={gisLayers} onOpenCase={openCase} />
                      </MapContainer>
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-slate-900/85 backdrop-blur border border-slate-700 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Severe <span className="font-black text-white">{gisCounts.severe}</span></span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-orange-400"></span> High <span className="font-black text-white">{gisCounts.high}</span></span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Moderate <span className="font-black text-white">{gisCounts.moderate}</span></span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Watch <span className="font-black text-white">{gisCounts.watch}</span></span>
                      </div>
                      <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur border border-slate-700 rounded-lg p-1">
                        <span className="tag bg-rose-500/90 text-white"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span> LIVE</span>
                        <span className="text-[10px] font-bold text-slate-300 px-2">Spatial Cluster Map</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="kpi-card p-5 fade-up flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center"><Layers size={16} /></div>
                      <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Heat-Zone Mix</h2>
                    </div>
                    <span className="tag bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">{gisClusters.length} zones</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-10 py-4">
                    <div className="relative w-[230px] h-[230px] shrink-0">
                      <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#1d4ed8 0 21%, #3b82f6 21% 50%, #60a5fa 50% 82%, #93c5fd 82% 100%)' }}></div>
                      <div className="absolute inset-0 m-8 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-5xl font-black text-slate-900 dark:text-white stat-ticker">{gisClusters.length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">zones</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                      <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-blue-700"></span><div><div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Critical</div><div className="text-[10px] text-slate-400">{gisCounts.severe} zones</div></div></div>
                      <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span><div><div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">High</div><div className="text-[10px] text-slate-400">{gisCounts.high} zones</div></div></div>
                      <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-blue-400"></span><div><div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Moderate</div><div className="text-[10px] text-slate-400">{gisCounts.moderate} zones</div></div></div>
                      <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-blue-300"></span><div><div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Watch</div><div className="text-[10px] text-slate-400">{gisCounts.watch} zones</div></div></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <TrendingUp size={12} className="inline mr-1" /> {gisClusters.length} = {gisCounts.severe} + {gisCounts.high} + {gisCounts.moderate} + {gisCounts.watch} · {gisRising} zones rising vs last week
                  </div>
                </section>
              <section className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden fade-up">
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                    <div className="w-full lg:w-72 bg-slate-900/70 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 text-white shrink-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center"><MapPin size={16} /></div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">All-India Animal Distribution</h3>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">20th Livestock Census · species population by state, pushed live from Bharat Pashudhan.</p>
                      <div className="mt-4 space-y-2.5">
                        {indiaAnimalStats.map((s) => (
                          <div key={s.label} className="flex items-center gap-3 rounded-lg bg-slate-800/60 border border-slate-700/60 p-2">
                            <div className="w-12 h-10 rounded-md overflow-hidden ring-1 ring-white/10 shrink-0">
                              <img src={s.img} alt={s.label} className="w-full h-full object-cover" loading="lazy" onError={(e) => { const f = speciesFallback[s.label]; if (f) { e.currentTarget.src = f; e.currentTarget.onerror = null } else { e.currentTarget.style.display = 'none' } }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-200">{s.label}</span>
                                <span className="text-[10px] font-black text-emerald-300 stat-ticker">{s.value}<span className="text-[8px] text-slate-400"> {s.unit}</span></span>
                              </div>
                              <div className="mini-progress mt-1"><i style={{ width: (parseFloat(s.value) / 851.81) * 100 + '%' }} className="bg-emerald-400"></i></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2.5">
                        <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Total Livestock</div>
                        <div className="text-xl font-black text-white stat-ticker">535.78 <span className="text-[11px] text-slate-400">million</span></div>
                        <div className="text-[9px] text-emerald-300">+4.6% vs 19th census</div>
                      </div>
                    </div>
                    <div className="relative flex-1 min-h-[380px]">
                      <MapContainer
                        center={[22.5, 80.5]}
                        zoom={5}
                        scrollWheelZoom={false}
                        maxBounds={[[6.0, 68.0], [38.0, 98.0]]}
                        maxBoundsViscosity={1.0}
                        className="absolute inset-0 w-full h-full z-0"
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution='&copy; OpenStreetMap' />
                        {indiaMapPins.map((p) => (
                          <CircleMarker key={p.name} center={[p.lat, p.lng]} radius={9} pathOptions={{ color: '#fff', weight: 1.5, fillColor: p.cls === 'bg-emerald-400' ? '#34d399' : p.cls === 'bg-sky-400' ? '#38bdf8' : p.cls === 'bg-amber-400' ? '#fbbf24' : p.cls === 'bg-rose-400' ? '#fb7185' : '#a78bfa', fillOpacity: 0.9 }}>
                            <Tooltip direction="top" offset={[0, -10]} className="!bg-slate-950 !text-white !border-slate-700 !shadow-lg !rounded-lg !px-2.5 !py-1.5 !text-[10px]">
                              <span className="font-bold">{p.name}</span> · {p.cap}<br />
                              <span>{p.top}</span> · pop {p.pop}
                            </Tooltip>
                          </CircleMarker>
                        ))}
                      </MapContainer>
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-slate-900/85 backdrop-blur border border-slate-700 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Cattle</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Buffalo</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Goat</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Poultry</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="space-y-4">
                <Hero
                  bg="linear-gradient(135deg,#7c1d1d 0%,#4a1212 55%,#0b1026 100%)"
                  crumb="Case Registry & Alerts"
                  crumbCls="text-red-200"
                  icon={Activity}
                  iconTag="#fca5a5"
                  tag="LIVE FEED"
                  tagDot="bg-red-400"
                  title="National Disease Case Registry"
                  desc="Suspected, under-investigation and laboratory-confirmed clinical log from field units."
                  stats={caseStats}
                />

                <section className="kpi-card p-5 fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 flex items-center justify-center overflow-hidden">
                        <img src="img/icon/icon_piority.png" alt="Priority Triage" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      </div>
                      <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Priority Triage</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tag bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400">4 actionable now</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => scrollTriage(-1)} className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Scroll left"><ChevronLeft size={16} /></button>
                        <button onClick={() => scrollTriage(1)} className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Scroll right"><ChevronRight size={16} /></button>
                      </div>
                    </div>
                  </div>
                  <div ref={triageRef} className="flex gap-3 overflow-x-auto pb-3 pt-0.5 px-0.5 custom-scrollbar">
                    {triageCards.map((c) => (
                      <div key={c.id} onClick={() => openCase(c.id)} className={`w-1/3 min-w-[260px] shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border-l-4 ${c.border} cursor-pointer transition hover:shadow-md hover:-translate-y-0.5`}>
                        <div className="relative h-32 overflow-hidden rounded-lg mb-3 bg-slate-200 dark:bg-slate-700">
                          <img src={c.img} alt={c.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          <span className={`absolute bottom-1 left-1 tag ${c.tagCls}`}>{c.tag}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-xs">{c.id}</span>
                          <span className={`tag ${c.statusCls}`}>{c.status}</span>
                        </div>
                        <div className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-100">{c.title}</div>
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{c.desc}</div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{c.owner}</span>
                          <button onClick={(e) => { e.stopPropagation(); openCase(c.id) }} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">View Full Case →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="kpi-card overflow-hidden fade-up">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Case Registry</h2>
                    <span className="text-[10px] font-semibold text-slate-400">synced with Bharat Pashudhan</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Case Ref ID</th>
                          <th className="px-5 py-3 font-semibold">Ear Tag / Species</th>
                          <th className="px-5 py-3 font-semibold">Reported Symptoms</th>
                          <th className="px-5 py-3 font-semibold">Reporting Authority</th>
                          <th className="px-5 py-3 font-semibold">Verification Status</th>
                          <th className="px-5 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {caseRegistry.map((c) => (
                          <tr key={c.id}>
                            <td className="px-5 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">{c.id}</td>
                            <td className="px-5 py-3">{c.tag}</td>
                            <td className={`px-5 py-3 ${c.symCls}`}>{c.sym}</td>
                            <td className="px-5 py-3">{c.auth}</td>
                            <td className="px-5 py-3"><span className={`tag ${c.statusCls}`}>{c.status}</span></td>
                            <td className="px-5 py-3 text-right"><button onClick={() => openCase(c.id)} className="font-bold text-blue-700 dark:text-blue-400 hover:underline">View File</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · Case Registry &amp; Epidemiological Investigations</footer>
              </div>
            )}

            {activeTab === 'farms' && (
              <div className="space-y-4">
                <Hero
                  bg="linear-gradient(135deg,#0f766e 0%,#134e4a 55%,#0b1026 100%)"
                  crumb="All India Animals · City / Gram / Farm"
                  crumbCls="text-teal-200"
                  icon={Landmark}
                  iconTag="#5eead4"
                  tag="API SYNCED"
                  tagDot="bg-teal-400"
                  title="Registered Livestock Holdings Registry"
                  desc="Real-time synchronized data with National Livestock Mission & Pashu Aadhaar."
                  stats={[
                    { label: 'Registered Holdings', value: '80.4', suffix: 'M', sub: 'small & commercial', bar: '#60a5fa', icon: Building2, dot: 'bg-sky-400' },
                    { label: 'Tagged Animals', value: '390,421,800', sub: '12-digit poly tags', bar: '#34d399', icon: Tag, dot: 'bg-emerald-400' },
                    { label: 'Pashu Aadhaar Sync', value: '99.4', suffix: '%', sub: 'live API linkage', bar: '#a78bfa', icon: Fingerprint, dot: 'bg-violet-400' },
                    { label: 'Updated Today', value: '12,408', sub: 'birth / death / tags', bar: '#38bdf8', icon: RefreshCw, dot: 'bg-sky-400' },
                  ]}
                />

                <section className="grid lg:grid-cols-5 gap-4 items-stretch">
                  <div className="lg:col-span-3 flex flex-col gap-4">
                    {farmRows.map((row, ri) => (
                      <div key={ri} className="flex gap-4 items-stretch overflow-x-auto custom-scrollbar px-2 pb-2">
                        {row.map((f) => {
                          const Icon = f.icon
                          return (
                            <div key={f.name} style={{ flex: '0 0 calc((100% - 32px)/3)' }} className="kpi-card overflow-hidden fade-up">
                              <div className="relative h-48 overflow-hidden" style={{ background: f.grad }}>
                                <div className="absolute inset-0 flex items-center justify-center"><Icon size={36} className="text-white/60" strokeWidth={1.5} /></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-white drop-shadow">{f.name}</span>
                                  <span className="text-[10px] font-black text-white drop-shadow">{f.pct}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-4 lg:h-[640px]">
                    <div className="kpi-card p-3 fade-up">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 flex items-center justify-center"><BarChart3 size={16} /></div>
                          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Tagged Population Mix</h2>
                        </div>
                        <span className="tag bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400">national</span>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { n: 'Bovine', p: '64%', w: '64%', c: 'bg-emerald-500', t: 'text-emerald-600 dark:text-emerald-400' },
                          { n: 'Ovine', p: '21%', w: '21%', c: 'bg-blue-500', t: 'text-blue-600 dark:text-blue-400' },
                          { n: 'Caprine', p: '9%', w: '9%', c: 'bg-amber-500', t: 'text-amber-600 dark:text-amber-400' },
                          { n: 'Swine', p: '4%', w: '4%', c: 'bg-rose-500', t: 'text-rose-600 dark:text-rose-400' },
                          { n: 'Poultry', p: '2%', w: '2%', c: 'bg-purple-500', t: 'text-purple-600 dark:text-purple-400' },
                        ].map((r) => (
                          <div key={r.n} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{r.n}</span>
                              <span className={`text-[11px] font-black ${r.t}`}>{r.p}</span>
                            </div>
                            <div className="mini-progress mt-1.5"><i style={{ width: r.w }} className={r.c}></i></div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                        <Info size={12} className="inline" /> Ear-tag registration drives prioritise bovine calves under NADCP Round 7.
                      </div>
                    </div>

                    <div className="kpi-card overflow-hidden fade-up flex-1 min-h-0 flex flex-col">
                      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Recent Glossary Sync</h2>
                        <span className="text-[10px] font-semibold text-slate-400">sample holdings</span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                              <tr>
                                <th className="px-5 py-3 font-semibold">Holding ID</th>
                                <th className="px-5 py-3 font-semibold">District</th>
                                <th className="px-5 py-3 font-semibold">Owner</th>
                                <th className="px-5 py-3 font-semibold">Tagged Animals</th>
                                <th className="px-5 py-3 font-semibold">Pashu Aadhaar</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {farmHoldings.map((h) => (
                                <tr key={h.id}>
                                  <td className="px-5 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">{h.id}</td>
                                  <td className="px-5 py-3">{h.dist}</td>
                                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{h.owner}</td>
                                  <td className="px-5 py-3 font-mono stat-ticker">{h.n}</td>
                                  <td className="px-5 py-3"><span className={`tag ${h.tagCls}`}>{h.tag}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <footer className="pb-3 pt-1 text-center text-[10px] text-slate-400">PashuSahaya · Livestock Holdings &amp; Bharat Pashudhan Registry</footer>
              </div>
            )}

            {activeTab === 'vaccination' && <VaccinationTab />}

            {activeTab === 'lab' && <LabTab />}

            {activeTab === 'analytics' && <AnalyticsTab dark={dark} />}

            {activeTab === 'mvu' && <MVUTab />}

            {activeTab === 'reports' && <ReportsTab />}

            {activeTab === 'medteam' && <MedTeamTab />}

            {activeTab === 'govteam' && <GovTeamTab dark={dark} />}

            {activeTab === 'rescueteam' && <RescueTeamTab />}
          </div>

          <footer className="pb-3 pt-2 text-center text-[10px] text-slate-400">
            PashuSahaya · National Livestock Surveillance Network · Emergency Helpline 1962
          </footer>
        </main>
      </div>
      <AIHelpDesk />
      <CaseDetailModal d={selectedCase} onClose={() => setSelectedCase(null)} />
    </div>
  )
}