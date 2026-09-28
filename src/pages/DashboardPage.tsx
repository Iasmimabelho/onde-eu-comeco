import { useState, useEffect } from "react"
import { ArrowRight, Target, Bell, LogOut, User, Compass, CheckCircle2, Circle, Bookmark, FileText, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getOpportunities } from "@/services/opportunities"
import { getUserApplications, getSavedOpportunities } from "@/services/applications"
import { getRecommendations, getScoreColor, getScoreLabel } from "@/lib/matching"
import Navbar from "@/components/Navbar"
import OpportunityCard from "@/components/OpportunityCard"
import OpportunityModal from "@/components/OpportunityModal"
import type { Opportunity, Application } from "@/types/database"

const TABS = ["Visão geral", "Recomendações", "Salvas", "Inscrições"]

const STATUS_COLORS: Record<string, string> = {
  interesse: "bg-slate-100 text-slate-600",
  inscrito: "bg-blue-100 text-blue-700",
  em_analise: "bg-amber-100 text-amber-700",
  aprovado: "bg-emerald-100 text-emerald-700",
  recusado: "bg-red-100 text-red-600",
}
const STATUS_LABELS: Record<string, string> = {
  interesse: "Interesse",
  inscrito: "Inscrito",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
}

const PATH_STEPS = [
  { n: 1, label: "Identificar a oportunidade certa", status: "done" },
  { n: 2, label: "Fazer o onboarding do perfil", status: "done" },
  { n: 3, label: "Ver recomendações personalizadas", status: "current" },
  { n: 4, label: "Fazer a inscrição em oportunidades", status: "pending" },
  { n: 5, label: "Acompanhar o progresso", status: "pending" },
]

function ScoreChip({ score }: { score: number }) {
  const color = getScoreColor(score)
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: color + "18" }}>{score}%</span>
  )
}

