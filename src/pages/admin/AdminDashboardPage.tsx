import { useState, useEffect } from "react"
import {
  Users, Briefcase, GraduationCap, Building2, TrendingUp, DollarSign,
  Target, LayoutDashboard, Settings, LogOut, BarChart2, FileText,
  MapPin, CreditCard, List, Tag, CheckCircle2, Clock, AlertCircle,
  Search, Plus, Filter, ChevronUp, ChevronDown, ArrowUpRight, X, Pencil, Eye,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { CHART_DATA } from "@/data/mockData"
import { getAdminStats, getAllUsers, getAllOpportunities, getAllApplications, getAllOrganizations } from "@/services/admin"
import { createOpportunity, updateOpportunity, deleteOpportunity } from "@/services/opportunities"
import { supabase } from "@/lib/supabase"
import type { OppCategory, OppModality, OppStatus } from "@/types/database"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts"

type Section = "dashboard" | "users" | "opportunities" | "companies" | "institutions" | "matches" | "payments" | "plans" | "reports" | "settings"

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={15} />, id: "dashboard" as Section },
      { label: "Relatórios", icon: <BarChart2 size={15} />, id: "reports" as Section },
    ],
  },
  {
    label: "Usuários & Conteúdo",
    items: [
      { label: "Usuários", icon: <Users size={15} />, id: "users" as Section },
      { label: "Oportunidades", icon: <Briefcase size={15} />, id: "opportunities" as Section },
      { label: "Matches", icon: <Target size={15} />, id: "matches" as Section },
    ],
  },
  {
    label: "Parceiros",
    items: [
      { label: "Empresas", icon: <Building2 size={15} />, id: "companies" as Section },
      { label: "Instituições", icon: <GraduationCap size={15} />, id: "institutions" as Section },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Pagamentos", icon: <CreditCard size={15} />, id: "payments" as Section },
      { label: "Planos", icon: <Tag size={15} />, id: "plans" as Section },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configurações", icon: <Settings size={15} />, id: "settings" as Section },
    ],
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
        <div className="text-slate-500 text-xs mb-0.5">{label}</div>
        <div className="text-slate-900 text-sm font-bold">{payload[0]?.value?.toLocaleString("pt-BR")}</div>
      </div>
    )
  }
  return null
}

function StatCard({ label, value, icon, color, trend, trendUp = true }: {
  label: string; value: string; icon: React.ReactNode; color: string; trend?: string; trendUp?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "15", color }}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
            {trendUp ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-slate-500 text-xs mt-0.5">{label}</div>
    </div>
  )
}

const MOCK_USERS = [
  { name: "Juliana Souza", email: "juliana@demo.com", loc: "Niterói, RJ", obj: "Faculdade", prog: 32, date: "10/03/2024", status: "ativo" },
  { name: "Carlos Mendes", email: "carlos@demo.com", loc: "São Paulo, SP", obj: "Carreira", prog: 55, date: "20/02/2024", status: "ativo" },
  { name: "Ana Ferreira", email: "ana@email.com", loc: "Rio de Janeiro, RJ", obj: "Trabalho", prog: 18, date: "05/04/2024", status: "ativo" },
  { name: "Pedro Costa", email: "pedro@email.com", loc: "Niterói, RJ", obj: "Curso", prog: 40, date: "12/04/2024", status: "ativo" },
  { name: "Maria Silva", email: "maria@email.com", loc: "Belo Horizonte, MG", obj: "Negócio", prog: 65, date: "28/03/2024", status: "inativo" },
  { name: "Lucas Rocha", email: "lucas@email.com", loc: "Niterói, RJ", obj: "Tecnologia", prog: 22, date: "02/05/2024", status: "ativo" },
  { name: "Fernanda Lima", email: "fernanda@email.com", loc: "São Paulo, SP", obj: "Trabalho", prog: 78, date: "18/04/2024", status: "ativo" },
]


