import { useState, useEffect } from "react"
import {
  Briefcase, Users, Plus, Pencil, Eye, LogOut, Settings,
  CheckCircle2, X, ChevronDown, BarChart2, Star, Zap, Building2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { createOpportunity, updateOpportunity } from "@/services/opportunities"
import type { Opportunity, OppCategory, OppModality, OppStatus, Organization } from "@/types/database"

type Section = "opportunities" | "applicants" | "profile" | "planos"
type OrgPlan = "gratuito" | "profissional" | "empresarial"

const PLANS: { id: OrgPlan; label: string; icon: React.ReactNode; color: string; maxOpps: number | null; features: string[] }[] = [
  {
    id: "gratuito",
    label: "Gratuito",
    icon: <Star size={18} />,
    color: "#94A3B8",
    maxOpps: 2,
    features: ["Até 2 oportunidades ativas", "Gerenciamento básico de candidatos", "Perfil da organização"],
  },
  {
    id: "profissional",
    label: "Profissional",
    icon: <Zap size={18} />,
    color: "#6366F1",
    maxOpps: 10,
    features: ["Até 10 oportunidades ativas", "Destaque de oportunidades", "Relatórios de candidaturas", "Analytics básico"],
  },
  {
    id: "empresarial",
    label: "Empresarial",
    icon: <Building2 size={18} />,
    color: "#F59E0B",
    maxOpps: null,
    features: ["Oportunidades ilimitadas", "Analytics avançado", "Relatórios completos", "Suporte prioritário", "Recursos avançados"],
  },
]

const statusLabel: Record<OppStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
}

const statusColor: Record<OppStatus, string> = {
  ativo: "text-emerald-700 bg-emerald-50",
  pausado: "text-amber-700 bg-amber-50",
  encerrado: "text-red-600 bg-red-50",
}

const appStatusLabel: Record<string, string> = {
  interesse: "Interesse",
  inscrito: "Inscrito",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
}

const appStatusColor: Record<string, string> = {
  interesse: "text-blue-600 bg-blue-50",
  inscrito: "text-brand-600 bg-brand-50",
  em_analise: "text-amber-700 bg-amber-50",
  aprovado: "text-emerald-700 bg-emerald-50",
  recusado: "text-red-600 bg-red-50",
}

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "emprego" as OppCategory,
  modality: "presencial" as OppModality,
  location: "",
  deadline: "",
  vacancies: "",
  status: "ativo" as OppStatus,
  is_free: true,
  salary: "",
}

