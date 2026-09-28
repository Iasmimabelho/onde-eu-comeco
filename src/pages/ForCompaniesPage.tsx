import { useState, useEffect } from "react"
import { ArrowRight, Users, Target, BarChart3, Briefcase, CheckCircle2, TrendingUp, Zap } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { getOrganizations } from "@/services/organizations"
import type { Organization } from "@/types/database"

const FEATURES = [
  {
    icon: <Target size={22} />,
    title: "Matching inteligente",
    desc: "Nosso algoritmo cruza os requisitos da sua vaga com o perfil de cada candidato, gerando um score de compatibilidade real.",
    color: "#6366F1",
  },
  {
    icon: <Users size={22} />,
    title: "Candidatos qualificados",
    desc: "Receba candidatos que já foram pré-selecionados pela IA com base nas habilidades, localização e disponibilidade que você precisa.",
    color: "#F59E0B",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Analytics em tempo real",
    desc: "Visualizações, matches, candidaturas e conversões em um dashboard completo para cada oportunidade publicada.",
    color: "#10B981",
  },
  {
    icon: <Zap size={22} />,
    title: "Publicação rápida",
    desc: "Publique vagas em minutos e comece a receber candidatos compatíveis no mesmo dia.",
    color: "#8B5CF6",
  },
]

export default function ForCompaniesPage() {
  const { navigate } = useAuth()
  const [companies, setCompanies] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  useEffect(() => {
    getOrganizations("empresa").then(({ data }) => {
      setCompanies(data ?? [])
      setLoadingOrgs(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F]">
      <Navbar />

      {/* Hero */}
      <section className="mesh-gradient pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium mb-6">
                <Briefcase size={12} className="text-amber-400" />
                Para Empresas
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight mb-5">
                Encontre pessoas<br />
                <em className="italic text-amber-400">compatíveis</em>, não apenas<br />currículos.
              </h1>
              <p className="text-slate-300 leading-relaxed mb-8">
                Publique oportunidades, encontre candidatos com matching inteligente
                e acompanhe os resultados em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/planos")}
                  className="group flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold transition-all shadow-lg"
                >
                  Quero oferecer oportunidades
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/planos")}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 font-medium transition-all"
                >
                  Ver planos
                </button>
              </div>
            </div>

            {/* Analytics preview card */}
            <div className="glass rounded-3xl p-6">
              <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">Analytics da oportunidade</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Visualizações", value: "1.240", trend: "+12%" },
                  { label: "Matches", value: "328", trend: "+8%" },
                  { label: "Candidaturas", value: "57", trend: "+23%" },
                  { label: "Conversão", value: "17.4%", trend: "+3%" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
                    <div className="text-emerald-400 text-xs mt-1">{stat.trend}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-white/50 text-xs mb-3">Top candidatos compatíveis</div>
                {[
                  { name: "Juliana S.", score: 93, city: "Niterói" },
                  { name: "Carlos M.", score: 87, city: "São Paulo" },
                  { name: "Ana F.", score: 82, city: "Rio de Janeiro" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="text-white text-xs flex-1">{c.name} · {c.city}</div>
                    <span className="text-emerald-400 text-xs font-bold">{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-3">
              Tudo que sua empresa precisa
            </h2>
            <p className="text-slate-500">Da publicação ao resultado, em um só lugar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm card-lift">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: f.color + "15", color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies using */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-semibold text-slate-900">Empresas na plataforma</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {loadingOrgs ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 w-52 h-16 animate-pulse" />
              ))
            ) : companies.length > 0 ? (
              companies.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                    <div className="text-slate-400 text-xs">{c.category ?? "Empresa"}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">Nenhuma empresa cadastrada ainda.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl font-light text-white mb-4">
            Pronto para encontrar o candidato certo?
          </h2>
          <p className="text-slate-400 mb-10">Comece com 14 dias gratuitos. Sem cartão de crédito.</p>
          <button
            onClick={() => navigate("/planos")}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold transition-all shadow-lg"
          >
            Ver planos para empresas
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
