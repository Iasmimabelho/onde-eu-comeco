import { useState } from "react"
import { Shield, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLoginPage() {
  const { loginAdmin, navigate } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await loginAdmin(email, password)
    setLoading(false)
    if (res.success) {
      navigate("/admin/dashboard")
    } else {
      setError(res.error || "Credenciais inválidas.")
    }
  }

  const fillDemo = () => {
    setEmail("admin@ondeeucomeco.com")
    setPassword("admin2024")
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <div className="font-display text-xl font-semibold text-white mb-1">onde eu começo?</div>
          <div className="text-slate-400 text-sm">Área Administrativa</div>
        </div>

        <div className="bg-white/5 rounded-3xl p-7 border border-white/10">
          <h1 className="text-white font-display font-semibold text-xl mb-1">Login Administrativo</h1>
          <p className="text-slate-400 text-sm mb-6">Acesso restrito a administradores.</p>

          {/* Demo */}
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="text-amber-300 text-xs">
                <b>Demo:</b> admin@ondeeucomeco.com / admin2024
              </div>
              <button onClick={fillDemo} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500 text-navy-900 font-bold hover:bg-amber-400 transition-colors">
                Preencher
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ondeeucomeco.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-all"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : <><ArrowRight size={16} /> Acessar painel</>}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate("/")} className="text-slate-500 text-sm hover:text-slate-300 transition-colors">
            ← Voltar para o site
          </button>
        </div>
      </div>
    </div>
  )
}
