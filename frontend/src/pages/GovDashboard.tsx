import { useState, useEffect, useRef } from 'react';
import {
  Tag, AlertTriangle, ShieldCheck, FlaskRound, Truck, TrendingUp, ArrowDown,
  MapPin, BellRing, Download, PlusCircle, Activity, CheckCircle, Eye, Filter,
  X, Plus, Minus, Layers, Search, ClipboardList, FileText, Home,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import GovSidebar, { type GovTab } from '../components/gov/GovSidebar';
import GovHeader from '../components/gov/GovHeader';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler,
);

const ROLE_BANNERS: Record<string, { title: string; badge: string; badgeColor: string; subtitle: string }> = {
  GOVT_OFFICIAL: {
    title: 'National Animal Disease Control & Epidemic Intelligence Dashboard',
    badge: 'HQ Command',
    badgeColor: 'bg-amber-500 text-gov-900',
    subtitle: 'Real-time epidemiological monitoring across 535.78M registered livestock under LHDCP Framework',
  },
  ADMIN: {
    title: 'PashuRaksha System Administration & Data Sync Portal',
    badge: 'System Admin',
    badgeColor: 'bg-slate-700 text-white',
    subtitle: 'Manage user roles, Bharat Pashudhaar API sync, and infrastructure logs',
  },
  VETERINARIAN: {
    title: 'Field Veterinary Services & Mobile Unit Operational Portal',
    badge: 'Field Ops',
    badgeColor: 'bg-blue-500 text-white',
    subtitle: 'Doorstep livestock healthcare, outbreak response, and vaccination verification',
  },
  FARMER: {
    title: 'Pashu Swasthya Farmer Portal · My Livestock Records',
    badge: 'Farmer Portal',
    badgeColor: 'bg-emerald-500 text-white',
    subtitle: 'Track your tagged animal vaccinations, disease alerts in your Panchayat, and 1962 requests',
  },
  LAB_TECHNICIAN: {
    title: 'National Disease Diagnostic Laboratory & Genomic Surveillance Portal',
    badge: 'Lab HQ',
    badgeColor: 'bg-purple-500 text-white',
    subtitle: 'Sample tracking pipeline, PCR results verification, and strain serotyping',
  },
  FIELD_OFFICER: {
    title: 'Field Operations & Surveillance Portal',
    badge: 'Field Ops',
    badgeColor: 'bg-blue-500 text-white',
    subtitle: 'Field inspection visits and livestock health monitoring',
  },
};

const PRIMARY_ACTION: Record<string, string> = {
  GOVT_OFFICIAL: 'Report New Suspected Case',
  ADMIN: 'Manage API Gateways',
  VETERINARIAN: 'Log Field Inspection Visit',
  FARMER: 'Call 1962 Mobile Doctor',
  LAB_TECHNICIAN: 'Upload Lab Test Result',
  FIELD_OFFICER: 'Log Field Inspection Visit',
};

interface ClusterNode {
  id: string;
  name: string;
  top: string;
  left: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  label: string;
  pulse: boolean;
  disease: string;
  desc: string;
}