function EmptyTab({ icon, title, desc, action, onAction }: { icon: string; title: string; desc: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-5">{desc}</p>
      {action && onAction && (
        <button onClick={onAction} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold">
          {action}
        </button>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile, logout, navigate } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [savedOpps, setSavedOpps] = useState<{ opportunities?: Opportunity }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getOpportunities(),
      getUserApplications(user.id),
      getSavedOpportunities(user.id),
    ]).then(([oppsRes, appsRes, savedRes]) => {
      setOpportunities(oppsRes.data)
      setApplications(appsRes.data)
      setSavedOpps(savedRes.data as { opportunities?: Opportunity }[])
      setLoading(false)
    })
  }, [user?.id])

  const recommendations = profile && opportunities.length > 0
    ? getRecommendations(profile, opportunities, 6)
    : []

  const firstName = user?.name?.split(" ")[0] || "Usuário"
  const avgScore = recommendations.length
    ? Math.round(recommendations.reduce((a, r) => a + r.score, 0) / recommendations.length)
    : 0

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xl font-bold mb-2">
                  {(user?.name || "U").charAt(0)}
                </div>
                <div className="font-semibold text-slate-900">{user?.name || "Usuário"}</div>
                <div className="text-slate-400 text-xs">{user?.location || "Localização não informada"}</div>
                {profile?.objetivo && (
                  <div className="mt-2 text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full capitalize">{profile.objetivo}</div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progresso do perfil</span>
                  <span>{user?.progress || 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand-600 transition-all duration-1000" style={{ width: `${user?.progress || 0}%` }} />
                </div>
              </div>

              <div className="space-y-1 text-sm">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${activeTab === i ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {tab}
                  </button>
                ))}
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={() => navigate("/oportunidades")}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Compass size={14} />Explorar oportunidades
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} />Sair
                </button>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Resumo</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recomendações</span>
                  <span className="font-semibold">{recommendations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inscrições</span>
                  <span className="font-semibold">{applications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Salvas</span>
                  <span className="font-semibold">{savedOpps.length}</span>
                </div>
                {avgScore > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compat. média</span>
                    <ScoreChip score={avgScore} />
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-5 lg:hidden">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === i ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Tab 0: Visão geral ── */}
            {activeTab === 0 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h1 className="text-xl font-display font-semibold text-slate-900 mb-1">
                    Olá, {firstName}! 👋
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {profile ? `${recommendations.length} oportunidades compatíveis com seu perfil.` : "Complete o onboarding para ver suas recomendações."}
                  </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Recomendações", value: recommendations.length, icon: <Target size={16} />, color: "#6366F1" },
                    { label: "Inscrições", value: applications.length, icon: <FileText size={16} />, color: "#10B981" },
                    { label: "Salvas", value: savedOpps.length, icon: <Bookmark size={16} />, color: "#F59E0B" },
                    { label: "Compat. média", value: avgScore ? `${avgScore}%` : "—", icon: <Target size={16} />, color: "#8B5CF6" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: stat.color + "15", color: stat.color }}>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{loading ? "…" : stat.value}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top recommendation */}
                {!loading && recommendations[0] && (
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 mb-3">Sua melhor recomendação</h2>
                    <OpportunityCard
                      opportunity={recommendations[0].opportunity}
                      matchScore={recommendations[0].score}
                      matchReasons={recommendations[0].reasons}
                      onOpen={setSelectedOpp}
                    />
                  </div>
                )}

                {/* Path steps */}
                <div className="bg-navy-900 rounded-2xl p-6">
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Seu caminho</div>
                  <div className="space-y-2">
                    {PATH_STEPS.map((s) => (
                      <div key={s.n} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
                        s.status === "current" ? "bg-amber-500/15 border border-amber-500/30" :
                        s.status === "done" ? "bg-emerald-500/10 border border-emerald-500/20" :
                        "bg-white/5"
                      }`}>
                        {s.status === "done" ? (
                          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        ) : s.status === "current" ? (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${s.status === "done" ? "text-emerald-400" : s.status === "current" ? "text-white font-medium" : "text-slate-500"}`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!profile && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                    <Bell size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900 mb-1">Complete seu perfil</div>
                      <p className="text-amber-700 text-sm mb-3">Faça o onboarding para receber recomendações personalizadas baseadas no seu perfil.</p>
                      <button onClick={() => navigate("/onboarding")} className="text-sm font-semibold text-amber-800 flex items-center gap-1 hover:underline">
                        Completar agora <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 1: Recomendações ── */}
            {activeTab === 1 && (
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-900 mb-5">Recomendações para você</h2>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 rounded-2xl shimmer" />)}
                  </div>
                ) : recommendations.length === 0 ? (
                  <EmptyTab
                    icon="🎯"
                    title="Nenhuma recomendação ainda"
                    desc="Complete o onboarding para receber oportunidades personalizadas."
                    action="Fazer onboarding"
                    onAction={() => navigate("/onboarding")}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.map(({ opportunity, score, reasons }) => (
                      <OpportunityCard key={opportunity.id} opportunity={opportunity} matchScore={score} matchReasons={reasons} onOpen={setSelectedOpp} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 2: Salvas ── */}
            {activeTab === 2 && (
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-900 mb-5">Oportunidades salvas</h2>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-44 rounded-2xl shimmer" />)}
                  </div>
                ) : savedOpps.length === 0 ? (
                  <EmptyTab
                    icon="🔖"
                    title="Nenhuma oportunidade salva"
                    desc="Salve oportunidades que te interessam para acessá-las facilmente aqui."
                    action="Explorar oportunidades"
                    onAction={() => navigate("/oportunidades")}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedOpps.map((s, i) => s.opportunities && (
                      <OpportunityCard key={i} opportunity={s.opportunities} isSavedInitial onOpen={setSelectedOpp} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 3: Inscrições ── */}
            {activeTab === 3 && (
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-900 mb-5">Minhas inscrições</h2>
                {loading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}</div>
                ) : applications.length === 0 ? (
                  <EmptyTab
                    icon="📋"
                    title="Nenhuma inscrição realizada"
                    desc='Quando você clicar em "Tenho interesse" em uma oportunidade, ela aparecerá aqui.'
                    action="Ver oportunidades"
                    onAction={() => navigate("/oportunidades")}
                  />
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 card-lift cursor-pointer"
                        onClick={() => app.opportunities && setSelectedOpp(app.opportunities)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">{app.opportunities?.title ?? "Oportunidade"}</div>
                          <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                            <Clock size={10} />
                            {new Date(app.created_at).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {STATUS_LABELS[app.status] ?? app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <OpportunityModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
    </div>
  )
}
