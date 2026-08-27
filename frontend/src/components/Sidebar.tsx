import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Syringe,
  Map,
  FlaskConical,
  BarChart3,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const farmerLinks: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/report-disease", label: "Report Disease", icon: <AlertTriangle className="h-4 w-4" /> },
  { to: "/cases", label: "My Cases", icon: <FileText className="h-4 w-4" /> },
  { to: "/vaccinations", label: "Vaccinations", icon: <Syringe className="h-4 w-4" /> },
  { to: "/map", label: "Disease Map", icon: <Map className="h-4 w-4" /> },
];

const vetLinks: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/cases", label: "Cases", icon: <FileText className="h-4 w-4" /> },
  { to: "/cases", label: "My Assignments", icon: <Stethoscope className="h-4 w-4" /> },
  { to: "/laboratory", label: "Lab Samples", icon: <FlaskConical className="h-4 w-4" /> },
  { to: "/map", label: "Disease Map", icon: <Map className="h-4 w-4" /> },
];

const govLinks: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/cases", label: "All Cases", icon: <FileText className="h-4 w-4" /> },
  { to: "/map", label: "Disease Map", icon: <Map className="h-4 w-4" /> },
  { to: "/risk", label: "Risk Zones", icon: <AlertTriangle className="h-4 w-4" /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { to: "/vaccinations", label: "Vaccinations", icon: <Syringe className="h-4 w-4" /> },
  { to: "/admin", label: "Admin", icon: <Settings className="h-4 w-4" /> },
];

const labLinks: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/laboratory", label: "Lab Samples", icon: <FlaskConical className="h-4 w-4" /> },
  { to: "/cases", label: "Cases", icon: <FileText className="h-4 w-4" /> },
];

const adminLinks: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/admin", label: "Admin Panel", icon: <Settings className="h-4 w-4" /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { to: "/risk", label: "Risk Zones", icon: <AlertTriangle className="h-4 w-4" /> },
  { to: "/cases", label: "All Cases", icon: <FileText className="h-4 w-4" /> },
];

function getLinksForRole(role: string): NavItem[] {
  switch (role) {
    case "FARMER":
      return farmerLinks;
    case "VETERINARIAN":
      return vetLinks;
    case "GOVERNMENT":
    case "GOVT_OFFICIAL":
      return govLinks;
    case "LABORATORY":
    case "LAB_TECHNICIAN":
      return labLinks;
    case "ADMIN":
      return adminLinks;
    default:
      return farmerLinks;
  }
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = getLinksForRole(user?.role || "FARMER");

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-gray-900">PashuRaksha</span>
          <p className="text-[10px] font-medium text-gray-400 -mt-0.5">
            Health Surveillance
          </p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.label + link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
