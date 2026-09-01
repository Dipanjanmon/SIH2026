import React from 'react'
import Icon from '../icons.jsx'
import { useApp } from '../App.jsx'

const ROLE_OPTIONS = [
  { value: 'gov', label: 'Government Officer (Central / State HQ)' },
  { value: 'vet', label: 'Field Veterinarian (Mobile Vet Unit 1962)' },
  { value: 'farmer', label: 'Livestock Owner / Dairy Farmer' },
  { value: 'lab', label: 'ICAR Diagnostic Laboratory Analyst' },
  { value: 'admin', label: 'System Administrator' }
]

export default function LoginOverlay() {
  const { role, switchRole, loginIdentity, setLoginIdentity, loginPassword, setLoginPassword, loginError, handleLogin } = useApp()

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 gis-grid">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-br from-gov-800 via-gov-800 to-gov-900 text-white px-6 py-5 border-b border-gov-700 text-center">
          <div className="inline-flex p-2.5 bg-gov-900/60 rounded-full border border-gov-600 mb-2 shadow-lg shadow-black/20">
            <Icon name="lock" className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-base font-bold text-white tracking-wide">Single Sign-On (SSO) Authentication</h1>
          <p className="text-xs text-slate-300 mt-0.5">National Livestock Health & Epidemic Surveillance Network</p>
        </div>

        {/* Login Form */}
        <form id="loginForm" className="p-6 space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="popupRole" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Portal Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="popupRole"
                required
                value={role}
                onChange={(e) => switchRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 pr-8 font-medium focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="popupIdentity" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Government ID / Bharat Pashudhaar Tag ID / Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Icon name="user" className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="popupIdentity"
                required
                value={loginIdentity}
                onChange={(e) => setLoginIdentity(e.target.value)}
                placeholder="e.g. GOV-8941-RJ or 12-digit Ear Tag ID"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg pl-9 p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="popupPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password / Passcode <span className="text-red-500">*</span>
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-semibold text-blue-700 hover:underline">Forgot Access Key?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Icon name="key-round" className="w-4 h-4" />
              </span>
              <input
                type="password"
                id="popupPassword"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg pl-9 p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start space-x-2.5 text-xs text-blue-900">
            <Icon name="shield-check" className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Aadhaar e-KYC Enabled:</span>
              <p className="text-[11px] text-slate-600 mt-0.5">OTP-based authorization will be sent to your registered mobile device upon submitting credential details.</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="font-bold text-slate-700 block mb-1.5">Demo Test Credentials:</span>
            <div className="grid grid-cols-1 gap-1 font-mono text-[10px]">
              <div><span className="text-blue-700 font-semibold">GOV</span> / gov123 &nbsp;·&nbsp; Government Officer</div>
              <div><span className="text-blue-700 font-semibold">VET</span> / vet123 &nbsp;·&nbsp; Field Veterinarian</div>
              <div><span className="text-blue-700 font-semibold">FARMER</span> / farmer123 &nbsp;·&nbsp; Farmer</div>
              <div><span className="text-blue-700 font-semibold">LAB</span> / lab123 &nbsp;·&nbsp; Lab Analyst</div>
            </div>
          </div>

          {loginError && (
            <p className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-2.5 py-1.5">{loginError}</p>
          )}

          <button type="submit" className="w-full bg-gov-700 hover:bg-gov-800 text-white font-semibold text-xs py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2">
            <span>Authenticate & Access Dashboard</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-[11px] text-slate-500">
          Protected by National Cyber Security Protocols · PashuRaksha Gateway v1.0
        </div>
      </div>
    </div>
  )
}