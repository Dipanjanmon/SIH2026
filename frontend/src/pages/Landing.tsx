import { Link } from 'react-router-dom';
import { Shield, Activity, Map, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans">
      <nav className="bg-[#003366] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#003366] rounded-full flex items-center justify-center font-serif font-bold text-xl">
              PR
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest">PashuRaksha</h1>
          </div>
          <Link to="/login" className="bg-white text-[#003366] px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors">
            Portal Login
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Intelligent Livestock Disease Surveillance</h2>
          <p className="text-xl text-gray-600 font-medium mb-10">
            An early-warning platform designed to detect geographic disease clusters, calculate outbreak risks, and mobilize veterinary responses before localized infections become epidemics.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="bg-[#003366] text-white px-8 py-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#002244] transition-colors">
              Access Farmer / Vet Portal <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 border-t-8 border-[#003366] shadow-sm">
            <Activity className="text-[#003366] mb-6" size={48} />
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">Early Detection</h3>
            <p className="text-gray-600">Report clinical signs directly from the farm. Our risk engine calculates disease severity instantly.</p>
          </div>
          <div className="bg-white p-8 border-t-8 border-[#cc0000] shadow-sm">
            <Map className="text-[#cc0000] mb-6" size={48} />
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">Spatial Clustering</h3>
            <p className="text-gray-600">Advanced ML algorithms identify geographic hotspots and emerging outbreaks in real-time.</p>
          </div>
          <div className="bg-white p-8 border-t-8 border-[#0066cc] shadow-sm">
            <Shield className="text-[#0066cc] mb-6" size={48} />
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">Rapid Response</h3>
            <p className="text-gray-600">Automated alerting protocols ensure veterinary officers are dispatched to high-risk zones immediately.</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm font-medium">
        <p>A SIH 2026 Initiative. Authorized Access Only beyond this point.</p>
      </footer>
    </div>
  );
}
