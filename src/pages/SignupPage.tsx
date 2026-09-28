import { useState } from "react"
import { Eye, EyeOff, ArrowRight, Loader2, User, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type AccountType = "candidato" | "organizacao"

export default function SignupPage() {
  const { signup, navigate } = useAuth()
  const [accountType, setAccountType] = useState<AccountType>("candidato")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    birthDate: "",
    orgType: "empresa" as "empresa" | "instituicao",
    orgName: "",
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirmPassword) { setError("As senhas não coincidem."); return }
    if (form.password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return }
    if (accountType === "candidato" && !form.birthDate) { setError("Informe sua data de nascimento."); return }
    if (accountType === "organizacao" && !form.orgName.trim()) { setError("Informe o nome da organização."); return }

    setLoading(true)
    const res = await signup(form.name, form.email, form.password, form.location, {
      accountType,
      birthDate: form.birthDate || undefined,
      orgType: accountType === "organizacao" ? form.orgType : undefined,
      orgName: accountType === "organizacao" ? form.orgName : undefined,
    })
    setLoading(false)
    if (res.success) {
      navigate(accountType === "organizacao" ? "/org/dashboard" : "/onboarding")
    } else {
      setError(res.error || "Erro ao criar conta.")
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F4F8FC] dark:bg-[#06111F]">
      <div className="hidden lg:flex lg:w-1/2 mesh-gradient flex-col justify-between p-12">
        <button onClick={() => navigate("/")} className="font-display text-xl font-semibold text-white">
          onde eu começo?
        </button>
        <div>
          <p className="font-display text-4xl font-light text-white leading-snug mb-4">
            Crie sua conta.<br />
            <em className="italic text-amber-400">O primeiro passo começa agora.</em>
          </p>
          <p className="text-slate-400 text-sm">
            Gratuito, sem compromisso. Descubra oportunidades em minutos.
          </p>
        </div>
        <div className="text-slate-600 text-xs">© 2026 Onde Eu Começo?</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <button onClick={() => navigate("/")} className="lg:hidden font-display text-xl font-semibold text-brand-600 mb-8 block">
            onde eu começo?
          </button>

          <h1 className="text-2xl font-display font-semibold text-slate-900 mb-1">Criar conta gratuita</h1>
          <p className="text-slate-500 text-sm mb-6">
            Já tem conta?{" "}
            <button onClick={() => navigate("/login")} className="text-brand-600 font-medium hover:underline">
              Entrar
            </button>
          </p>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("candidato")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                accountType === "candidato"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <User size={20} />
              <div className="text-sm font-semibold">Sou candidato</div>
              <div className="text-xs text-center leading-tight opacity-70">Busco oportunidades, bolsas ou emprego</div>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("organizacao")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                accountType === "organizacao"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <Building2 size={20} />
              <div className="text-sm font-semibold">Sou empresa / instituição</div>
              <div className="text-xs text-center leading-tight opacity-70">Publico vagas e oportunidades</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Org type — only for organizations */}
            {accountType === "organizacao" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de organização</label>
                <select
                  value={form.orgType}
                  onChange={set("orgType")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                >
                  <option value="empresa">Empresa</option>
                  <option value="instituicao">Instituição de ensino / ONG</option>
                </select>
              </div>
            )}

            {/* Org name — only for organizations */}
            {accountType === "organizacao" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da organização</label>
                <input
                  type="text"
                  value={form.orgName}
                  onChange={set("orgName")}
                  placeholder="Nome da sua empresa ou instituição"
                  required={accountType === "organizacao"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            )}

            <div className={accountType === "candidato" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {accountType === "organizacao" ? "Nome do responsável" : "Nome completo"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Seu nome"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {accountType === "candidato" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de nascimento</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={set("birthDate")}
                    required
                    max={new Date(Date.now() - 10 * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade / Estado</label>
              <input
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder="Ex: Niterói, RJ"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar senha</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="Repita a senha"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-all shadow-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Criando conta...</>
              ) : (
                <><ArrowRight size={16} /> Criar conta e continuar</>
              )}
            </button>

            <p className="text-slate-400 text-xs text-center">
              Ao criar conta, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