const MOCK_PAYMENTS = [
  { company: "Conecta RH", plan: "Business", value: "Personalizado", status: "ativo", date: "01/08/2025", type: "Empresa" },
  { company: "NovaTech", plan: "Professional", value: "R$ 499", status: "ativo", date: "15/07/2025", type: "Empresa" },
  { company: "Faculdade Horizonte", plan: "Avançado", value: "R$ 349", status: "ativo", date: "10/07/2025", type: "Instituição" },
  { company: "Horizonte Digital", plan: "Starter", value: "R$ 199", status: "ativo", date: "05/07/2025", type: "Empresa" },
  { company: "Instituto Futuro", plan: "Avançado", value: "R$ 349", status: "ativo", date: "01/07/2025", type: "Instituição" },
  { company: "Evolua Tecnologia", plan: "Professional", value: "R$ 499", status: "pendente", date: "20/06/2025", type: "Empresa" },
  { company: "Escola Digital Brasil", plan: "Essencial", value: "R$ 149", status: "cancelado", date: "15/06/2025", type: "Instituição" },
  { company: "Impacto Serviços", plan: "Starter", value: "R$ 199", status: "ativo", date: "10/06/2025", type: "Empresa" },
]

const MOCK_PLANS_USAGE = [
  { name: "Company Starter", count: 18, revenue: 3582, color: "#CBD5E1" },
  { name: "Company Professional", count: 32, revenue: 15968, color: "#6366F1" },
  { name: "Company Business", count: 12, revenue: 22400, color: "#4338CA" },
  { name: "Institution Essencial", count: 15, revenue: 2235, color: "#A5B4FC" },
  { name: "Institution Avançado", count: 9, revenue: 3141, color: "#8B5CF6" },
]

const statusColors: Record<string, string> = {
  ativo: "text-emerald-700 bg-emerald-50",
  inativo: "text-slate-500 bg-slate-100",
  pendente: "text-amber-700 bg-amber-50",
  cancelado: "text-red-600 bg-red-50",
  visualizado: "text-blue-600 bg-blue-50",
  candidatou: "text-emerald-700 bg-emerald-50",
  salvo: "text-purple-600 bg-purple-50",
  inscrito: "text-brand-600 bg-brand-50",
}

