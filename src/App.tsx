import { useState, useEffect, Suspense, lazy } from "react"
import { AuthProvider, useAuth, dashboardPath } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const SignupPage = lazy(() => import("@/pages/SignupPage"))
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"))
const MatchResultPage = lazy(() => import("@/pages/MatchResultPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const OpportunitiesPage = lazy(() => import("@/pages/OpportunitiesPage"))
const PlansPage = lazy(() => import("@/pages/PlansPage"))
const ForCompaniesPage = lazy(() => import("@/pages/ForCompaniesPage"))
const ForInstitutionsPage = lazy(() => import("@/pages/ForInstitutionsPage"))
const MapPage = lazy(() => import("@/pages/MapPage"))
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"))
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"))
const OrgDashboardPage = lazy(() => import("@/pages/OrgDashboardPage"))

function getPath(hash: string): string {
  const path = hash.replace(/^#/, "") || "/"
  return path.startsWith("/") ? path : "/" + path
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
        <div className="font-display text-slate-400 text-sm">Carregando...</div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingFallback />
  if (!user) {
    window.location.hash = "/login"
    return null
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.hash = "/"
    return null
  }
  return <>{children}</>
}

function Pages({ path }: { path: string }) {
  const navigate = (to: string) => { window.location.hash = to }
  const { user } = useAuth()

  if (path === "/" || path === "") return <LandingPage />
  if (path === "/login") return <LoginPage />
  if (path === "/cadastro" || path === "/signup") return <SignupPage />
  if (path === "/onboarding") return <OnboardingPage />
  if (path === "/resultado") return <MatchResultPage />
  if (path === "/dashboard") {
    const dest = dashboardPath(user?.role)
    if (dest !== "/dashboard") { window.location.hash = dest; return null }
    return <DashboardPage />
  }
  if (path === "/oportunidades") return <OpportunitiesPage />
  if (path === "/planos") return <PlansPage />
  if (path === "/para-empresas") return <ForCompaniesPage />
  if (path === "/para-instituicoes") return <ForInstitutionsPage />
  if (path === "/mapa") return <MapPage />
  if (path === "/org/dashboard" || path.startsWith("/org/")) return (
    <ProtectedRoute allowedRoles={["company", "organization"]}>
      <OrgDashboardPage />
    </ProtectedRoute>
  )
  if (path === "/admin" || path === "/admin/login") return <AdminLoginPage />
  if (path.startsWith("/admin/")) return <AdminDashboardPage />

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-2xl font-display font-semibold text-slate-900 mb-2">Página não encontrada</h1>
        <p className="text-slate-500 mb-6">A página que você procura não existe.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  )
}

function Router() {
  const [path, setPath] = useState(() => getPath(window.location.hash))

  const navigate = (to: string) => {
    window.location.hash = to
  }

  useEffect(() => {
    const handleHash = () => {
      setPath(getPath(window.location.hash))
      window.scrollTo({ top: 0, behavior: "instant" })
    }
    window.addEventListener("hashchange", handleHash)
    if (!window.location.hash) window.location.hash = "/"
    else handleHash()
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  return (
    <AuthProvider onNavigate={navigate}>
      <Suspense fallback={<LoadingFallback />}>
        <Pages path={path} />
      </Suspense>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}
