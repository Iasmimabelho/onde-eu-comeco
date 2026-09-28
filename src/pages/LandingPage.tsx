import { useState, useEffect, useRef } from "react"
import { ArrowRight, ChevronDown, CheckCircle2, XCircle, MapPin, Users, Building2, GraduationCap, Briefcase, BookOpen, Handshake, TrendingUp, Star, Zap } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { getOpportunities } from "@/services/opportunities"
import { analyzeFreeTextSituation } from "@/services/ai"

const OBJECTIVE_OPTIONS = [
  { icon: "🎓", label: "Quero estudar", value: "estudar" },
  { icon: "💼", label: "Quero trabalhar", value: "trabalho" },
  { icon: "🚀", label: "Quero começar um negócio", value: "negocio" },
  { icon: "💻", label: "Quero aprender tecnologia", value: "tecnologia" },
  { icon: "🔄", label: "Quero mudar de carreira", value: "carreira" },
  { icon: "🤝", label: "Quero encontrar oportunidades", value: "oportunidades" },
  { icon: "❓", label: "Ainda não sei", value: "naosei" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Conte sua situação",
    desc: "Responda algumas perguntas simples sobre o que você quer e o que está dificultando.",
    color: "#6366F1",
  },
  {
    step: "02",
    title: "Entendemos seu perfil",
    desc: "Nossa IA analisa seus objetivos, habilidades e disponibilidade para montar seu perfil.",
    color: "#F59E0B",
  },
  {
    step: "03",
    title: "Encontramos oportunidades",
    desc: "Cruzamos seu perfil com um banco de bolsas, vagas, cursos e programas.",
    color: "#10B981",
  },
  {
    step: "04",
    title: "Você descobre por onde começar",
    desc: "Recebe um caminho personalizado com os próximos passos na ordem certa.",
    color: "#8B5CF6",
  },
]

const BEFORE_ITEMS = [
  "Não sabe quais bolsas existem",
  "Não sabe como conciliar trabalho e estudo",
  "Não sabe quais cursos pode fazer",
  "Não sabe quais programas existem",
  "Não sabe por onde começar",
]

const AFTER_ITEMS = [
  "Bolsa compatível encontrada — 93%",
  "Faculdade com horário noturno — 91%",
  "Vaga compatível com os estudos — 87%",
  "Programa de apoio próximo — 84%",
  "Plano de próximos passos pronto",
]

const MATCH_CARDS = [
  { icon: "🎯", label: "Bolsa de estudos", score: 93, color: "#10B981" },
  { icon: "🎓", label: "Faculdade Horizonte", score: 91, color: "#6366F1" },
  { icon: "💼", label: "Trabalho compatível", score: 87, color: "#F59E0B" },
  { icon: "🤝", label: "Programa de apoio", score: 84, color: "#8B5CF6" },
]

function ScoreCircle({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const r = 20
  const circ = 2 * Math.PI * r
  const offset = animated ? circ - (score / 100) * circ : circ

  return (
    <div ref={ref} className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg className="absolute" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E2E8F0" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 28 28)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{score}%</span>
    </div>
  )
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const duration = 1800
        const steps = 60
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
          current = Math.min(current + increment, target)
          setCount(Math.floor(current))
          if (current >= target) clearInterval(timer)
        }, duration / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>
}

