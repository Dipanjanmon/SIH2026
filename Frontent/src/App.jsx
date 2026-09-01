import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import LandingView from './components/LandingView.jsx'
import Dashboard from './components/Dashboard.jsx'
import LoginLock from './components/LoginLock.jsx'
import LoginOverlay from './components/LoginOverlay.jsx'
import { demoCredentials } from './data.js'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  // ---- theme ----
  const [darkTheme, setDarkTheme] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  // ---- login / session ----
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginLockOn, setLoginLockOn] = useState(false)
  const [loginOverlayOn, setLoginOverlayOn] = useState(false)
  const [loginIdentity, setLoginIdentity] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [role, setRole] = useState('gov')
  const [roleLocked, setRoleLocked] = useState(false)

  // ---- navigation ----
  const [tab, setTab] = useState('dashboard')
  const [module, setModule] = useState('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ---- overlays ----
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [modalData, setModalData] = useState({ title: '', disease: '', risk: '', desc: '' })
  const [diseaseGridOpen, setDiseaseGridOpen] = useState(false)
  const [showGisOverlay, setShowGisOverlay] = useState(false)

  // ---- notifications ----
  const [notifications, setNotifications] = useState([])
  const [notifRendered, setNotifRendered] = useState(false)

  // ---- filters ----
  const [stateFilter, setStateFilter] = useState('ALL')
  const [diseaseFilter, setDiseaseFilter] = useState('ALL')
  const [hotspotText, setHotspotText] = useState('14 Clusters')

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // ===== THEME =====
  useEffect(() => {
    const saved = localStorage.getItem('pasuraksha-theme')
    if (saved === 'dark') setDarkTheme(true)
    setThemeReady(true)
  }, [])

  useEffect(() => {
    if (!themeReady) return
    const root = document.documentElement
    root.classList.add('theme-switching')
    if (darkTheme) root.classList.add('dark')
    else root.classList.remove('dark')
    const t = setTimeout(() => root.classList.remove('theme-switching'), 650)
    return () => clearTimeout(t)
  }, [darkTheme, themeReady])

  const toggleTheme = () => {
    setDarkTheme((v) => {
      const next = !v
      localStorage.setItem('pasuraksha-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // ===== LOGIN =====
  const startLogin = () => {
    setLoginLockOn(true)
    setLoginError('')
    let progress = 0
    const timer = setInterval(() => {
      progress += 1
      if (progress >= 100) {
        clearInterval(timer)
        setLoginLockOn(false)
        setLoginOverlayOn(true)
      }
    }, 50)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const identity = loginIdentity.trim()
    const password = loginPassword.trim()
    if (!identity || !password) {
      setLoginError('Please enter both your Government / Livestock ID and password.')
      return
    }
    const cred = demoCredentials[role]
    const idMatch = identity.toUpperCase() === cred.id
    const passMatch = password === cred.pass
    if (!idMatch || !passMatch) {
      setLoginError('Invalid credentials. Please use the demo credentials for your selected role.')
      return
    }
    switchRole(role)
    setRoleLocked(true)
    setLoginOverlayOn(false)
    setLoggedIn(true)
    setTab(role === 'lab' ? 'lab' : 'dashboard')
    setTimeout(() => setShowGisOverlay(true), 250)
  }

  const closeLoginOverlay = () => setLoginOverlayOn(false)

  const signOut = () => {
    setProfileOpen(false)
    setNotifOpen(false)
    localStorage.removeItem('pasuraksha-theme')
    setDarkTheme(false)
    setRole('gov')
    setRoleLocked(false)
    setLoginIdentity('')
    setLoginPassword('')
    setLoginError('')
    setLoggedIn(false)
    setShowGisOverlay(false)
    setTab('dashboard')
  }

  // ===== ROLE =====
  const switchRole = (r) => {
    setRole(r)
  }

  // ===== NAVIGATION =====
  const switchTab = (t) => {
    setTab(t)
  }

  const spaShow = (id) => {
    setModule(id)
  }
  const showHome = () => {
    setModule('home')
  }

  const toggleSidebar = () => setSidebarCollapsed((v) => !v)

  // ===== OVERLAYS =====
  const toggleNotifications = () => {
    setProfileOpen(false)
    setNotifOpen((v) => !v)
    setNotifRendered(true)
  }

  const clearNotifications = () => {
    setNotifications([])
    setNotifRendered(true)
  }

  const toggleProfileMenu = () => {
    setNotifOpen(false)
    setProfileOpen((v) => !v)
  }

  const showMapDetail = (title, disease, risk, desc) => {
    setModalData({ title, disease, risk, desc })
    setMapModalOpen(true)
  }

  const closeModal = () => setMapModalOpen(false)

  // ===== FILTERS =====
  const applyFilters = () => {
    if (stateFilter !== 'ALL') setHotspotText('3 Clusters (' + stateFilter + ')')
    else setHotspotText('14 Clusters')
  }

  // ===== OUTSIDE CLICK =====
  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const ctx = {
    // theme
    darkTheme, toggleTheme,
    // session
    loggedIn, loginLockOn, loginOverlayOn, role, roleLocked,
    loginIdentity, loginPassword, loginError,
    setLoginIdentity, setLoginPassword,
    startLogin, handleLogin, closeLoginOverlay, signOut, switchRole,
    // nav
    tab, switchTab, module, spaShow, showHome,
    sidebarCollapsed, toggleSidebar,
    // overlays
    notifOpen, profileOpen, toggleNotifications, clearNotifications, toggleProfileMenu,
    notifRef, profileRef,
    mapModalOpen, modalData, showMapDetail, closeModal,
    diseaseGridOpen, setDiseaseGridOpen, showGisOverlay,
    // notifications
    notifications, setNotifications, notifRendered, setNotifRendered,
    // filters
    stateFilter, setStateFilter, diseaseFilter, setDiseaseFilter, hotspotText, applyFilters
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 antialiased h-screen flex flex-col overflow-hidden">
        {!loggedIn && <LandingView />}
        {loggedIn && <Dashboard />}
        {loginLockOn && <LoginLock />}
        {loginOverlayOn && (
          <div className="relative">
            <LoginOverlay />
          </div>
        )}
      </div>
    </AppContext.Provider>
  )
}