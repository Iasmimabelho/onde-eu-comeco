import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "user" | "admin" | "company" | "institution"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  location?: string
  objective?: string
  progress?: number
  onboardingCompleted?: boolean
  createdAt: string
}

export interface UserProfile {
  objetivo?: string
  dificuldades?: string[]
  habilidades?: string[]
  disponibilidade?: string
  vitoria?: string
  localizacao?: string
  idade?: number
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  supabaseUser: SupabaseUser | null
}

export function dashboardPath(role?: string): string {
  if (role === "organization" || role === "company") return "/org/dashboard"
  if (role === "admin") return "/admin/dashboard"
  return "/dashboard"
}

export interface SignupOptions {
  accountType?: "candidato" | "organizacao"
  birthDate?: string
  orgType?: "empresa" | "instituicao"
  orgName?: string
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string, location: string, opts?: SignupOptions) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (profile: UserProfile) => Promise<void>
  completeOnboarding: (profile: UserProfile) => Promise<void>
  navigate: (path: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapRole(r: string): UserRole {
  if (r === "admin") return "admin"
  if (r === "organization") return "company"
  return "user"
}

async function fetchUserData(sbUser: SupabaseUser): Promise<{ user: User; profile: UserProfile | null }> {
  const [profileRes, onboardingRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", sbUser.id).single(),
    supabase.from("user_onboarding").select("*").eq("user_id", sbUser.id).maybeSingle(),
  ])

  const p = profileRes.data
  const o = onboardingRes.data

  const user: User = {
    id: sbUser.id,
    name: p?.name ?? sbUser.user_metadata?.name ?? sbUser.email?.split("@")[0] ?? "Usuário",
    email: sbUser.email ?? "",
    role: mapRole(p?.role ?? "user"),
    location: p?.location ?? undefined,
    progress: p?.progress ?? 0,
    onboardingCompleted: p?.onboarding_completed ?? false,
    createdAt: sbUser.created_at,
  }

  const profile: UserProfile | null = o
    ? {
        objetivo: o.objective ?? undefined,
        dificuldades: o.difficulties ?? [],
        habilidades: o.skills ?? [],
        disponibilidade: o.availability ?? undefined,
        vitoria: o.victory_goal ?? undefined,
        localizacao: p?.location ?? undefined,
      }
    : null

  return { user, profile }
}

export function AuthProvider({ children, onNavigate }: { children: ReactNode; onNavigate: (path: string) => void }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true, supabaseUser: null })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { user, profile } = await fetchUserData(session.user)
        setState({ user, profile, loading: false, supabaseUser: session.user })
      } else {
        setState((s) => ({ ...s, loading: false }))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user, profile } = await fetchUserData(session.user)
        setState({ user, profile, loading: false, supabaseUser: session.user })
      } else {
        setState({ user: null, profile: null, loading: false, supabaseUser: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const loginAdmin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    const res = await supabase.from("profiles").select("role").eq("id", data.user.id).single()
    if (res.data?.role !== "admin") {
      await supabase.auth.signOut()
      return { success: false, error: "Acesso restrito a administradores." }
    }
    return { success: true }
  }

  const signup = async (name: string, email: string, password: string, location: string, opts?: SignupOptions) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return { success: false, error: error.message }
    if (!data.user) return { success: false, error: "Usuário não criado." }

    const updates: Record<string, unknown> = { location }
    if (opts?.birthDate) updates.birth_date = opts.birthDate
    if (opts?.accountType === "organizacao") updates.role = "organization"
    await supabase.from("profiles").update(updates).eq("id", data.user.id)

    if (opts?.accountType === "organizacao" && opts.orgName) {
      await supabase.from("organizations").insert({
        user_id: data.user.id,
        name: opts.orgName,
        type: opts.orgType ?? "empresa",
        description: null,
        logo_url: null,
        website: null,
        location,
        category: null,
        employees_count: null,
        verified: false,
      })
    }

    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    onNavigate("/")
  }

  const updateProfile = async (profileData: UserProfile) => {
    if (!state.supabaseUser) return
    await supabase.from("profiles").update({
      location: profileData.localizacao,
    }).eq("id", state.supabaseUser.id)
    setState((s) => ({ ...s, profile: profileData }))
  }

  const completeOnboarding = async (profileData: UserProfile) => {
    if (!state.supabaseUser) return
    const userId = state.supabaseUser.id

    await supabase.from("user_onboarding").upsert({
      user_id: userId,
      objective: profileData.objetivo ?? null,
      difficulties: profileData.dificuldades ?? [],
      skills: profileData.habilidades ?? [],
      availability: profileData.disponibilidade ?? null,
      victory_goal: profileData.vitoria ?? null,
    })

    await supabase.from("profiles").update({
      onboarding_completed: true,
      progress: 5,
      location: profileData.localizacao ?? state.user?.location ?? null,
    }).eq("id", userId)

    setState((s) => ({
      ...s,
      profile: profileData,
      user: s.user ? { ...s.user, onboardingCompleted: true, progress: 5 } : s.user,
    }))
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      loginAdmin,
      signup,
      logout,
      updateProfile,
      completeOnboarding,
      navigate: onNavigate,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