export default function LandingPage() {
  const { navigate } = useAuth()
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  const [situation, setSituation] = useState("Quero fazer faculdade, mas não sei como conciliar com trabalho.")
  const [analysisText, setAnalysisText] = useState("Pronto para analisar sua situação")
  const [heroMatches, setHeroMatches] = useState(MATCH_CARDS)
  const [analyzingSituation, setAnalyzingSituation] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const analyzeSituation = async () => {
    if (!situation.trim() || analyzingSituation) return

    setAnalyzingSituation(true)
    setAnalysisError(null)
    setAnalysisText("A IA está entendendo o que você quer e o que você já sabe...")

    try {
      const { data: opportunities, error } = await getOpportunities()
      if (error) throw new Error("Não foi possível carregar as oportunidades.")
      if (!opportunities.length) throw new Error("Ainda não há oportunidades ativas para comparar.")

      setAnalysisText("Comparando seu texto com oportunidades reais...")
      const analysis = await analyzeFreeTextSituation(situation, opportunities)
      const byId = new Map(opportunities.map((opp) => [opp.id, opp]))

      const colors = ["#10B981", "#6366F1", "#F59E0B", "#8B5CF6"]
      const icons: Record<string, string> = {
        bolsa: "🎯",
        emprego: "💼",
        curso: "🎓",
        programa: "🤝",
        voluntariado: "🌱",
      }

      const realMatches = analysis.recomendacoes
        .map((rec, index) => {
          const opp = byId.get(rec.id)
          if (!opp) return null
          return {
            icon: icons[opp.category] ?? "✨",
            label: opp.title,
            score: Math.max(0, Math.min(100, Number(rec.compatibilidade) || 0)),
            color: colors[index % colors.length],
          }
        })
        .filter((item): item is (typeof MATCH_CARDS)[number] => item !== null)
        .slice(0, 4)

      if (!realMatches.length) throw new Error("A IA respondeu, mas não encontrou um match válido no banco.")

      setHeroMatches(realMatches)
      setAnalysisText(`IA concluiu: ${realMatches.length} melhores matches encontrados`)
      localStorage.setItem("oec_text_ai_analysis", JSON.stringify({
        situation,
        analysis,
        createdAt: new Date().toISOString(),
      }))
    } catch (err) {
      console.error("Erro ao analisar situação com IA:", err)
      const message = err instanceof Error ? err.message : "Não foi possível analisar agora."
      setAnalysisError(message)
      setAnalysisText("Não conseguimos consultar a IA agora. Tente novamente.")
    } finally {
      setAnalyzingSituation(false)
    }
  }

  const handleStart = () => {
    if (selectedObjective) {
      localStorage.setItem("oec_preselect", selectedObjective)
    }
    navigate("/onboarding")
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section className="landing-hero min-h-screen flex flex-col justify-center relative overflow-hidden bg-white">
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-medium mb-8">
                <Zap size={12} className="text-brand-600" />
                Plataforma de matching por IA
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-brand-950 leading-[1.05] mb-6">
                Não sabe por<br />
                <em className="italic text-brand-600 font-normal">onde começar?</em>
              </h1>

              <p className="text-slate-600 text-lg leading-relaxed max-w-md mb-10">
                A gente ajuda você a encontrar o primeiro passo. Conte sua situação — o{" "}
                <span className="text-brand-900 font-medium">Onde Eu Começo?</span> conecta seu perfil
                a oportunidades de estudo, trabalho, capacitação e apoio.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/onboarding")}
                  className="group flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-base transition-all shadow-lg shadow-brand-900/20 hover:-translate-y-0.5"
                >
                  Encontrar meu caminho
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-brand-200 text-brand-900 hover:bg-brand-50 font-medium text-base transition-all"
                >
                  Como funciona
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex items-center gap-8 mt-10 pt-10 border-t border-brand-100">
                <div>
                  <div className="text-2xl font-bold text-brand-900"><AnimatedCounter target={2480} /></div>
                  <div className="text-slate-500 text-xs mt-0.5">pessoas ajudadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-900"><AnimatedCounter target={684} /></div>
                  <div className="text-slate-500 text-xs mt-0.5">oportunidades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-900"><AnimatedCounter target={12840} /></div>
                  <div className="text-slate-500 text-xs mt-0.5">matches feitos</div>
                </div>
              </div>
            </div>

            {/* Right: visual — matching flow */}
            <div className={`transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="relative">
                {/* Central input card */}
                <div className="bg-white rounded-3xl p-6 mb-4 border border-brand-100 shadow-xl shadow-brand-900/10">
                  <div className="text-brand-600 text-xs font-medium mb-3 uppercase tracking-widest">Sua situação</div>
                  <div className="hero-situation-box">
                    <textarea
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      rows={3}
                      aria-label="Conte sua situação"
                      placeholder="Ex.: Quero fazer faculdade, mas preciso trabalhar e não sei quais bolsas existem."
                      className="hero-situation-input"
                    />
                    <button
                      onClick={analyzeSituation}
                      disabled={!situation.trim() || analyzingSituation}
                      className="hero-analyze-button disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {analyzingSituation ? "Analisando com IA..." : "Analisar com IA e encontrar matches"}
                      {!analyzingSituation && <ArrowRight size={15} />}
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                    <span className={`text-xs ${analysisError ? "text-red-600" : "text-slate-500"}`}>{analysisText}</span>
                  </div>
                  {analysisError && (
                    <div className="mt-2 text-[11px] text-red-600">{analysisError}</div>
                  )}
                </div>

                {/* Match cards */}
                <div className="grid grid-cols-2 gap-3">
                  {heroMatches.map((card, i) => (
                    <div
                      key={card.label}
                      className="bg-white rounded-2xl p-4 animate-float border border-brand-100 shadow-lg shadow-brand-900/5"
                      style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.5}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{card.icon}</span>
                        <span className="text-xs font-bold" style={{ color: card.color }}>{card.score}%</span>
                      </div>
                      <div className="text-brand-900 text-xs font-medium leading-tight">{card.label}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-brand-100">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${card.score}%`, backgroundColor: card.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA bottom */}
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-brand-900 text-sm font-semibold">Seu primeiro passo está aqui.</div>
                    <div className="text-slate-500 text-xs mt-0.5">{heroMatches.length} melhores matches exibidos</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-300 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ── QUICK OBJECTIVE SELECTOR ── */}
      <section className="landing-objectives py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-slate-900 mb-3">
            O que você gostaria de mudar?
          </h2>
          <p className="text-slate-500 mb-10">Selecione uma opção para começar seu caminho personalizado.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {OBJECTIVE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedObjective(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 card-lift ${
                  selectedObjective === opt.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-center leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base transition-all shadow-lg shadow-brand-600/25 hover:-translate-y-0.5"
          >
            {selectedObjective ? "Continuar com esta escolha" : "Explorar todas as opções"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── EMOTIONAL / JULIANA SECTION ── */}
      <section className="landing-story py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-slate-900 mb-4">
              Às vezes, o problema não é falta de oportunidade.
            </h2>
            <p className="text-xl text-slate-500 font-display italic">
              É não saber onde encontrá-la.
            </p>
          </div>

          {/* Juliana card */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            {/* Profile */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-sm border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-2xl font-display font-bold mb-3">
                J
              </div>
              <div className="font-semibold text-slate-900">Juliana</div>
              <div className="text-slate-500 text-xs mt-1">32 anos · Mãe solo</div>
              <div className="text-slate-500 text-xs">Niterói, RJ</div>
              <div className="mt-3 text-xs text-slate-400 italic font-display leading-relaxed">
                "Eu quero fazer faculdade, mas não sei por onde começar."
              </div>
            </div>

            {/* Before */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-red-100">
              <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">Antes</div>
              <div className="space-y-3">
                {BEFORE_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 text-sm leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <div className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">Depois</div>
              <div className="space-y-3">
                {AFTER_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 text-sm leading-tight font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl px-10 py-6">
              <p className="text-white font-display text-xl font-semibold">
                Agora ela sabe por onde começar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="landing-how py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-slate-900 mb-3">
              Como funciona
            </h2>
            <p className="text-slate-500 text-lg">Simples, rápido e personalizado para você.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-0" />
                )}
                <div className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm card-lift">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-bold mb-4"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESSING ANIMATION ── */}
      <section className="landing-plan py-24 bg-white overflow-hidden relative border-y border-brand-100">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-light text-brand-950 mb-3">
            Estamos encontrando caminhos para você...
          </h2>
          <p className="text-slate-500 mb-12">Nossa IA analisa seu perfil em segundos</p>

          <div className="max-w-sm mx-auto space-y-4">
            {[
              { label: "Entendendo seu perfil", done: true },
              { label: "Analisando seus objetivos", done: true },
              { label: "Consultando oportunidades", done: true },
              { label: "Comparando compatibilidade", done: false },
              { label: "Montando seu caminho", done: false },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-4 bg-brand-50 border border-brand-100 rounded-2xl px-5 py-3.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? "bg-brand-900" : "bg-brand-100"
                  }`}
                >
                  {item.done ? (
                    <CheckCircle2 size={14} className="text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" style={{ animationDelay: `${i * 0.3}s` }} />
                  )}
                </div>
                <span className="text-sm" style={{ color: "#FFFFFF", WebkitTextFillColor: "#FFFFFF", opacity: 1 }}>{item.label}</span>
                {!item.done && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full bg-brand-400 animate-pulse-soft"
                        style={{ animationDelay: `${d * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/onboarding")}
            className="mt-12 group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-base transition-all shadow-lg shadow-brand-900/20 hover:-translate-y-0.5"
          >
            Descobrir meu caminho
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="landing-stats py-20 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Users size={20} />, value: 2480, suffix: "", label: "Pessoas atendidas", color: "#6366F1" },
              { icon: <Star size={20} />, value: 684, suffix: "", label: "Oportunidades ativas", color: "#F59E0B" },
              { icon: <TrendingUp size={20} />, value: 12840, suffix: "", label: "Matches realizados", color: "#10B981" },
              { icon: <Building2 size={20} />, value: 86, suffix: "+", label: "Empresas parceiras", color: "#8B5CF6" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: stat.color + "15", color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP PREVIEW ── */}
      <section className="landing-opportunities py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">Localização</div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-slate-900 mb-5">
                Oportunidades perto de você
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Filtre oportunidades por região, categoria, modalidade e muito mais.
                Encontre o que está disponível onde você mora.
              </p>
              <div className="space-y-3">
                {[
                  { color: "#6366F1", label: "Cursos", count: 17 },
                  { color: "#F59E0B", label: "Vagas de emprego", count: 13 },
                  { color: "#8B5CF6", label: "Bolsas", count: 8 },
                  { color: "#10B981", label: "Programas", count: 5 },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-600 text-sm flex-1">{cat.label}</span>
                    <span className="text-slate-500 text-sm font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-brand-600 text-sm font-semibold">
                  <MapPin size={14} />
                  42 oportunidades em Niterói
                </div>
                <button
                  onClick={() => navigate("/mapa")}
                  className="text-brand-600 text-sm font-semibold hover:underline flex items-center gap-1"
                >
                  Abrir mapa completo →
                </button>
              </div>
            </div>

            {/* Mock map */}
            <div
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
              style={{ height: 380 }}
              onClick={() => navigate("/mapa")}
            >
              <div className="relative w-full h-full overflow-hidden">
                {/* Map bg */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 40%, #F0FDF4 100%)" }} />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                {/* Fake land */}
                <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
                  <path d="M50,180 Q150,130 250,160 Q340,190 400,140 L400,380 L50,380 Z" fill="#6366F1" />
                </svg>
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="mx-auto text-brand-400 mb-4 animate-float" />
                    <div className="font-semibold text-slate-600 mb-1">Niterói & Região</div>
                    <div className="text-slate-400 text-sm">42 oportunidades encontradas</div>
                    <div className="mt-3 text-brand-600 text-sm font-semibold group-hover:underline">Abrir mapa completo →</div>
                  </div>
                </div>
                {/* Fake pins */}
                {[
                  { top: "25%", left: "40%", color: "#6366F1" },
                  { top: "45%", left: "55%", color: "#F59E0B" },
                  { top: "60%", left: "35%", color: "#10B981" },
                  { top: "35%", left: "65%", color: "#8B5CF6" },
                  { top: "70%", left: "55%", color: "#F43F5E" },
                ].map((pin, i) => (
                  <div
                    key={i}
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md animate-pulse-soft"
                    style={{ top: pin.top, left: pin.left, backgroundColor: pin.color, animationDelay: `${i * 0.4}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── B2B SECTION ── */}
      <section className="landing-business py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">Para negócios</div>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-slate-900">
              Pessoas certas, no momento certo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-900 rounded-3xl p-8 text-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                <Briefcase size={22} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Para Empresas</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Encontre pessoas compatíveis, não apenas currículos. Publique oportunidades e
                acompanhe candidatos com matching inteligente.
              </p>
              <button
                onClick={() => navigate("/para-empresas")}
                className="group inline-flex items-center gap-2 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors"
              >
                Saiba mais <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="bg-brand-600 rounded-3xl p-8 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <GraduationCap size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Para Instituições</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                Transforme oportunidades em pessoas alcançadas. Divulgue cursos, bolsas e programas
                para quem realmente pode se beneficiar.
              </p>
              <button
                onClick={() => navigate("/para-instituicoes")}
                className="group inline-flex items-center gap-2 text-white text-sm font-semibold hover:text-indigo-200 transition-colors"
              >
                Saiba mais <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── GROWTH LOOP ── */}
      <section className="landing-social py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-display font-semibold text-slate-900 mb-4">
            O efeito de rede do produto
          </h2>
          <p className="text-slate-500 mb-12">Quanto mais cresce, melhor fica para todos.</p>

          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Mais oportunidades cadastradas", icon: "📋" },
                { label: "Mais usuários encontram caminhos", icon: "✅" },
                { label: "Mais empresas querem participar", icon: "🏢" },
                { label: "Matching cada vez mais preciso", icon: "🎯" },
                { label: "Mais resultados reais", icon: "📈" },
                { label: "Plataforma cresce com todos", icon: "🚀" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-slate-100 card-lift text-center"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-slate-700 text-sm font-medium leading-tight">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="landing-final-cta py-32 bg-brand-50 border-y border-brand-100 relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-5xl sm:text-6xl font-light text-brand-950 mb-4">
            Começa aqui.
          </h2>
          <p className="text-slate-600 text-xl font-display italic mb-12">
            Você não precisa saber o caminho. Só precisa dar o primeiro passo.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-lg transition-all shadow-xl shadow-brand-900/20 hover:-translate-y-1"
          >
            Encontrar meu caminho agora
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="mt-6 text-slate-500 text-sm">Gratuito · Sem cartão de crédito · Começa em 2 minutos</div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