const CLUSTER_NODES: ClusterNode[] = [
  { id: 'c1', name: 'Barmer RJ', top: '38%', left: '24%', severity: 'critical', label: '!', pulse: true, disease: 'FMD Serotype O', desc: 'Clinical FMD confirmed across 14 bovine holdings. Quarantine enforced, ring vaccination underway.' },
  { id: 'c2', name: 'Mehsana GJ', top: '48%', left: '28%', severity: 'high', label: 'L', pulse: true, disease: 'LSD', desc: 'Multiple Lumpy Skin Disease suspected cases in Kankrej cattle. Sample collection in progress.' },
  { id: 'c3', name: 'Alappuzha KL', top: '82%', left: '42%', severity: 'critical', label: 'A', pulse: true, disease: 'Avian Influenza H5N1', desc: 'Highly pathogenic avian influenza suspected in backyard duck flocks. Culling protocol activated.' },
  { id: 'c4', name: 'Kamrup AS', top: '35%', left: '78%', severity: 'high', label: 'S', pulse: true, disease: 'ASF', desc: 'African Swine Fever confirmed in local swine population. Containment zone delineated.' },
  { id: 'c5', name: 'Mathura UP', top: '32%', left: '42%', severity: 'moderate', label: 'P', pulse: false, disease: 'PPR', desc: 'Peste des Petits Ruminants under observation in Sirohi goats. Surveillance intensified.' },
  { id: 'c6', name: 'Dharwad KA', top: '68%', left: '38%', severity: 'low', label: 'B', pulse: false, disease: 'Bluetongue', desc: 'Bluetongue detected in Marwari ovine. Low intensity, surveillance active.' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  moderate: 'bg-yellow-400',
  low: 'bg-emerald-500',
};

const SEVERITY_PULSE: Record<string, string> = {
  critical: 'pulse-critical',
  high: 'pulse-high',
  moderate: '',
  low: '',
};

const OUTBREAK_ROWS = [
  { id: 'CS-2026-9921', district: 'Barmer RJ', disease: 'FMD', species: 'Bovine (Gir)', cases: 14, status: 'QUARANTINE ENFORCED', statusColor: 'text-red-700 dark:text-red-400', severity: 'CRITICAL', sevColor: 'bg-red-500' },
  { id: 'CS-2026-9918', district: 'Alappuzha KL', disease: 'Avian Influenza', species: 'Poultry (Duck)', cases: 120, status: 'SAMPLES EN ROUTE', statusColor: 'text-yellow-600 dark:text-yellow-400', severity: 'HIGH', sevColor: 'bg-orange-500' },
  { id: 'CS-2026-9905', district: 'Mehsana GJ', disease: 'LSD', species: 'Bovine (Kankrej)', cases: 8, status: 'RING VACCINATION', statusColor: 'text-blue-700 dark:text-blue-400', severity: 'MODERATE', sevColor: 'bg-amber-500' },
  { id: 'CS-2026-9891', district: 'Kamrup AS', disease: 'ASF', species: 'Swine (Local)', cases: 35, status: 'CONTAINMENT ACTIVE', statusColor: 'text-orange-700 dark:text-orange-400', severity: 'HIGH', sevColor: 'bg-orange-500' },
  { id: 'CS-2026-9877', district: 'Mathura UP', disease: 'PPR', species: 'Caprine (Sirohi)', cases: 12, status: 'UNDER OBSERVATION', statusColor: 'text-blue-700 dark:text-blue-400', severity: 'LOW', sevColor: 'bg-emerald-500' },
  { id: 'CS-2026-9863', district: 'Dharwad KA', disease: 'Bluetongue', species: 'Ovine (Marwari)', cases: 3, status: 'SURVEILLANCE ACTIVE', statusColor: 'text-emerald-700 dark:text-emerald-400', severity: 'LOW', sevColor: 'bg-emerald-500' },
];

const ALERT_FEED = [
  { sev: 'CRITICAL', sevColor: 'bg-red-500', text: 'FMD Serotype O Confirmed', loc: 'Barmer RJ', border: 'border-l-red-500' },
  { sev: 'HIGH', sevColor: 'bg-orange-500', text: 'Avian Influenza H5N1 Suspected', loc: 'Alappuzha KL', border: 'border-l-orange-500' },
  { sev: 'MODERATE', sevColor: 'bg-yellow-400', text: 'Brucellosis Cluster Warning', loc: 'Mehsana GJ', border: 'border-l-yellow-400' },
  { sev: 'HIGH', sevColor: 'bg-orange-500', text: 'LSD Suspected Cases', loc: 'Jodhpur RJ', border: 'border-l-orange-500' },
  { sev: 'CRITICAL', sevColor: 'bg-red-500', text: 'ASF Confirmed', loc: 'Kamrup AS', border: 'border-l-red-500' },
];

function IndiaOutline() {
  return (
    <svg viewBox="0 0 300 340" className="absolute inset-0 w-full h-full opacity-40 dark:opacity-30" preserveAspectRatio="xMidYMid meet">
      <path
        d="M150 20 C120 30 110 60 130 80 C150 100 140 130 170 140 C200 150 220 170 210 200 C200 230 230 250 200 270 C180 290 160 280 150 300 C140 320 120 320 110 300 C95 270 80 250 70 220 C60 190 70 160 60 140 C50 120 40 100 60 80 C80 60 100 40 130 35 C140 30 150 18 150 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-slate-300 dark:text-slate-600"
      />
    </svg>
  );
}

function GisMap({ expanded }: { expanded: boolean }) {
  return (
    <div className={`relative rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden bg-slate-900 ${expanded ? 'h-[560px]' : 'h-[340px]'}`}>
      <div className="absolute inset-0 gis-grid opacity-60" />
      <IndiaOutline />
      {CLUSTER_NODES.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${SEVERITY_COLOR[node.severity]} ${SEVERITY_PULSE[node.severity]} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30 hover:scale-110 transition`}
          style={{ top: node.top, left: node.left }}
          onClick={() => undefined}
          title={`${node.name} · ${node.disease}`}
        >
          {node.label}
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white bg-black/70 px-1 rounded pointer-events-none">
            {node.name}
          </span>
        </button>
      ))}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur rounded px-2 py-1.5 text-[10px] text-white flex flex-col gap-1">
        <span className="font-semibold mb-0.5">Legend</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Moderate</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low</span>
      </div>
    </div>
  );
}

export default function GovDashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<GovTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('ALL');
  const [, setTimeframe] = useState<string>('Last 30 Days');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{ title: string; disease: string; risk: string; desc: string }>({
    title: '', disease: '', risk: '', desc: '',
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeTab]);

  const showMapDetail = (title: string, disease: string, risk: string, desc: string) => {
    setModalData({ title, disease, risk, desc });
    setModalOpen(true);
  };

  const gridColor = isDark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.2)';
  const tickColor = isDark ? '#cbd5e1' : '#475569';

  const lineData = {
    labels: ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
    datasets: [
      {
        label: 'FMD Outbreaks',
        data: [42, 38, 25, 18, 14, 12],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.15)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#ef4444',
      },
      {
        label: 'Lumpy Skin Cases',
        data: [65, 50, 42, 30, 22, 18],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.12)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#f97316',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: tickColor,
    plugins: {
      legend: { labels: { color: tickColor } },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor } },
    },
  };

  const barData = {
    labels: ['FMD Serotype O', 'FMD Serotype A', 'FMD Asia 1', 'Brucella Calves'],
    datasets: [
      {
        label: 'Protective Antibody Titre (%)',
        data: [78.1, 71.7, 77.6, 75.6],
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#10b981'],
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: tickColor,
    plugins: {
      legend: { labels: { color: tickColor } },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor }, suggestedMax: 100 },
    },
  };

  const userRole = user?.role || 'GOVT_OFFICIAL';
  const banner = ROLE_BANNERS[userRole] || ROLE_BANNERS.GOVT_OFFICIAL;
  const primaryAction = PRIMARY_ACTION[userRole] || PRIMARY_ACTION.GOVT_OFFICIAL;

  const kpiCards = [
    { icon: Tag, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30', title: 'Total Tagged Animals', value: '390.42M', sub: '+1.2%', trend: 'up' as const, extra: 'Bharat Pashudhaar' },
    { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500', title: 'Active Disease Hotspots', value: '14 Clusters', sub: '-3 vs last wk', trend: 'down' as const, extra: 'Under watch' },
    { icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30', title: 'FMD Vaccine Round 7', value: '84.6%', sub: 'Target 90%', trend: 'up' as const, extra: 'Progress', progress: 84.6 },
    { icon: FlaskRound, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30', title: 'Lab Diagnostic Pipeline', value: '1,482', sub: '244 Pending', trend: 'up' as const, extra: 'Samples' },
    { icon: Truck, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30', title: '1962 MVU Emergency Units', value: '4,019 Active', sub: '96.8% Operational', trend: 'up' as const, extra: 'Nationwide' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-gray-900">
      <GovHeader />

      <div className="flex flex-1 overflow-hidden">
        <GovSidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
            </div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="text-xs border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ALL States</option>
              <option value="RJ">RJ - Rajasthan</option>
              <option value="GJ">GJ - Gujarat</option>
              <option value="KA">KA - Karnataka</option>
              <option value="UP">UP - Uttar Pradesh</option>
              <option value="MH">MH - Maharashtra</option>
            </select>
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="text-xs border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ALL Diseases</option>
              <option value="FMD">FMD</option>
              <option value="LSD">LSD</option>
              <option value="BRU">BRU</option>
              <option value="PPR">PPR</option>
              <option value="ASF">ASF</option>
            </select>
            <select
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Current Quarter</option>
              <option>Annual</option>
            </select>
            <button className="ml-auto flex items-center space-x-1.5 text-xs font-semibold border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-gray-700 transition">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-gray-700 rounded px-2 py-1.5 bg-slate-50 dark:bg-gray-900">
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search case / district..."
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-40"
              />
            </div>
            <button className="flex items-center space-x-1.5 text-xs font-semibold bg-gov-700 dark:bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-gov-800 dark:hover:bg-blue-700 transition">
              <PlusCircle className="w-4 h-4" />
              <span>{primaryAction}</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Role Context Banner */}
              <div className="bg-gradient-to-r from-gov-800 to-gov-900 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 text-white flex items-start justify-between shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${banner.badgeColor}`}>
                      {banner.badge}
                    </span>
                  </div>
                  <h1 className="text-lg font-bold leading-tight">{banner.title}</h1>
                  <p className="text-xs text-slate-200 dark:text-slate-300 mt-1">{banner.subtitle}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">National Index Status</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 bg-emerald-500 text-emerald-950 text-xs font-bold px-2 py-1 rounded">
                    <CheckCircle className="w-3.5 h-3.5" />
                    ALERT LEVEL 2 - LOW/CONTAINED
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {kpiCards.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.title} className={`bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-3.5 ${kpi.color.includes('border-l') ? 'border-l-4 border-l-amber-500' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${kpi.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{kpi.extra}</span>
                      </div>
                      <div className="mt-2 text-xl font-bold text-slate-900 dark:text-gray-100">{kpi.value}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{kpi.title}</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-emerald-500" />
                        )}
                        <span className="text-emerald-600 dark:text-emerald-400">{kpi.sub}</span>
                      </div>
                      {kpi.progress !== undefined && (
                        <div className="mt-2 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpi.progress}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* GIS Map Preview + Alert Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold">Live GIS Disease Outbreak Map · India Command Center</span>
                    </div>
                    <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      onClick={() => setActiveTab('gis-map')}>
                      Expand
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-3 mb-2 text-[11px]">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Moderate</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low</span>
                    </div>
                    <GisMap expanded={false} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex flex-col">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <BellRing className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold">Real-time Epidemic Alerts</span>
                    </div>
                    <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">3 CRITICAL</span>
                  </div>
                  <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {ALERT_FEED.map((alert, i) => (
                      <div key={i} className={`border-l-4 ${alert.border} bg-slate-50 dark:bg-gray-900 rounded-r p-2`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${alert.sevColor}`}>{alert.sev}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{alert.loc}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-100 mt-0.5">{alert.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outbreak Table */}
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-gray-700 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active Outbreak Case Register</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Case ID</th>
                        <th className="text-left px-3 py-2 font-semibold">District</th>
                        <th className="text-left px-3 py-2 font-semibold">Disease</th>
                        <th className="text-left px-3 py-2 font-semibold">Species</th>
                        <th className="text-left px-3 py-2 font-semibold">Cases</th>
                        <th className="text-left px-3 py-2 font-semibold">Status</th>
                        <th className="text-left px-3 py-2 font-semibold">Severity</th>
                        <th className="text-left px-3 py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                      {OUTBREAK_ROWS.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-gray-900">
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{row.id}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.district}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.disease}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.species}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900 dark:text-gray-100">{row.cases}</td>
                          <td className={`px-3 py-2 font-semibold ${row.statusColor}`}>{row.status}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${row.sevColor}`}>{row.severity}</span>
                          </td>
                          <td className="px-3 py-2">
                            <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                              onClick={() => showMapDetail(row.district, row.disease, row.severity, `${row.disease} outbreak recorded in ${row.district} affecting ${row.species} with ${row.cases} cases. Status: ${row.status}.`)}>
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Surveillance Chart */}
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-2 mb-3 text-slate-700 dark:text-slate-200">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold">Disease Surveillance Trend · National Outbreak Decline</span>
                </div>
                <div className="h-64">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </div>
            </div>
          )}

          {/* GIS MAP VIEW */}
          {activeTab === 'gis-map' && (
            <div className="space-y-4" ref={mapContainerRef}>
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold">National GIS Disease Outbreak Map · India Command Center</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"><Plus className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"><Minus className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"><Layers className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-3">
                  <GisMap expanded={true} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Color Legend</h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical Risk Zone</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" /> High Risk Zone</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Moderate Risk Zone</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Low / Contained Zone</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-4 lg:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Risk Zone Explanation</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Risk zones are computed from a composite vulnerability index combining livestock density, border
                    porosity, historical outbreak frequency, and vector proliferation. Critical zones trigger automatic
                    deployment of Mobile Veterinary Units and ring vaccination protocols under the NADCP framework.
                  </p>
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-gray-900 rounded border border-slate-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Spatial Intelligence
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Geospatial layers are powered by ISRO Bhuvan satellite imagery and corroborated with NIC
                      district-level administrative boundaries for precision outbreak localization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASES VIEW */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-gray-700 flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">National Disease Case Registry & Epidemiological Investigations</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Case Ref ID</th>
                        <th className="text-left px-3 py-2 font-semibold">Ear Tag ID</th>
                        <th className="text-left px-3 py-2 font-semibold">Species & Breed</th>
                        <th className="text-left px-3 py-2 font-semibold">Reported Symptoms</th>
                        <th className="text-left px-3 py-2 font-semibold">Reporting Authority</th>
                        <th className="text-left px-3 py-2 font-semibold">Verification Status</th>
                        <th className="text-left px-3 py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                      {[
                        { ref: 'CR-2026-7741', tag: 'IN-BR-44G0102', sp: 'Bovine (Gir)', sym: 'Fever, salivation, hoof lesions', auth: 'MVU Unit 14', status: 'LAB CONFIRMED', sc: 'text-emerald-700 dark:text-emerald-400' },
                        { ref: 'CR-2026-7738', tag: 'IN-KA-21L8841', sp: 'Bovine (Kankrej)', sym: 'Nodular skin lesions', auth: 'State Vet Dept', status: 'SAMPLE EN ROUTE', sc: 'text-yellow-600 dark:text-yellow-400' },
                        { ref: 'CR-2026-7729', tag: 'IN-AS-09S2210', sp: 'Swine (Local)', sym: 'High mortality, hemorrhage', auth: 'Field Surveillance', status: 'UNDER INVESTIGATION', sc: 'text-blue-700 dark:text-blue-400' },
                      ].map((r) => (
                        <tr key={r.ref} className="hover:bg-slate-50 dark:hover:bg-gray-900">
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{r.ref}</td>
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{r.tag}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{r.sp}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.sym}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.auth}</td>
                          <td className={`px-3 py-2 font-semibold ${r.sc}`}>{r.status}</td>
                          <td className="px-3 py-2">
                            <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                              onClick={() => showMapDetail(r.ref, r.sp, 'Investigation', `${r.sym} reported by ${r.auth}. Current status: ${r.status}.`)}>
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FARMS VIEW */}
          {activeTab === 'farms' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Farms & Tagged Animals Registry</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { t: 'Registered Holdings', v: '80.4 Million', s: 'Across 28 states', ic: Home, c: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
                  { t: 'Unique Tagged Animals', v: '390,421,800', s: 'Bharat Pashudhaar', ic: Tag, c: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
                  { t: 'Digital Pashu Aadhaar Sync', v: '99.4% ACTIVE', s: 'Realtime sync to NIC', ic: CheckCircle, c: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
                ].map((k) => {
                  const Icon = k.ic;
                  return (
                    <div key={k.t} className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-4">
                      <div className={`inline-flex p-2 rounded-lg ${k.c}`}><Icon className="w-5 h-5" /></div>
                      <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-gray-100">{k.v}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{k.t}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{k.s}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VACCINATION VIEW */}
          {activeTab === 'vaccination' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">NADCP National Vaccination Drive</h2>
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-5 space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">FMD Round 7 National Target (535M Doses)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">84.6%</span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84.6%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Brucellosis Bovine Calves (4-8 Months)</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">75.6%</span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '75.6%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LAB VIEW */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-gray-700 flex items-center space-x-2">
                  <FlaskRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Diagnostic Sample Pipeline</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Sample ID</th>
                        <th className="text-left px-3 py-2 font-semibold">Sample Type</th>
                        <th className="text-left px-3 py-2 font-semibold">Test Panel</th>
                        <th className="text-left px-3 py-2 font-semibold">Status</th>
                        <th className="text-left px-3 py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                      {[
                        { id: 'SMP-2026-8819', type: 'Blood Serum (Bovine)', panel: 'FMD NSP ELISA', status: 'TESTING IN PROGRESS', sc: 'text-purple-700 dark:text-purple-400', bc: 'bg-purple-500' },
                        { id: 'SMP-2026-8814', type: 'Skin Scab Tissue', panel: 'LSD Real-Time PCR', status: 'RESULT CONFIRMED POSITIVE', sc: 'text-emerald-700 dark:text-emerald-400', bc: 'bg-emerald-500' },
                      ].map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-gray-900">
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{s.id}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.type}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{s.panel}</td>
                          <td className={`px-3 py-2 font-semibold flex items-center gap-1.5`}>
                            <span className={`w-2 h-2 rounded-full ${s.bc}`} /> <span className={s.sc}>{s.status}</span>
                          </td>
                          <td className="px-3 py-2">
                            <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                              onClick={() => showMapDetail(s.id, s.panel, 'Lab', `${s.type} tested via ${s.panel}. Status: ${s.status}.`)}>
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" /> FMD Protective Antibody Titre Level</h3>
                  <div className="h-64">
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> District Risk Vulnerability Index</h3>
                  <div className="space-y-5 mt-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">High Border Vulnerability</span>
                        <span className="font-bold text-red-600 dark:text-red-400">88/100</span>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Vector Proliferation Index</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">64/100</span>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '64%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MVU VIEW */}
          {activeTab === 'mvu' && (
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-gray-100">1962 Mobile Veterinary Units (MVU) Deployment</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Nationwide deployment of 4,019 active MVUs delivering doorstep livestock healthcare. 96.8% operational
                across rural and border districts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {[
                  { t: 'Active Units', v: '4,019', c: 'text-blue-600 dark:text-blue-400' },
                  { t: 'Operational Rate', v: '96.8%', c: 'text-emerald-600 dark:text-emerald-400' },
                  { t: 'Avg Response Time', v: '38 min', c: 'text-amber-600 dark:text-amber-400' },
                ].map((k) => (
                  <div key={k.t} className="border border-slate-200 dark:border-gray-700 rounded-lg p-3">
                    <div className={`text-xl font-bold ${k.c}`}>{k.v}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{k.t}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS VIEW */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-gray-100">Official DAHD & ICAR Epidemiological Bulletins</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Authoritative bulletins published by the Department of Animal Husbandry & Dairying and ICAR-NIVEDI.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  'Weekly Outbreak Intelligence Bulletin · Aug 2026',
                  'NADCP Vaccination Coverage Report · Q2 2026',
                  'Lumpy Skin Disease Situation Update · July 2026',
                  'Avian Influenza Surveillance Compendium · H5N1',
                ].map((r) => (
                  <div key={r} className="flex items-center justify-between border border-slate-200 dark:border-gray-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-gray-900">
                    <span className="text-xs text-slate-700 dark:text-slate-200">{r}</span>
                    <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline"><Download className="w-3.5 h-3.5" /> Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Map Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gov-900 dark:bg-gray-950 px-4 py-3 flex items-center justify-between">
              <span className="text-white text-sm font-bold">{modalData.title || 'Outbreak Detail'}</span>
              <button className="text-slate-300 hover:text-white" onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Disease Agent</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-gray-100">{modalData.disease}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Risk Severity</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-gray-100">{modalData.risk}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Status Summary</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{modalData.desc}</div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button className="flex-1 bg-gov-700 dark:bg-blue-600 text-white text-xs font-semibold py-2 rounded hover:bg-gov-800 dark:hover:bg-blue-700 transition">Dispatch MVU Response</button>
                <button className="px-3 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 rounded hover:bg-slate-50 dark:hover:bg-gray-700" onClick={() => setModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


