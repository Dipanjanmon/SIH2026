import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Home, AlertTriangle, User, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout({ children, title }: { children: ReactNode, title: string }) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans">
      {/* Top Header - Institutional Style */}
      <header className="bg-[#003366] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#003366] font-serif font-bold text-xl">
                PR
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">PashuRaksha</h1>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">National Livestock Disease Surveillance</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User size={16} />
                <span>{role} PORTAL</span>
              </div>
              <button onClick={handleLogout} className="text-xs bg-[#002244] hover:bg-[#001122] px-4 py-2 border border-[#004080] transition-colors flex items-center gap-2 font-bold uppercase tracking-wider rounded-sm">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12">
            <a href="#" className="border-b-2 border-[#003366] text-[#003366] inline-flex items-center px-1 pt-1 text-sm font-bold uppercase tracking-wider">
              <Home size={16} className="mr-2" /> Overview
            </a>
            {role === 'ADMIN' && (
              <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 text-sm font-bold uppercase tracking-wider">
                <Map size={16} className="mr-2" /> Outbreak Map
              </a>
            )}
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 text-sm font-bold uppercase tracking-wider">
              <AlertTriangle size={16} className="mr-2" /> Reports & Cases
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 pb-4 border-b border-gray-300 flex justify-between items-end">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Date: {new Date().toLocaleDateString()}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
