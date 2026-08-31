import React from 'react'
import Icon from '../icons.jsx'

export default function LoginLock() {
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center gis-grid">
      <div className="flex items-center space-x-3 text-white">
        <div className="bg-white/10 p-2 rounded border border-white/20">
          <Icon name="shield-alert" className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="font-bold text-base">PashuRaksha</div>
          <p className="text-xs text-slate-300">Authenticating Secure Access...</p>
        </div>
      </div>
      <div className="mt-5 flex items-center space-x-2 text-slate-300 text-xs">
        <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
        <span>Please wait, secure session is being prepared...</span>
      </div>
      <div className="mt-6 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div id="loginProgress" className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
      </div>
    </div>
  )
}