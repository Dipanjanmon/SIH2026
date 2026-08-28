import Sidebar from "./Sidebar";
import OfflineIndicator from "./OfflineIndicator";
import { Bell, ChevronDown, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const roleLabel: Record<string, string> = {
    ADMIN: "System Admin",
    VETERINARIAN: "Veterinarian",
    FARMER: "Farmer",
    FIELD_OFFICER: "Field Officer",
    LAB_TECHNICIAN: "Lab Technician",
    GOVT_OFFICIAL: "Govt. Official",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <Sidebar />

      <div className="ml-64">
        <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex h-full items-center justify-between px-6">
            <div>
              <p className="text-xs font-medium text-gray-400">
                Livestock Health Surveillance
              </p>
              <h1 className="text-base font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex h-9 w-64 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 focus-within:bg-white">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">
                  /
                </kbd>
              </div>

              <div className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-gray-600">
                  System Online
                </span>
              </div>

              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  3
                </span>
              </button>

              <div className="h-8 w-px bg-gray-200" />

              <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username || "User"}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-gray-400">
                    <ShieldCheck className="h-3 w-3" />
                    {roleLabel[user?.role || ""] || user?.role}
                  </p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
