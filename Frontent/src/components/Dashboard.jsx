import { useEffect } from 'react'
import { useApp } from '../App.jsx'
import { notificationDataSeed, ROLE_NAMES } from '../data.js'
import Icon from '../icons.jsx'
import DashboardViews from './DashboardViews.jsx'
import MapModal from './MapModal.jsx'
import { neural as neuralLogo } from '../img/index.js'

const PROFILES = {
  gov: { name: 'Dr. Rajesh Kumar', role: 'Joint Commissioner (Epi)', id: 'GOV-8941-RJ', initials: 'DR', action: 'Report New Suspected Case' },
  vet: { name: 'Dr. Ananya Sharma', role: 'MVU Field Lead (Barmer)', id: 'VET-7712-14', initials: 'AS', action: 'Log Field Inspection Visit' },
  farmer: { name: 'Ramesh Patel', role: 'Registered Dairy Owner (Tag ID: 1009-88)', id: 'FAR-1009-88', initials: 'RP', action: 'Call 1962 Mobile Doctor' },
  lab: { name: 'Dr. P. S. Rao', role: 'Chief Virologist (ICAR-IVRI)', id: 'LAB-4820-IVRI', initials: 'PR', action: 'Upload Lab Test Result' },
  admin: { name: 'System Admin', role: 'PashuRaksha Administrator', id: 'ADM-SYS-01', initials: 'SA', action: 'Manage API Gateways' }
}

const ROLE_FALLBACK =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2796%27 height=%2796%27%3E%3Crect width=%2796%27 height=%2796%27 fill=%27%231e3a8a%27/%3E%3Ctext x=%2748%27 y=%2758%27 fill=%27%23ffffff%27 font-family=%27monospace%27 font-size=%2736%27 text-anchor=%27middle%27%3ENK%3C/text%3E%3C/svg%3E"

const NAV_GROUP_1 = [
  { id: 'dashboard', label: 'Surveillance Dashboard', icon: 'layout-dashboard' },
  { id: 'gis-map', label: 'GIS Disease Map', icon: 'map', badge: 'LIVE', badgeCls: 'bg-red-100 text-red-700' },
  { id: 'cases', label: 'Case Registry & Alerts', icon: 'clipboard-list' },
  { id: 'farms', label: 'Farms & Tagged Animals', icon: 'home' },
  { id: 'vaccination', label: 'NADCP Vaccination Drive', icon: 'syringe' },
  { id: 'lab', label: 'Lab Diagnostic Workflow', icon: 'flask-conical' },
  { id: 'analytics', label: 'Epidemiology Analytics', icon: 'bar-chart-3' }
]

const NAV_GROUP_2 = [
  { id: 'mvu', label: 'Mobile Vet Units (1962)', icon: 'truck' },
  { id: 'reports', label: 'Outbreak Bulletins', icon: 'file-text' }
]

function NavButton({ item, active, onClick }) {
  return (
    <button
      id={'nav-' + item.id}
      onClick={onClick}
      title={item.label}
      className={
        'w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded transition ' +
        (active
          ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gov-800 border-l-4 border-blue-700'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gov-800 hover:text-slate-900')
      }
    >
      <Icon name={item.icon} className="w-4 h-4 shrink-0" />
      <span className="nav-label">{item.label}</span>
      {item.badge && (
        <span className={'nav-badge ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded ' + (item.badgeCls || '')}>{item.badge}</span>
      )}
    </button>
  )
}

