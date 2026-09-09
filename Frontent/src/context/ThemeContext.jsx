import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('pashu-theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-switching')
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('pashu-theme', dark ? 'dark' : 'light')
    const t = setTimeout(() => root.classList.remove('theme-switching'), 500)
    return () => clearTimeout(t)
  }, [dark])

  const toggleTheme = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
