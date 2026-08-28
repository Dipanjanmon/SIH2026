import {
  LayoutDashboard, Map, ClipboardList, Home, Syringe,
  FlaskConical, BarChart3, Truck, FileText, Phone, Wifi,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

export type GovTab =
  | 'dashboard' | 'gis-map' | 'cases' | 'farms'
  | 'vaccination' | 'lab' | 'analytics' | 'mvu' | 'reports';

interface GovSidebarProps {
  activeTab: GovTab;
  onTabChange: (tab: GovTab) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: GovTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Surveillance Dashboard', icon: LayoutDashboard },
  { id: 'gis-map', label: 'GIS Disease Map', icon: Map, badge: 'LIVE', badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { id: 'cases', label: 'Case Registry & Alerts', icon: ClipboardList },
  { id: 'farms', label: 'Farms & Tagged Animals', icon: Home },
  { id: 'vaccination', label: 'NADCP Vaccination Drive', icon: Syringe },
  { id: 'lab', label: 'Lab Diagnostic Workflow', icon: FlaskConical },
  { id: 'analytics', label: 'Epidemiology Analytics', icon: BarChart3 },
  { id: 'mvu', label: 'Mobile Vet Units (1962)', icon: Truck, section: 'Field Operatives' },
  { id: 'reports', label: 'NIC Outbreak Bulletins', icon: FileText },
];

export default function GovSidebar({ activeTab, onTabChange, isOpen, onToggle }: GovSidebarProps) {
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={onToggle}
        className="absolute top-4 z-30 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 shadow-md hover:shadow-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
        style={{ left: isOpen ? '204px' : '0px' }}
        title={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </button>

      <aside
        className="bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out shadow-sm"
        style={{ width: isOpen ? '220px' : '0px' }}
      >
        <div className="w-[220px] h-full flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-950">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              Main Navigation
            </span>
          </div>

          <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.section) {
                return (
                  <div key={item.id + '-section'}>
                    <div className="pt-3 pb-1 px-2">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                        {item.section}
                      </span>
                    </div>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all border-l-[3px] ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-700 dark:border-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-800 dark:hover:text-white border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-[1px] rounded ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all border-l-[3px] ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-700 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-800 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-[1px] rounded ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3 py-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Emergency Helpline
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                1962
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                ICAR-NIVEDI Feed
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-gray-800 text-[9px] text-slate-400 dark:text-slate-500 text-center font-medium">
              National Informatics Centre (NIC)
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
