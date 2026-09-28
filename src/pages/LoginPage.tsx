import { useState } from "react"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { useAuth, dashboardPath } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const { login, navigate } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await login(email, password)
    if (res.success) {
      const { data: { user: sbUser } } = await supabase.auth.getUser()
      const { data: profile } = sbUser
        ? await supabase.from("profiles").select("role").eq("id", sbUser.id).single()
        : { data: null }
      navigate(dashboardPath(profile?.role))
    }
    setLoading(false)
    if (!res.success) {
      setError(res.error || "Erro ao entrar.")
    }
  }

  const fillDemo = () => {
    setEmail("juliana@demo.com")
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen flex bg-[#F4F8FC] dark:bg-[#06111F]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 mesh-gradient flex-col justify-between p-12">
        <button onClick={() => navigate("/")} className="font-display text-xl font-semibold text-white">
          onde eu começo?
        </button>
        <div>
          <p className="font-display text-4xl font-light text-white leading-snug mb-4">
            Bem-vindo de volta.<br />
            <em className="italic text-amber-400">Seu caminho continua aqui.</em>
          </p>
          <p className="text-slate-400 text-sm">
            Continue de onde parou e explore novas oportunidades.
          </p>
        </div>
        <div className="text-slate-600 text-xs">© 2025 Onde Eu Começo?</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0A1A2C]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <button onClick={() => navigate("/")} className="lg:hidden font-display text-xl font-semibold text-brand-600 mb-8 block">
            onde eu começo?
          </button>

          <h1 className="text-2xl font-display font-semibold text-slate-900 mb-1">Entrar na plataforma</h1>
          <p className="text-slate-500 text-sm mb-8">
            Novo aqui?{" "}
            <button onClick={() => navigate("/cadastro")} className="text-brand-600 font-medium hover:underline">
              Criar conta gratuita
            </button>
          </p>

          {/* Demo shortcut */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-amber-800 text-xs font-bold uppercase tracking-widest mb-1">Demo</div>
                <div className="text-amber-700 text-sm">Use <b>juliana@demo.com</b> / <b>demo123</b> para testar a plataforma.</div>
              </div>
              <button onClick={fillDemo} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                Preencher
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-all shadow-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Entrando...</>
              ) : (
                <><ArrowRight size={16} /> Entrar</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
              Esqueci minha senha
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs">
              Acesso administrativo?{" "}
              <button onClick={() => navigate("/admin")} className="text-brand-600 hover:underline">
                Entrar como admin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
