import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, Lock, User, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginModal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="h-full w-full text-slate-400" viewBox="0 0 500 500">
          <path
            d="M 150 100 Q 200 80 280 110 T 380 180 T 350 300 T 260 420 T 180 340 T 130 220 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-gov-700 bg-gov-800 px-6 py-5 text-center text-white">
          <div className="mb-2 inline-flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            <span className="text-lg font-bold tracking-wide">PashuRaksha</span>
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
              National Portal
            </span>
          </div>
          <div className="mt-2 inline-flex rounded-full border border-gov-700 bg-gov-900/60 p-2.5">
            <Lock className="h-5 w-5 text-amber-400" />
          </div>
          <h1 className="mt-2 text-base font-bold tracking-wide text-white">
            Single Sign-On (SSO) Authentication
          </h1>
          <p className="mt-0.5 text-xs text-slate-300">
            Department of Animal Husbandry & Dairying · Govt. of India
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Government ID / Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="e.g. admin, vet1, farmer1..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-9 text-xs font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <a href="#" className="text-[11px] font-semibold text-blue-700 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-9 text-xs font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2.5 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
            <div>
              <span className="font-bold">Aadhaar e-KYC Enabled:</span>
              <p className="mt-0.5 text-[11px] text-slate-600">
                OTP-based authorization will be sent to your registered mobile device upon submitting
                credential details.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gov-700 py-3 text-xs font-semibold text-white shadow-md transition hover:bg-gov-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Authenticate & Access Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-[11px] text-slate-500">
          Protected by National Cyber Security Protocols · NIC Gateway v3.4
          <br />
          <span className="text-slate-400">Smart India Hackathon 2026</span>
        </div>
      </div>
    </div>
  );
}
