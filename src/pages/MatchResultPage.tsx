import { useState, useEffect, useRef } from "react"
import { ArrowRight, Clock, Check } from "lucide-react"
import Navbar from "@/components/Navbar"
import OpportunityCard from "@/components/OpportunityCard"
import OpportunityModal from "@/components/OpportunityModal"
import { useAuth } from "@/contexts/AuthContext"
import { getOpportunities } from "@/services/opportunities"
import { getRecommendations, getScoreColor, getScoreLabel } from "@/lib/matching"
import type { Opportunity } from "@/types/database"

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const color = getScoreColor(score)
  const r = size * 0.36
  const circ = 2 * Math.PI * r
  const offset = animated ? circ - (score / 100) * circ : circ

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="text-lg font-bold" style={{ color }}>{score}%</span>
    </div>
  )
}

const PATH_STEPS = [
  { n: "01", label: "Solicitar bolsa ou vaga identificada", status: "current", deadline: "Esta semana" },
  { n: "02", label: "Preparar documentação necessária", status: "pending", deadline: "Próximos dias" },
  { n: "03", label: "Fazer a inscrição formal", status: "pending", deadline: "Conforme prazo" },
  { n: "04", label: "Aguardar retorno e se preparar", status: "pending", deadline: "Após inscrição" },
  { n: "05", label: "Dar o primeiro passo no caminho escolhido", status: "pending", deadline: "Em breve" },
]

export default function MatchResultPage() {
  const { user, profile, navigate } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)

  useEffect(() => {
    getOpportunities().then(({ data }) => {
      setOpportunities(data)
      setLoading(false)
    })
  }, [])

  // Always calculate results when opportunities exist — profile can be null (uses neutral scores)
  const results = !loading && opportunities.length > 0 ? getRecommendations(profile, opportunities, 8) : []
  const mainResult = results[0]

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F]">
      <Navbar />

      {/* Hero */}
      <section className="mesh-gradient pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-brand-300 border-t-white animate-spin" />
              <p className="text-white/60 text-sm">Analisando perfil e buscando oportunidades...</p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
                <Check size={12} />
                {results.length} oportunidades compatíveis encontradas
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-light text-white mb-4">
                Encontramos um caminho para você.
              </h1>
              <p className="text-slate-400 text-lg mb-8">
                Baseado no seu perfil, aqui estão as melhores oportunidades.
              </p>
            </>
          )}

          <div className="glass rounded-3xl p-6 max-w-md mx-auto text-left">
            <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Seu perfil</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {(user?.name || "U").charAt(0)}
              </div>
              <div>
                <div className="text-white font-medium">{user?.name || "Você"}</div>
                <div className="text-slate-400 text-xs">
                  {profile?.localizacao || user?.location || "Localização não informada"} ·{" "}
                  {profile?.disponibilidade === "noite" ? "Disponibilidade noturna" : profile?.disponibilidade || "Disponibilidade variável"}
                </div>
              </div>
            </div>
            {profile?.vitoria && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-white/50 text-xs mb-1">Objetivo</div>
                <div className="text-white text-sm">{profile.vitoria}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured match */}
      {!loading && mainResult && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
            <div className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-4">🎯 Melhor compatibilidade</div>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1">
                <h2 className="text-xl font-display font-semibold text-slate-900 mb-1">{mainResult.opportunity.title}</h2>
                <div className="text-slate-500 text-sm mb-3">
                  {mainResult.opportunity.organizations?.name} · {mainResult.opportunity.location || "Online"}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{mainResult.opportunity.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mainResult.reasons.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                      <Check size={10} /> {r}
                    </span>
                  ))}
                </div>
                <div className="text-slate-400 text-xs italic">Compatibilidade estimada baseada no seu perfil.</div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <ScoreRing score={mainResult.score} size={88} />
                <div className="text-center">
                  <div className="text-xs font-semibold" style={{ color: getScoreColor(mainResult.score) }}>
                    {getScoreLabel(mainResult.score)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOpp(mainResult.opportunity)}
                  className="w-full px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all"
                >
                  Ver oportunidade
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty state — only when no active opps exist in the database */}
      {!loading && opportunities.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma oportunidade ativa no momento</h3>
            <p className="text-slate-500 text-sm mb-6">Novas oportunidades são adicionadas regularmente. Volte em breve!</p>
            <button onClick={() => navigate("/oportunidades")} className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm">
              Explorar oportunidades
            </button>
          </div>
        </section>
      )}

      {/* Other matches */}
      {!loading && results.length > 1 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-xl font-display font-semibold text-slate-900 mb-6">Outras recomendações para você</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.slice(1, 5).map(({ opportunity, score, reasons }) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                matchScore={score}
                matchReasons={reasons}
                onOpen={setSelectedOpp}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/oportunidades")}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-200 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-all"
            >
              Ver todas as oportunidades
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      )}

      {/* Path steps */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-navy-900 rounded-3xl p-8">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Seu caminho</div>
          <h2 className="text-2xl font-display font-light text-white mb-6">Um passo de cada vez.</h2>
          <div className="space-y-3">
            {PATH_STEPS.map((s) => (
              <div
                key={s.n}
                className={`flex items-center gap-5 rounded-2xl px-5 py-4 ${
                  s.status === "current" ? "bg-amber-500/15 border border-amber-500/30" : "bg-white/5 border border-white/5"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  s.status === "current" ? "bg-amber-500 text-navy-900" : "bg-white/10 text-slate-400"
                }`}>
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${s.status === "current" ? "text-white" : "text-slate-400"}`}>{s.label}</div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                    <Clock size={10} />{s.deadline}
                  </div>
                </div>
                {s.status === "current" && (
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">Próximo passo</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold transition-all"
            >
              Acompanhar meu caminho
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/oportunidades")}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/20 text-white hover:bg-white/10 font-medium transition-all"
            >
              Explorar mais oportunidades
            </button>
          </div>
        </div>
      </section>

      <OpportunityModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
    </div>
  )
}