export default function OrgDashboardPage() {
  const { user, logout, navigate } = useAuth()
  const [section, setSection] = useState<Section>("opportunities")
  const [org, setOrg] = useState<Organization | null>(null)
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; opp: Opportunity | null }>({ open: false, opp: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [applicants, setApplicants] = useState<{ opp: Opportunity; list: any[] } | null>(null)
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", description: "", website: "", location: "", category: "" })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from("organizations").select("*").eq("user_id", user.id).maybeSingle(),
    ]).then(([{ data: orgData }]) => {
      if (orgData) {
        setOrg(orgData as Organization)
        setProfileForm({
          name: orgData.name ?? "",
          description: orgData.description ?? "",
          website: orgData.website ?? "",
          location: orgData.location ?? "",
          category: orgData.category ?? "",
        })
        supabase
          .from("opportunities")
          .select("*, organizations(*)")
          .eq("org_id", orgData.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            setOpps((data ?? []) as Opportunity[])
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [user])

  const openCreate = () => {
    const plan = PLANS.find((p) => p.id === (org?.plan ?? "gratuito"))
    const activeCount = opps.filter((o) => o.status === "ativo").length
    if (plan?.maxOpps !== null && plan?.maxOpps !== undefined && activeCount >= plan.maxOpps) {
      alert(`Seu plano ${plan.label} permite até ${plan.maxOpps} oportunidades ativas. Faça upgrade para publicar mais.`)
      return
    }
    setForm(EMPTY_FORM)
    setFormError("")
    setModal({ open: true, opp: null })
  }

  const openEdit = (opp: Opportunity) => {
    setForm({
      title: opp.title,
      description: opp.description ?? "",
      category: opp.category,
      modality: opp.modality,
      location: opp.location ?? "",
      deadline: opp.deadline ? opp.deadline.slice(0, 10) : "",
      vacancies: opp.vacancies?.toString() ?? "",
      status: opp.status,
      is_free: opp.is_free,
      salary: opp.salary ?? "",
    })
    setFormError("")
    setModal({ open: true, opp })
  }

  const saveOpp = async () => {
    if (!form.title.trim()) { setFormError("Título é obrigatório."); return }
    if (!org) return
    setSaving(true)
    setFormError("")
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      modality: form.modality,
      location: form.location,
      deadline: form.deadline || null,
      vacancies: form.vacancies ? parseInt(form.vacancies) : null,
      status: form.status,
      is_free: form.is_free,
      salary: form.salary || null,
      org_id: org.id,
      requirements: [] as string[],
      skills_required: [] as string[],
      objectives_match: [] as string[],
      image_url: null as string | null,
    }
    let result
    if (modal.opp) {
      result = await updateOpportunity(modal.opp.id, payload)
    } else {
      result = await createOpportunity(payload)
    }
    setSaving(false)
    if (result.error) { setFormError(result.error.message ?? "Erro ao salvar."); return }
    setModal({ open: false, opp: null })
    const { data } = await supabase.from("opportunities").select("*, organizations(*)").eq("org_id", org.id).order("created_at", { ascending: false })
    setOpps((data ?? []) as Opportunity[])
  }

  const toggleStatus = async (opp: Opportunity, newStatus: OppStatus) => {
    await updateOpportunity(opp.id, { status: newStatus })
    setOpps((prev) => prev.map((o) => o.id === opp.id ? { ...o, status: newStatus } : o))
  }

  const loadApplicants = async (opp: Opportunity) => {
    setApplicants({ opp, list: [] })
    setApplicantsLoading(true)
    setSection("applicants")

    const { data: apps } = await supabase
      .from("applications")
      .select("id, user_id, opportunity_id, status, created_at, notes")
      .eq("opportunity_id", opp.id)
      .order("created_at", { ascending: false })

    if (!apps || apps.length === 0) {
      setApplicants({ opp, list: [] })
      return
    }

    const userIds = [...new Set(apps.map((a: any) => a.user_id))]
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, name, email, location")
      .in("id", userIds)

    const profileMap: Record<string, any> = {}
    for (const p of profileRows ?? []) profileMap[p.id] = p

    const merged = apps.map((a: any) => ({ ...a, profiles: profileMap[a.user_id] ?? null }))
    setApplicants({ opp, list: merged })
    setApplicantsLoading(false)
  }

  const updateAppStatus = async (appId: string, newStatus: string) => {
    await supabase.from("applications").update({ status: newStatus }).eq("id", appId)
    setApplicants((prev) => prev ? {
      ...prev,
      list: prev.list.map((a) => a.id === appId ? { ...a, status: newStatus } : a),
    } : prev)
  }

  const saveProfile = async () => {
    if (!org) return
    setProfileSaving(true)
    await supabase.from("organizations").update({
      name: profileForm.name,
      description: profileForm.description,
      website: profileForm.website,
      location: profileForm.location,
      category: profileForm.category,
    }).eq("id", org.id)
    setOrg((prev) => prev ? { ...prev, ...profileForm } : prev)
    setProfileSaving(false)
    setProfileMsg("Perfil atualizado!")
    setTimeout(() => setProfileMsg(""), 3000)
  }

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F] flex">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-navy-900 flex flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/10">
          <button onClick={() => navigate("/")} className="font-display text-base font-semibold text-white block">
            onde eu começo?
          </button>
          <div className="text-slate-500 text-xs mt-0.5">{org?.name ?? "Organização"}</div>
          {org?.plan && org.plan !== "gratuito" && (
            <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: org.plan === "empresarial" ? "#F59E0B22" : "#6366F122", color: org.plan === "empresarial" ? "#D97706" : "#6366F1" }}>
              {org.plan}
            </div>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: "opportunities" as Section, label: "Oportunidades", icon: <Briefcase size={15} /> },
            { id: "applicants" as Section, label: "Candidatos", icon: <Users size={15} /> },
            { id: "planos" as Section, label: "Planos", icon: <BarChart2 size={15} /> },
            { id: "profile" as Section, label: "Perfil", icon: <Settings size={15} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                section === item.id ? "bg-brand-600 text-white font-semibold" : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* ── OPPORTUNITIES ── */}
        {section === "opportunities" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-display font-semibold text-slate-900">Oportunidades</h1>
                <p className="text-slate-400 text-sm mt-0.5">{opps.length} publicadas</p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus size={15} /> Nova oportunidade
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-20 animate-pulse" />)}
              </div>
            ) : opps.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-semibold text-slate-900 mb-1">Nenhuma oportunidade ainda</h3>
                <p className="text-slate-400 text-sm mb-5">Crie sua primeira oportunidade e comece a receber candidatos.</p>
                <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
                  Criar oportunidade
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Oportunidade", "Categoria", "Modalidade", "Prazo", "Status", "Ações"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opps.map((opp) => (
                      <tr key={opp.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-800 text-sm">{opp.title}</div>
                          {opp.salary && <div className="text-slate-400 text-xs mt-0.5">{opp.salary}</div>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{opp.category}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-sm capitalize">{opp.modality}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-sm">
                          {opp.deadline ? new Date(opp.deadline).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="relative group inline-block">
                            <button className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusColor[opp.status]}`}>
                              {statusLabel[opp.status]} <ChevronDown size={11} />
                            </button>
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-10 hidden group-hover:block min-w-max">
                              {(["ativo", "pausado", "encerrado"] as OppStatus[]).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => toggleStatus(opp, s)}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 capitalize"
                                >
                                  {statusLabel[s]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => loadApplicants(opp)} title="Ver candidatos" className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => openEdit(opp)} title="Editar" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── APPLICANTS ── */}
        {section === "applicants" && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-display font-semibold text-slate-900">
                {applicants ? `Candidatos — ${applicants.opp.title}` : "Candidatos"}
              </h1>
              {!applicants && <p className="text-slate-400 text-sm mt-0.5">Selecione uma oportunidade para ver os candidatos.</p>}
            </div>

            {!applicants ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-slate-400 text-sm">Clique em <strong>Ver candidatos</strong> em uma oportunidade para visualizá-los aqui.</p>
              </div>
            ) : applicantsLoading ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
                Carregando candidatos...
              </div>
            ) : applicants.list.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="font-semibold text-slate-900 mb-1">Nenhuma candidatura ainda</h3>
                <p className="text-slate-400 text-sm">Quando alguém demonstrar interesse, aparecerá aqui.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Candidato", "Email", "Localização", "Status", "Data", "Ação"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.list.map((a: any) => (
                      <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(a.profiles?.name ?? "U").charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800 text-sm">{a.profiles?.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-sm">{a.profiles?.email ?? "—"}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-sm">{a.profiles?.location ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appStatusColor[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {appStatusLabel[a.status] ?? a.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-sm">{new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="px-5 py-3.5">
                          <select
                            value={a.status}
                            onChange={(e) => updateAppStatus(a.id, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-400"
                          >
                            {Object.entries(appStatusLabel).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {section === "profile" && (
          <div className="max-w-xl">
            <h1 className="text-xl font-display font-semibold text-slate-900 mb-6">Perfil da organização</h1>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome da organização</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição</label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Website</label>
                  <input
                    value={profileForm.website}
                    onChange={(e) => setProfileForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Localização</label>
                  <input
                    value={profileForm.location}
                    onChange={(e) => setProfileForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Ex: Niterói, RJ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Setor / Categoria</label>
                <input
                  value={profileForm.category}
                  onChange={(e) => setProfileForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Ex: Tecnologia, Educação..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {profileMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  <CheckCircle2 size={15} /> {profileMsg}
                </div>
              )}
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
              >
                {profileSaving ? "Salvando..." : "Salvar perfil"}
              </button>
            </div>
          </div>
        )}

        {/* ── PLANOS ── */}
        {section === "planos" && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-display font-semibold text-slate-900">Planos</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Plano atual: <span className="font-semibold text-slate-700 capitalize">{org?.plan ?? "gratuito"}</span>
              </p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Oportunidades ativas", value: opps.filter((o) => o.status === "ativo").length.toString() },
                { label: "Total de oportunidades", value: opps.length.toString() },
                { label: "Limite do plano", value: (() => {
                  const p = PLANS.find((pl) => pl.id === (org?.plan ?? "gratuito"))
                  return p?.maxOpps === null ? "Ilimitado" : (p?.maxOpps?.toString() ?? "2")
                })() },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = (org?.plan ?? "gratuito") === plan.id
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl border-2 p-6 shadow-sm flex flex-col relative ${
                      isCurrent ? "border-brand-500 shadow-brand-100" : "border-slate-100"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold">
                        Plano atual
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: plan.color + "18", color: plan.color }}>
                        {plan.icon}
                      </div>
                      <span className="font-display font-semibold text-slate-900">{plan.label}</span>
                    </div>
                    <ul className="space-y-2 flex-1 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <button
                        onClick={() => alert("Entre em contato para fazer upgrade do seu plano.")}
                        className="w-full py-2.5 rounded-xl border-2 border-slate-200 hover:border-brand-400 text-slate-700 hover:text-brand-700 text-sm font-semibold transition-all"
                      >
                        Fazer upgrade
                      </button>
                    )}
                    {isCurrent && (
                      <div className="w-full py-2.5 rounded-xl bg-brand-50 text-brand-700 text-sm font-semibold text-center">
                        Ativo
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-slate-400 text-xs mt-6 text-center">
              Para fazer upgrade, entre em contato com nossa equipe comercial.
            </p>
          </div>
        )}
      </main>

      {/* ── OPPORTUNITY MODAL ── */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-semibold text-slate-900">{modal.opp ? "Editar oportunidade" : "Nova oportunidade"}</h3>
              <button onClick={() => setModal({ open: false, opp: null })} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-7 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título *</label>
                <input value={form.title} onChange={setF("title")} placeholder="Ex: Desenvolvedor Júnior React" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição</label>
                <textarea value={form.description} onChange={setF("description")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Categoria</label>
                  <select value={form.category} onChange={setF("category")} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white">
                    <option value="emprego">Emprego</option>
                    <option value="bolsa">Bolsa</option>
                    <option value="curso">Curso</option>
                    <option value="programa">Programa</option>
                    <option value="voluntariado">Voluntariado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Modalidade</label>
                  <select value={form.modality} onChange={setF("modality")} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white">
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Localização</label>
                  <input value={form.location} onChange={setF("location")} placeholder="Ex: Niterói, RJ" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Vagas</label>
                  <input type="number" value={form.vacancies} onChange={setF("vacancies")} placeholder="Ex: 5" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Prazo</label>
                  <input type="date" value={form.deadline} onChange={setF("deadline")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Salário / Valor</label>
                  <input value={form.salary} onChange={setF("salary")} placeholder="Ex: R$ 2.000" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                <select value={form.status} onChange={setF("status")} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-400 bg-white">
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_free} onChange={(e) => setForm((f) => ({ ...f, is_free: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-slate-700">Gratuito / sem custo para o candidato</span>
              </label>
              {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
            </div>
            <div className="px-7 pb-6 flex gap-3 justify-end">
              <button onClick={() => setModal({ open: false, opp: null })} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={saveOpp} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                {saving ? "Salvando..." : modal.opp ? "Salvar alterações" : "Criar oportunidade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