export default function AdminDashboardPage() {
  const { logout, navigate } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [userSearch, setUserSearch] = useState("")
  const [stats, setStats] = useState({ users: 0, opportunities: 0, applications: 0, organizations: 0 })
  const [realUsers, setRealUsers] = useState<any[]>([])
  const [realOpps, setRealOpps] = useState<any[]>([])
  const [realApps, setRealApps] = useState<any[]>([])
  const [realOrgs, setRealOrgs] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [oppModal, setOppModal] = useState<{ open: boolean; opp: any | null }>({ open: false, opp: null })
  const [oppForm, setOppForm] = useState({ title: "", description: "", category: "emprego" as OppCategory, modality: "presencial" as OppModality, location: "", deadline: "", vacancies: "", status: "ativo" as OppStatus, is_free: true, org_id: "" })
  const [oppSaving, setOppSaving] = useState(false)
  const [oppError, setOppError] = useState("")
  const [applicantsModal, setApplicantsModal] = useState<{ open: boolean; opp: any | null; applicants: any[] }>({ open: false, opp: null, applicants: [] })
  const [applicantsLoading, setApplicantsLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getAllUsers(),
      getAllOpportunities(),
      getAllApplications(),
      getAllOrganizations(),
    ]).then(([s, u, o, a, org]) => {
      setStats(s)
      setRealUsers(u.data ?? [])
      setRealOpps(o.data ?? [])
      setRealApps(a.data ?? [])
      setRealOrgs(org.data ?? [])
      setDataLoading(false)
    })
  }, [])

  const ALL_STATS = [
    { label: "Usuários cadastrados", value: dataLoading ? "…" : stats.users.toLocaleString("pt-BR"), icon: <Users size={18} />, color: "#6366F1", trend: "18%" },
    { label: "Inscrições totais", value: dataLoading ? "…" : stats.applications.toLocaleString("pt-BR"), icon: <Target size={18} />, color: "#10B981", trend: "24%" },
    { label: "Oportunidades", value: dataLoading ? "…" : stats.opportunities.toString(), icon: <Briefcase size={18} />, color: "#F59E0B", trend: "7%" },
    { label: "Receita mensal", value: "R$ 47.2k", icon: <DollarSign size={18} />, color: "#8B5CF6", trend: "14%" },
    { label: "Organizações", value: dataLoading ? "…" : stats.organizations.toString(), icon: <Building2 size={18} />, color: "#F43F5E", trend: "3%" },
    { label: "Empresas", value: dataLoading ? "…" : realOrgs.filter((o: any) => o.type === "empresa").length.toString(), icon: <Building2 size={18} />, color: "#06B6D4", trend: "5%" },
    { label: "Instituições", value: dataLoading ? "…" : realOrgs.filter((o: any) => o.type === "instituicao").length.toString(), icon: <GraduationCap size={18} />, color: "#D97706", trend: "31%" },
    { label: "Conversão", value: stats.users > 0 ? `${Math.round((stats.applications / stats.users) * 100)}%` : "—", icon: <TrendingUp size={18} />, color: "#059669", trend: "2.1%" },
  ]

  const openCreateOpp = () => {
    setOppForm({ title: "", description: "", category: "emprego", modality: "presencial", location: "", deadline: "", vacancies: "", status: "ativo", is_free: true, org_id: realOrgs[0]?.id ?? "" })
    setOppError("")
    setOppModal({ open: true, opp: null })
  }

  const openEditOpp = (opp: any) => {
    setOppForm({
      title: opp.title ?? "",
      description: opp.description ?? "",
      category: opp.category ?? "emprego",
      modality: opp.modality ?? "presencial",
      location: opp.location ?? "",
      deadline: opp.deadline ? opp.deadline.slice(0, 10) : "",
      vacancies: opp.vacancies?.toString() ?? "",
      status: opp.status ?? "ativo",
      is_free: opp.is_free ?? true,
      org_id: opp.org_id ?? "",
    })
    setOppError("")
    setOppModal({ open: true, opp })
  }

  const saveOpp = async () => {
    if (!oppForm.title.trim()) { setOppError("Título é obrigatório."); return }
    if (!oppForm.org_id) { setOppError("Selecione uma organização."); return }
    setOppSaving(true)
    setOppError("")
    const payload = {
      title: oppForm.title,
      description: oppForm.description,
      category: oppForm.category,
      modality: oppForm.modality,
      location: oppForm.location,
      deadline: oppForm.deadline || null,
      vacancies: oppForm.vacancies ? parseInt(oppForm.vacancies) : null,
      status: oppForm.status,
      is_free: oppForm.is_free,
      org_id: oppForm.org_id,
      requirements: [] as string[],
      skills_required: [] as string[],
      objectives_match: [] as string[],
      image_url: null as string | null,
      salary: null as string | null,
    }
    let result
    if (oppModal.opp) {
      result = await updateOpportunity(oppModal.opp.id, payload)
    } else {
      result = await createOpportunity(payload)
    }
    setOppSaving(false)
    if (result.error) { setOppError(result.error.message ?? "Erro ao salvar."); return }
    setOppModal({ open: false, opp: null })
    const { data } = await getAllOpportunities()
    setRealOpps(data ?? [])
    const s = await getAdminStats()
    setStats(s)
  }

  const deleteOpp = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta oportunidade?")) return
    await deleteOpportunity(id)
    setRealOpps((prev) => prev.filter((o: any) => o.id !== id))
    const s = await getAdminStats()
    setStats(s)
  }

  const openApplicants = async (opp: any) => {
    setApplicantsModal({ open: true, opp, applicants: [] })
    setApplicantsLoading(true)
    const { data } = await supabase
      .from("applications")
      .select("*, profiles(name, email, location)")
      .eq("opportunity_id", opp.id)
      .order("created_at", { ascending: false })
    setApplicantsModal({ open: true, opp, applicants: data ?? [] })
    setApplicantsLoading(false)
  }

  const filteredUsers = (realUsers.length > 0 ? realUsers : MOCK_USERS).filter((u: any) =>
    !userSearch || (u.name ?? u.email ?? "").toLowerCase().includes(userSearch.toLowerCase()) || (u.email ?? "").toLowerCase().includes(userSearch.toLowerCase())
  )

  const sectionTitle = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeSection)?.label || "Dashboard"

  return (
    <>
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F] flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-navy-900 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <button onClick={() => navigate("/")} className="font-display text-base font-semibold text-white leading-tight block">
            onde eu começo?
          </button>
          <div className="text-slate-500 text-xs mt-0.5">Painel Administrativo</div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
                {group.label}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all ${
                    activeSection === item.id
                      ? "bg-brand-600 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-white/10 pt-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">Administrador</div>
              <div className="text-slate-500 text-[10px] truncate">admin@ondeeucomeco.com</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div>
            <h1 className="font-display font-semibold text-slate-900">{sectionTitle}</h1>
            <div className="text-slate-400 text-xs">Onde Eu Começo? · Admin</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              <span className="text-slate-500 text-xs">Ao vivo</span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              <ArrowUpRight size={13} /> Ver site
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">

          {/* ── DASHBOARD ── */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {ALL_STATS.map((s) => <StatCard key={s.label} {...s} />)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-slate-900">Crescimento de usuários</h3>
                      <div className="text-slate-400 text-xs">Últimos 6 meses</div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">+202%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={CHART_DATA.users}>
                      <defs>
                        <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} fill="url(#uGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-1">Categorias</h3>
                  <div className="text-slate-400 text-xs mb-4">Distribuição de oportunidades</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={CHART_DATA.categories} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3}>
                        {CHART_DATA.categories.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {CHART_DATA.categories.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="text-slate-600">{c.name}</span>
                        </div>
                        <span className="font-semibold text-slate-700">{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-1">Receita mensal (R$)</h3>
                  <div className="text-slate-400 text-xs mb-5">Últimos 6 meses</div>
                  <ResponsiveContainer width="100%" height={155}>
                    <BarChart data={CHART_DATA.revenue} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-1">Matches realizados</h3>
                  <div className="text-slate-400 text-xs mb-5">Acumulado nos últimos 6 meses</div>
                  <ResponsiveContainer width="100%" height={155}>
                    <LineChart data={CHART_DATA.matches}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Atividade recente</h3>
                <div className="space-y-3">
                  {[
                    { icon: "🎯", text: "Juliana Souza recebeu 93% de match com Bolsa de Graduação", time: "há 2 min" },
                    { icon: "✅", text: "Carlos Mendes se candidatou à vaga de Desenvolvedor Júnior", time: "há 5 min" },
                    { icon: "🏢", text: "NovaTech publicou nova vaga: Suporte Técnico", time: "há 12 min" },
                    { icon: "💳", text: "Faculdade Horizonte renovou plano Professional", time: "há 28 min" },
                    { icon: "👤", text: "5 novos usuários cadastrados hoje", time: "há 1h" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-slate-600 text-sm flex-1">{item.text}</span>
                      <span className="text-slate-400 text-xs flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeSection === "reports" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total de usuários", value: dataLoading ? "…" : stats.users.toLocaleString("pt-BR"), color: "#6366F1" },
                  { label: "Inscrições realizadas", value: dataLoading ? "…" : stats.applications.toLocaleString("pt-BR"), color: "#10B981" },
                  { label: "Taxa de retenção", value: "74.2%", color: "#F59E0B" },
                  { label: "NPS score", value: "72", color: "#8B5CF6" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-5">Distribuição de planos por receita</h3>
                <div className="space-y-3">
                  {MOCK_PLANS_USAGE.map((plan) => (
                    <div key={plan.name} className="flex items-center gap-4">
                      <div className="w-36 text-sm text-slate-600 flex-shrink-0">{plan.name}</div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(plan.revenue / 22400) * 100}%`, backgroundColor: plan.color }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-semibold text-slate-700">
                        R$ {plan.revenue.toLocaleString("pt-BR")}
                      </div>
                      <div className="w-12 text-right text-xs text-slate-400">{plan.count} clientes</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-5">Funil de conversão</h3>
                <div className="space-y-2">
                  {[
                    { label: "Visitantes", value: 18400, pct: 100, color: "#6366F1" },
                    { label: "Cadastros", value: 2480, pct: 13.5, color: "#8B5CF6" },
                    { label: "Onboarding completo", value: 1920, pct: 10.4, color: "#A78BFA" },
                    { label: "Matches gerados", value: 1640, pct: 8.9, color: "#C4B5FD" },
                    { label: "Candidaturas", value: 920, pct: 5.0, color: "#DDD6FE" },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-4">
                      <div className="w-40 text-sm text-slate-600 flex-shrink-0">{step.label}</div>
                      <div className="flex-1 h-7 bg-slate-50 rounded-xl overflow-hidden">
                        <div
                          className="h-full rounded-xl flex items-center px-3"
                          style={{ width: `${step.pct}%`, backgroundColor: step.color, minWidth: "60px" }}
                        >
                          <span className="text-white text-xs font-bold">{step.value.toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="w-12 text-right text-xs text-slate-400">{step.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeSection === "users" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-semibold text-slate-900">Usuários cadastrados</h2>
                  <div className="text-slate-400 text-xs mt-0.5">{filteredUsers.length} usuários encontrados</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Buscar usuário..."
                      className="pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 w-48 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50">
                      {["Usuário", "Localização", "Objetivo", "Progresso", "Status", "Cadastro"].map((h) => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">Carregando...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</td></tr>
                    ) : filteredUsers.map((u: any, i: number) => (
                      <tr key={u.id ?? i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(u.name ?? u.email ?? "U").charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">{u.name}</div>
                              <div className="text-slate-400 text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-sm">
                          <div className="flex items-center gap-1"><MapPin size={11} />{u.location ?? u.loc ?? "—"}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 text-sm">{u.role ?? u.obj ?? "—"}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-600 rounded-full" style={{ width: `${u.progress ?? u.prog ?? 0}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{u.progress ?? u.prog ?? 0}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors["ativo"]}`}>ativo</span>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : (u.date ?? "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── OPPORTUNITIES ── */}
          {activeSection === "opportunities" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-slate-900">Oportunidades</h2>
                  <div className="text-slate-400 text-xs mt-0.5">{dataLoading ? "…" : `${realOpps.length} registros`}</div>
                </div>
                <button onClick={openCreateOpp} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
                  <Plus size={15} /> Adicionar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Título", "Organização", "Categoria", "Localização", "Prazo", "Status", "Ações"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">Carregando...</td></tr>
                    ) : realOpps.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">Nenhuma oportunidade cadastrada.</td></tr>
                    ) : (
                      realOpps.map((opp: any) => (
                        <tr key={opp.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{opp.category === "bolsa" ? "🎓" : opp.category === "emprego" ? "💼" : opp.category === "curso" ? "📚" : "🤝"}</span>
                              <div className="font-medium text-slate-800 text-sm">{opp.title}</div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">{opp.organizations?.name ?? "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{opp.category}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">{opp.location ?? "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">{opp.deadline ? new Date(opp.deadline).toLocaleDateString("pt-BR") : "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${opp.status === "ativo" ? "text-emerald-700 bg-emerald-50" : opp.status === "pausado" ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50"}`}>
                              {opp.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openApplicants(opp)} title="Ver candidatos" className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => openEditOpp(opp)} title="Editar" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => deleteOpp(opp.id)} title="Excluir" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MATCHES ── */}
          {activeSection === "matches" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total de matches", value: "12.840", color: "#6366F1" },
                  { label: "Score médio", value: "83%", color: "#10B981" },
                  { label: "Candidaturas geradas", value: "4.920", color: "#F59E0B" },
                  { label: "Conversão match→candidatura", value: "38.3%", color: "#8B5CF6" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="font-display font-semibold text-slate-900">Matches recentes</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Usuário", "Oportunidade", "Score", "Status", "Data"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataLoading ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">Carregando...</td></tr>
                      ) : realApps.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">Nenhuma inscrição encontrada.</td></tr>
                      ) : realApps.slice(0, 20).map((a: any) => (
                        <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(a.profiles?.name ?? "U").charAt(0)}
                              </div>
                              <span className="text-slate-700 text-sm">{a.profiles?.name ?? a.profiles?.email ?? "Usuário"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 text-sm max-w-xs truncate">{a.opportunities?.title ?? "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold text-emerald-600">—</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[a.status] ?? "bg-slate-100 text-slate-600"}`}>{a.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-sm">{new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── COMPANIES ── */}
          {activeSection === "companies" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Empresas ativas", value: "86", color: "#6366F1" },
                  { label: "Vagas publicadas", value: "284", color: "#F59E0B" },
                  { label: "Candidaturas", value: "3.420", color: "#10B981" },
                  { label: "Receita B2B empresa", value: "R$ 43.1k", color: "#8B5CF6" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataLoading ? (
                  <div className="col-span-3 text-center text-slate-400 text-sm py-8">Carregando...</div>
                ) : realOrgs.filter((o: any) => o.type === "empresa").length === 0 ? (
                  <div className="col-span-3 text-center text-slate-400 text-sm py-8">Nenhuma empresa cadastrada.</div>
                ) : realOrgs.filter((o: any) => o.type === "empresa").map((c: any) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm card-lift">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-slate-400 text-xs">{c.category ?? "Empresa"} · {c.location ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{c.verified ? "✓ Verificada" : "Não verificada"}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-brand-50 text-brand-700">empresa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INSTITUTIONS ── */}
          {activeSection === "institutions" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Instituições ativas", value: "43", color: "#6366F1" },
                  { label: "Oportunidades publicadas", value: "400", color: "#F59E0B" },
                  { label: "Interessados gerados", value: "1.500", color: "#10B981" },
                  { label: "Receita B2B inst.", value: "R$ 4.1k", color: "#8B5CF6" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dataLoading ? (
                  <div className="col-span-2 text-center text-slate-400 text-sm py-8">Carregando...</div>
                ) : realOrgs.filter((o: any) => o.type === "instituicao").length === 0 ? (
                  <div className="col-span-2 text-center text-slate-400 text-sm py-8">Nenhuma instituição cadastrada.</div>
                ) : realOrgs.filter((o: any) => o.type === "instituicao").map((inst: any) => (
                  <div key={inst.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 card-lift">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {inst.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{inst.name}</div>
                      <div className="text-slate-500 text-xs capitalize">{inst.category ?? "Instituição"} · {inst.location ?? "—"}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${inst.verified ? "bg-emerald-50" : "bg-slate-50"}`}>
                        <CheckCircle2 size={16} className={inst.verified ? "text-emerald-500" : "text-slate-300"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {activeSection === "payments" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Receita mensal", value: "R$ 47.2k", color: "#10B981", icon: <DollarSign size={18} /> },
                  { label: "Assinaturas ativas", value: "84", color: "#6366F1", icon: <CheckCircle2 size={18} /> },
                  { label: "Pagamentos pendentes", value: "3", color: "#F59E0B", icon: <Clock size={18} /> },
                  { label: "Cancelamentos mês", value: "2", color: "#F43F5E", icon: <AlertCircle size={18} /> },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: s.color + "15", color: s.color }}>
                      {s.icon}
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="font-display font-semibold text-slate-900">Histórico de pagamentos</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Empresa / Instituição", "Tipo", "Plano", "Valor", "Status", "Data"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PAYMENTS.map((p, i) => (
                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-800 text-sm">{p.company}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.type === "Empresa" ? "bg-brand-50 text-brand-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {p.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">{p.plan}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700 text-sm">{p.value}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-sm">{p.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PLANS ── */}
          {activeSection === "plans" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Company plans */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4">Planos Empresariais</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Starter", price: "R$ 199/mês", clients: 18, color: "#CBD5E1" },
                      { name: "Professional", price: "R$ 499/mês", clients: 32, color: "#6366F1" },
                      { name: "Business", price: "Personalizado", clients: 12, color: "#312E81" },
                    ].map((plan) => (
                      <div key={plan.name} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color }} />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{plan.name}</div>
                          <div className="text-slate-500 text-xs">{plan.price}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800">{plan.clients}</div>
                          <div className="text-slate-400 text-xs">clientes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Institution plans */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4">Planos Institucionais</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Essencial", price: "R$ 149/mês", clients: 15, color: "#A5B4FC" },
                      { name: "Avançado", price: "R$ 349/mês", clients: 9, color: "#8B5CF6" },
                    ].map((plan) => (
                      <div key={plan.name} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color }} />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{plan.name}</div>
                          <div className="text-slate-500 text-xs">{plan.price}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800">{plan.clients}</div>
                          <div className="text-slate-400 text-xs">clientes</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-brand-50 border border-brand-100">
                    <div className="text-brand-700 text-xs font-semibold mb-1">Plano gratuito para usuários</div>
                    <div className="text-brand-600 text-sm">2.480 usuários ativos · R$ 0</div>
                    <div className="text-brand-500 text-xs mt-0.5">Matching, recomendações e caminho personalizado</div>
                  </div>
                </div>
              </div>

              {/* Revenue breakdown */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Receita por plano</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MOCK_PLANS_USAGE} layout="vertical" margin={{ left: 120 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(1)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip formatter={(v) => [`R$ ${(v as number).toLocaleString("pt-BR")}`, "Receita"]} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {MOCK_PLANS_USAGE.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { title: "Configurações gerais", desc: "Nome da plataforma, logo, cores e configurações básicas.", icon: "⚙️" },
                { title: "Matching Engine", desc: "Ajuste os pesos do algoritmo de matching entre perfis e oportunidades.", icon: "🎯" },
                { title: "Notificações", desc: "Configure emails automáticos, alertas e notificações do sistema.", icon: "🔔" },
                { title: "Integrações", desc: "Stripe, Mercado Pago, APIs externas e webhooks.", icon: "🔌" },
                { title: "Segurança", desc: "Autenticação, permissões, logs de acesso e 2FA.", icon: "🔒" },
                { title: "Backup e dados", desc: "Exportar dados, políticas de retenção e arquivamento.", icon: "💾" },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-4 card-lift cursor-pointer">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                    <div className="text-slate-500 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}

              {/* Matching weights */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-1">Pesos do Motor de Matching</h3>
                <p className="text-slate-400 text-sm mb-6">Ajuste a importância de cada fator no cálculo de compatibilidade.</p>
                <div className="space-y-4">
                  {[
                    { label: "Objetivo", weight: 30, color: "#6366F1" },
                    { label: "Habilidades", weight: 25, color: "#8B5CF6" },
                    { label: "Localização", weight: 15, color: "#10B981" },
                    { label: "Disponibilidade", weight: 15, color: "#F59E0B" },
                    { label: "Requisitos", weight: 10, color: "#F43F5E" },
                    { label: "Preferências", weight: 5, color: "#06B6D4" },
                  ].map((factor) => (
                    <div key={factor.label} className="flex items-center gap-5">
                      <div className="w-28 text-sm font-medium text-slate-700">{factor.label}</div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${factor.weight * 3}%`, backgroundColor: factor.color }}
                        />
                      </div>
                      <div className="w-10 text-right text-sm font-bold text-slate-700">{factor.weight}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-slate-400 text-xs">Total: 100% · Alterações requerem redeploy do motor.</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* ── OPPORTUNITY CREATE/EDIT MODAL ── */}

    {oppModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900">{oppModal.opp ? "Editar oportunidade" : "Nova oportunidade"}</h3>
            <button onClick={() => setOppModal({ open: false, opp: null })} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="px-7 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título *</label>
              <input
                value={oppForm.title}
                onChange={(e) => setOppForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Desenvolvedor Júnior React"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição</label>
              <textarea
                value={oppForm.description}
                onChange={(e) => setOppForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Descreva a oportunidade..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Categoria</label>
                <select
                  value={oppForm.category}
                  onChange={(e) => setOppForm((f) => ({ ...f, category: e.target.value as OppCategory }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="emprego">Emprego</option>
                  <option value="bolsa">Bolsa</option>
                  <option value="curso">Curso</option>
                  <option value="programa">Programa</option>
                  <option value="voluntariado">Voluntariado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Modalidade</label>
                <select
                  value={oppForm.modality}
                  onChange={(e) => setOppForm((f) => ({ ...f, modality: e.target.value as OppModality }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Localização</label>
                <input
                  value={oppForm.location}
                  onChange={(e) => setOppForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: Niterói, RJ"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Vagas</label>
                <input
                  type="number"
                  value={oppForm.vacancies}
                  onChange={(e) => setOppForm((f) => ({ ...f, vacancies: e.target.value }))}
                  placeholder="Ex: 5"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Prazo</label>
                <input
                  type="date"
                  value={oppForm.deadline}
                  onChange={(e) => setOppForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={oppForm.status}
                  onChange={(e) => setOppForm((f) => ({ ...f, status: e.target.value as OppStatus }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Organização *</label>
              <select
                value={oppForm.org_id}
                onChange={(e) => setOppForm((f) => ({ ...f, org_id: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white"
              >
                <option value="">Selecione uma organização</option>
                {realOrgs.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={oppForm.is_free}
                onChange={(e) => setOppForm((f) => ({ ...f, is_free: e.target.checked }))}
                className="w-4 h-4 rounded accent-brand-600"
              />
              <span className="text-sm text-slate-700">Gratuito / sem custo para o candidato</span>
            </label>

            {oppError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{oppError}</div>
            )}
          </div>
          <div className="px-7 pb-6 flex gap-3 justify-end">
            <button onClick={() => setOppModal({ open: false, opp: null })} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button onClick={saveOpp} disabled={oppSaving} className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {oppSaving ? "Salvando..." : oppModal.opp ? "Salvar alterações" : "Criar oportunidade"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── APPLICANTS MODAL ── */}
    {applicantsModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-900">Candidatos</h3>
              <div className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">{applicantsModal.opp?.title}</div>
            </div>
            <button onClick={() => setApplicantsModal({ open: false, opp: null, applicants: [] })} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="px-7 py-5">
            {applicantsLoading ? (
              <div className="py-10 text-center text-slate-400 text-sm">Carregando candidatos...</div>
            ) : applicantsModal.applicants.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Nenhuma candidatura para esta oportunidade ainda.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {["Candidato", "Email", "Localização", "Status", "Data"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applicantsModal.applicants.map((a: any) => (
                    <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(a.profiles?.name ?? "U").charAt(0)}
                          </div>
                          <span className="text-slate-700 text-sm font-medium">{a.profiles?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{a.profiles?.email ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{a.profiles?.location ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status] ?? "bg-slate-100 text-slate-600"}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
