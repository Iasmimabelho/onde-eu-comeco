import { useState } from "react"
import { Menu, X, ChevronDown, Moon, Sun } from "lucide-react"
import { useAuth, dashboardPath } from "@/contexts/AuthContext"
import BrandLogo from "@/components/BrandLogo"
import { useTheme } from "@/contexts/ThemeContext"

export default function Navbar() {
  const { user, logout, navigate } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isAdmin = user?.role === "admin"

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/")
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120)
    }
  }

  const textColor = "text-brand-900"
  const mutedColor = "text-slate-600"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-brand-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="rounded-full hover:opacity-80 transition-opacity"
          aria-label="Ir para a página inicial"
        >
          <BrandLogo compact />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scrollTo("como-funciona")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${mutedColor} hover:bg-black/5 transition-colors`}
          >
            Como funciona
          </button>
          <button
            onClick={() => navigate("/oportunidades")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${mutedColor} hover:bg-black/5 transition-colors`}
          >
            Oportunidades
          </button>
          <button
            onClick={() => navigate("/para-empresas")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${mutedColor} hover:bg-black/5 transition-colors`}
          >
            Para Empresas
          </button>
          <button
            onClick={() => navigate("/mapa")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${mutedColor} hover:bg-black/5 transition-colors`}
          >
            Mapa
          </button>
          <button
            onClick={() => navigate("/planos")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${mutedColor} hover:bg-black/5 transition-colors`}
          >
            Planos
          </button>
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${textColor} hover:bg-black/5 transition-colors`}
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <span>{user.name.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  {isAdmin ? (
                    <button
                      onClick={() => { navigate("/admin/dashboard"); setUserMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Painel Administrativo
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { navigate(dashboardPath(user?.role)); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Meu Dashboard
                      </button>
                      <button
                        onClick={() => { navigate("/oportunidades"); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Explorar Oportunidades
                      </button>
                    </>
                  )}
                  <div className="my-1.5 border-t border-slate-100" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
              >
                Começar grátis
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg ${textColor} hover:bg-black/10 transition-colors`}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            <button onClick={toggleTheme} className="flex w-full items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => { scrollTo("como-funciona"); setMobileOpen(false) }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Como funciona</button>
            <button onClick={() => { navigate("/oportunidades"); setMobileOpen(false) }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Oportunidades</button>
            <button onClick={() => { navigate("/para-empresas"); setMobileOpen(false) }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Para Empresas</button>
            <button onClick={() => { navigate("/planos"); setMobileOpen(false) }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Planos</button>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  {!isAdmin && (
                    <button onClick={() => { navigate(dashboardPath(user?.role)); setMobileOpen(false) }} className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium bg-brand-50 text-brand-700">Meu Dashboard</button>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600">Sair</button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate("/login"); setMobileOpen(false) }} className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-slate-700 border border-slate-200">Entrar</button>
                  <button onClick={() => { navigate("/cadastro"); setMobileOpen(false) }} className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 text-white">Começar grátis</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
