import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("onde-eu-comeco-theme")
  if (saved === "light" || saved === "dark") return saved
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem("onde-eu-comeco-theme", theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(current => current === "light" ? "dark" : "light"),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme precisa estar dentro de ThemeProvider")
  return context
}
