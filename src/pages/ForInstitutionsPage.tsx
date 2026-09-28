import { useState, useEffect } from "react"
import { ArrowRight, GraduationCap, BookOpen, Users, BarChart3, Globe, Zap } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { getOrganizations } from "@/services/organizations"
import type { Organization } from "@/types/database"

const FEATURES = [
  {
    icon: <GraduationCap size={22} />,
    title: "Divulgue com precisão",
    desc: "Suas bolsas, cursos e programas chegam às pessoas com o perfil exato que você precisa — não um disparo genérico para todo mundo.",
    color: "#6366F1",
  },
  {
    icon: <Users size={22} />,
    title: "Interessados qualificados",
    desc: "Receba contatos de pessoas cuja necessidade, disponibilidade e localização são compatíveis com o que você oferece.",
    color: "#10B981",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Analytics de impacto",
    desc: "Veja quantas pessoas visualizaram, demonstraram interesse e se inscreveram em cada oportunidade publicada.",
    color: "#F59E0B",
  },
  {
    icon: <Globe size={22} />,
    title: "Alcance ampliado",
    desc: "Chegue além do seu próprio canal. Nossa base de usuários ativos em busca de oportunidades vai até você.",
    color: "#8B5CF6",
  },
]

const INSTITUTION_TYPES = [
  { label: "Faculdades e Universidades", icon: "🏫", desc: "Divulgue bolsas, vestibulares e programas de apoio estudantil." },
  { label: "Institutos e Cursos", icon: "🎓", desc: "Publique cursos profissionalizantes, capacitações e certificações." },
  { label: "Organizações Sociais", icon: "🤝", desc: "Alcance quem mais precisa dos seus programas de apoio." },
  { label: "Empresas de Capacitação", icon: "💼", desc: "Encontre profissionais em formação alinhados ao seu conteúdo." },
]

export default function ForInstitutionsPage() {
  const { navigate } = useAuth()
  const [institutions, setInstitutions] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  useEffect(() => {
    getOrganizations("instituicao").then(({ data }) => {
      setInstitutions(data ?? [])
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
                <GraduationCap size={12} className="text-amber-400" />
                Para Instituições
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight mb-5">
                Transforme oportunidades<br />
                em <em className="italic text-amber-400">pessoas alcançadas.</em>
              </h1>
              <p className="text-slate-300 leading-relaxed mb-8">
                Divulgue cursos, bolsas, programas e eventos para pessoas que realmente
                podem se beneficiar deles — com matching inteligente e analytics em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/planos")}
                  className="group flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold transition-all shadow-lg"
                >
                  Quero cadastrar minha instituição
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

            {/* Impact preview card */}
            <div className="glass rounded-3xl p-6">
              <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">Impacto da sua oportunidade</div>

              {/* Opportunity card preview */}
              <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/60 flex items-center justify-center text-lg">🎓</div>
                  <div>
                    <div className="text-white text-sm font-semibold">Bolsa Graduação 100%</div>
                    <div className="text-slate-400 text-xs">Faculdade Horizonte · Niterói</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Visualizações", v: "1.240" },
                    { label: "Matches", v: "328" },
                    { label: "Inscrições", v: "94" },
                    { label: "Conversão", v: "28.6%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3">
                      <div className="text-xl font-bold text-white">{s.v}</div>
                      <div className="text-slate-400 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perfis interessados */}
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-white/50 text-xs mb-3">Perfis mais compatíveis</div>
                {[
                  { name: "Juliana S., 32 anos", match: 93, location: "Niterói" },
                  { name: "Ana F., 27 anos", match: 88, location: "Rio de Janeiro" },
                  { name: "Carla M., 24 anos", match: 84, location: "Niterói" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="text-white text-xs flex-1">{p.name} · {p.location}</div>
                    <span className="text-emerald-400 text-xs font-bold">{p.match}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-3">
              Para que tipo de instituição?
            </h2>
            <p className="text-slate-500">Qualquer organização que ofereça oportunidades educacionais ou de desenvolvimento.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INSTITUTION_TYPES.map((t) => (
              <div key={t.label} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm card-lift text-center">
                <div className="text-4xl mb-4">{t.icon}</div>
                <div className="font-semibold text-slate-900 text-sm mb-2">{t.label}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-3">
              O que você ganha
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

      {/* Partner institutions */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-semibold text-slate-900">Instituições na plataforma</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {loadingOrgs ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 w-56 h-16 animate-pulse" />
              ))
            ) : institutions.length > 0 ? (
              institutions.map((inst) => (
                <div key={inst.id} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center gap-3 shadow-sm card-lift">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {inst.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{inst.name}</div>
                    <div className="text-slate-400 text-xs capitalize">{inst.category ?? "Instituição"}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">Nenhuma instituição cadastrada ainda.</p>
            )}
          </div>
        </div>
      </section>

      {/* How to publish */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-3">Como publicar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { n: "01", title: "Cadastre sua instituição", desc: "Crie sua conta e configure o perfil da sua instituição." },
              { n: "02", title: "Publique suas oportunidades", desc: "Adicione cursos, bolsas, programas ou eventos com todos os detalhes." },
              { n: "03", title: "Receba perfis compatíveis", desc: "Nossa IA encontra e conecta automaticamente quem tem mais a ganhar." },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl font-light text-white mb-4">
            Sua oportunidade pode mudar uma vida.
          </h2>
          <p className="text-slate-400 mb-10">
            Começar é simples. Publique sua primeira oportunidade gratuitamente nos primeiros dias.
          </p>
          <button
            onClick={() => navigate("/planos")}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold transition-all shadow-lg"
          >
            Ver planos para instituições
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
