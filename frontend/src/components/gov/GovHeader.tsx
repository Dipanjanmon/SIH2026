import { Shield, Bell, Sun, Moon, Circle, Activity, CheckCircle2, Wifi, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const ROLE_DISPLAY: Record<string, { label: string; initials: string; avatarBg: string }> = {
  ADMIN: { label: 'System Administrator', initials: 'SA', avatarBg: 'bg-slate-600 border-slate-300' },
  GOVT_OFFICIAL: { label: 'Government Officer', initials: 'GO', avatarBg: 'bg-blue-700 border-blue-400' },
  VETERINARIAN: { label: 'Field Veterinarian', initials: 'VT', avatarBg: 'bg-emerald-600 border-emerald-300' },
  FIELD_OFFICER: { label: 'Field Officer', initials: 'FO', avatarBg: 'bg-amber-600 border-amber-300' },
  FARMER: { label: 'Livestock Owner', initials: 'LO', avatarBg: 'bg-amber-600 border-amber-300' },
  LAB_TECHNICIAN: { label: 'Lab Technician', initials: 'LT', avatarBg: 'bg-purple-600 border-purple-300' },
};

export default function GovHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const roleKey = user?.role || 'ADMIN';
  const roleInfo = ROLE_DISPLAY[roleKey] || ROLE_DISPLAY.ADMIN;
  const displayName = user?.username || 'User';

  return (
    <header className="shrink-0 z-30">
      <div className="bg-gov-900 dark:bg-gray-950 text-white h-13 flex items-center justify-between px-5 border-b border-gov-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 rounded-md shadow-lg shadow-amber-500/20">
            <Shield className="w-5 h-5 text-gov-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-wide text-white leading-none">PashuRaksha</span>
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] font-bold px-1.5 py-[2px] rounded-sm tracking-widest uppercase shadow-sm">
                National Portal
              </span>
            </div>
            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Department of Animal Husbandry & Dairying, Ministry of Fisheries · Govt. of India
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className="relative p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gov-900 dark:ring-gray-950" />
          </button>

          <div className="w-px h-6 bg-white/15 mx-1" />

          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] text-white border-2 shadow-md ${roleInfo.avatarBg}`}>
              {roleInfo.initials}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[12px] font-semibold text-white leading-tight">{displayName}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{roleInfo.label}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors ml-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gov-800 dark:bg-gray-900 border-b border-gov-700 dark:border-gray-800 h-8 flex items-center justify-between px-5">
        <div className="flex items-center gap-6 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
            <span className="text-slate-400">Surveillance:</span>
            <span className="font-semibold text-emerald-400">ACTIVE MONITORED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Active Outbreaks:</span>
            <span className="font-bold text-amber-400">14 Clusters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Bharat Pashudhaar:</span>
            <span className="font-mono font-semibold text-blue-300">39.04 Cr Tags</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">All Services Online</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-mono">v3.4-GOV</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">NIC Data Centre</span>
        </div>
      </div>
    </header>
  );
}