function NotificationPanel({ rows }) {
  if (rows.length === 0) {
    return <div className="px-4 py-6 text-center text-xs text-slate-400">No new notifications</div>
  }
  return (
    <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-gov-800">
      {rows.map((n, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-gov-800 transition cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gov-800 flex items-center justify-center shrink-0">
            <Icon name={n.icon} className={'w-4 h-4 ' + n.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
              <span className="text-[9px] text-slate-400 shrink-0 ml-2">{n.time}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
            <span className={'inline-block mt-1 text-[9px] font-bold uppercase tracking-wide ' + (n.type === 'Critical' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400')}>{n.type}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const {
    role, roleLocked, switchRole,
    darkTheme, toggleTheme,
    tab, switchTab,
    sidebarCollapsed, toggleSidebar,
    notifOpen, profileOpen, notifRef, profileRef,
    toggleNotifications, clearNotifications, toggleProfileMenu, signOut,
    notifications, setNotifications, notifRendered,
    stateFilter, setStateFilter, diseaseFilter, setDiseaseFilter, applyFilters
  } = useApp()

  useEffect(() => {
    if (notifications.length === 0 && !notifRendered) {
      setNotifications(notificationDataSeed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const p = PROFILES[role] || PROFILES.gov

  return (
    <>
      <header className="bg-white dark:bg-gov-900 text-slate-800 dark:text-white border-b border-slate-200 dark:border-gov-700 h-14 flex items-center gap-4 px-4 z-30 shrink-0 shadow-sm dark:shadow-none">
        <div className="flex items-center space-x-3">
          <div className="relative logo-glow p-1 rounded-full overflow-hidden bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20">
            <img
              src={neuralLogo}
              alt="Neural Knights Logo"
              className="w-9 h-9 rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = ROLE_FALLBACK }}
            />
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-gov-700"></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wide text-base text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-emerald-300">PashuRaksha</span>
              <span className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md tracking-wider uppercase shadow-sm">PashuRaksha Portal</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 -mt-0.5">PashuRaksha · National Livestock Surveillance Network</p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-gov-700"></div>
          <div className="hidden xl:block text-[10px] leading-tight text-slate-500 dark:text-slate-400 pr-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">LHDCP · NADRS</span>
            <br />
            <span>Integrated Surveillance Grid</span>
          </div>
        </div>

        {/* Team Quick Links */}
        <div className="hidden lg:flex items-center gap-12 ml-auto">
          {['medteam', 'govteam', 'rescueteam'].map((t) => (
            <button
              key={t}
              id={t === 'medteam' ? 'teamMedBtn' : t === 'govteam' ? 'teamGovBtn' : 'teamRescueBtn'}
              onClick={() => switchTab(t)}
              className={'group p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition relative ' + (tab === t ? 'team-active' : '')}
            >
              <Icon name={t === 'medteam' ? 'stethoscope' : t === 'govteam' ? 'landmark' : 'truck'} strokeWidth={2.6} className="w-3.5 h-3.5" />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
          ))}
        </div>

        {/* Role Selector & User Profile */}
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
              <Icon name="user-cog" className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Role:
            </span>
            <select
              id="roleSelector"
              value={role}
              onChange={(e) => switchRole(e.target.value)}
              disabled={roleLocked}
              className={'bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none pl-0.5 ' + (roleLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer appearance-none')}
            >
              {Object.entries(ROLE_NAMES).map(([key, label]) => (
                <option key={key} value={key} className="bg-white dark:bg-gov-900 text-slate-900 dark:text-white">{label}</option>
              ))}
            </select>
          </div>

          <button onClick={toggleTheme} title="Toggle day / night mode" className="relative p-2 text-slate-500 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-gov-800 rounded-full border border-slate-200 dark:border-gov-700 transition">
            <Icon name={darkTheme ? 'sun' : 'moon'} className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={toggleNotifications} title="Notifications" className="relative p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gov-800 rounded-full border border-slate-200 dark:border-gov-700 transition">
              <Icon name="bell" className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gov-900"></span>
            </button>

            {notifOpen && (
              <div id="notifPanel" className="absolute right-0 top-11 w-80 bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-gov-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold px-1.5 py-0.5 rounded-full">{notifications.length}</span>
                </div>
                <NotificationPanel rows={notifications} />
                <div className="px-4 py-2.5 border-t border-slate-200 dark:border-gov-700 text-center">
                  <button onClick={clearNotifications} className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline">Clear all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="relative" ref={profileRef}>
            <button onClick={toggleProfileMenu} className="flex items-center gap-2.5 bg-slate-50 dark:bg-gov-800 border border-slate-200 dark:border-gov-700 rounded-full pl-1.5 pr-3 py-1 transition hover:bg-slate-100 dark:hover:bg-gov-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center font-bold text-xs text-white border border-blue-400 shadow-inner">
                {p.initials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold leading-none text-slate-900 dark:text-white">{p.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1">{p.role}</div>
              </div>
              <Icon name="chevron-down" className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div id="profileMenu" className="absolute right-0 top-11 w-56 bg-white dark:bg-gov-900 rounded-xl border border-slate-200 dark:border-gov-700 shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-gov-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.role}</div>
                  <div className="text-[10px] text-blue-700 dark:text-blue-400 mt-1">{p.id}</div>
                </div>
                <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <Icon name="log-out" className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <aside id="sidebar" className={'w-56 bg-white dark:bg-gov-900 border-r border-slate-200 dark:border-gov-800 flex flex-col shrink-0 z-20 shadow-sm overflow-hidden ' + (sidebarCollapsed ? 'collapsed' : '')}>
          <div className="p-3 border-b border-slate-100 dark:border-gov-800 bg-slate-50 dark:bg-gov-800 flex items-center justify-between h-12 shrink-0">
            <div className="menu-title flex items-center gap-2 whitespace-nowrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Navigation Menu</span>
              <span className="text-[10px] bg-slate-200 dark:bg-gov-700 text-slate-700 dark:text-slate-200 font-semibold px-1.5 py-0.5 rounded">v1.0</span>
            </div>
            <button onClick={toggleSidebar} title="Toggle sidebar" className="shrink-0 p-1 text-slate-500 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-gov-700 rounded transition">
              <Icon name={sidebarCollapsed ? 'panel-left-open' : 'panel-left-close'} className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_GROUP_1.map((item) => (
              <NavButton key={item.id} item={item} active={tab === item.id} onClick={() => switchTab(item.id)} />
            ))}
            <div className="pt-4 pb-1">
              <div className="menu-title px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Field Operatives</div>
            </div>
            {NAV_GROUP_2.map((item) => (
              <NavButton key={item.id} item={item} active={tab === item.id} onClick={() => switchTab(item.id)} />
            ))}
          </nav>

          <div className="side-extra p-3 border-t border-slate-200 dark:border-gov-800 bg-slate-50 dark:bg-gov-800 text-[11px] space-y-1.5 whitespace-nowrap">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Emergency Helpline:</span>
              <span className="font-bold text-blue-800 dark:text-blue-400">1962</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>ICAR-NIVEDI Feed:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">ONLINE</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-gov-800 text-[10px] text-slate-400 dark:text-slate-500 text-center">
              PashuRaksha Surveillance Network
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto p-4 custom-scrollbar">
          <div className="bg-white dark:bg-gov-900 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-gov-800 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Icon name="filter" className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Region Filter:
              </span>
              <select
                id="stateFilter"
                value={stateFilter}
                onChange={(e) => { setStateFilter(e.target.value); applyFilters() }}
                className="border border-slate-300 dark:border-gov-700 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-gov-800 text-slate-700 dark:text-slate-200 font-medium hover:border-slate-400 transition"
              >
                <option value="ALL">All States (National View)</option>
                <option value="RJ">Rajasthan</option>
                <option value="GJ">Gujarat</option>
                <option value="KA">Karnataka</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="MH">Maharashtra</option>
              </select>
              <select
                id="diseaseFilter"
                value={diseaseFilter}
                onChange={(e) => { setDiseaseFilter(e.target.value); applyFilters() }}
                className="border border-slate-300 dark:border-gov-700 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-gov-800 text-slate-700 dark:text-slate-200 font-medium hover:border-slate-400 transition"
              >
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
              <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 shadow-sm transition">
                <Icon name="download" className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-700/20 transition">
                <Icon name="plus-circle" className="w-3.5 h-3.5" />
                <span>{p.action}</span>
              </button>
            </div>
          </div>

          <DashboardViews />
        </main>
      </div>

      <MapModal />
    </>
  )
}