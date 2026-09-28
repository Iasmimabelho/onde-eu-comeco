import { useState, useEffect } from "react"
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import type { UserProfile } from "@/contexts/AuthContext"

const STEPS = [
  { id: 1, title: "O que você gostaria de mudar?", subtitle: "Escolha o que melhor descreve seu objetivo." },
  { id: 2, title: "O que está dificultando?", subtitle: "Pode selecionar mais de uma opção." },
  { id: 3, title: "O que você já sabe fazer?", subtitle: "Selecione suas habilidades atuais." },
  { id: 4, title: "Quanto tempo você tem disponível?", subtitle: "Isso nos ajuda a encontrar oportunidades compatíveis." },
  { id: 5, title: "O que seria uma vitória para você nos próximos meses?", subtitle: "Pense no que te daria mais satisfação alcançar." },
]

const OBJECTIVES = [
  { icon: "🎓", label: "Quero estudar", value: "estudar" },
  { icon: "💼", label: "Quero trabalhar", value: "trabalho" },
  { icon: "🚀", label: "Quero começar um negócio", value: "negocio" },
  { icon: "💻", label: "Quero aprender tecnologia", value: "tecnologia" },
  { icon: "🔄", label: "Quero mudar de carreira", value: "carreira" },
  { icon: "🤝", label: "Quero encontrar oportunidades", value: "oportunidades" },
  { icon: "❓", label: "Ainda não sei", value: "naosei" },
]

const DIFFICULTIES = [
  { icon: "💰", label: "Dinheiro", value: "dinheiro" },
  { icon: "⏰", label: "Falta de tempo", value: "tempo" },
  { icon: "📍", label: "Localização", value: "localizacao" },
  { icon: "📚", label: "Falta de conhecimento", value: "conhecimento" },
  { icon: "💼", label: "Falta de experiência", value: "experiencia" },
  { icon: "👨‍👩‍👧", label: "Responsabilidades familiares", value: "familia" },
  { icon: "❓", label: "Não sei por onde começar", value: "naosei" },
]

const SKILLS = [
  { icon: "💻", label: "Informática", value: "informatica" },
  { icon: "⌨️", label: "Programação", value: "programacao" },
  { icon: "📣", label: "Vendas", value: "vendas" },
  { icon: "🗣️", label: "Comunicação", value: "comunicacao" },
  { icon: "🎧", label: "Atendimento", value: "atendimento" },
  { icon: "📊", label: "Administração", value: "administracao" },
  { icon: "🎨", label: "Design", value: "design" },
  { icon: "📱", label: "Marketing", value: "marketing" },
  { icon: "🌐", label: "Idiomas", value: "idiomas" },
  { icon: "📁", label: "Organização", value: "organizacao" },
  { icon: "📈", label: "Excel / Planilhas", value: "excel" },
  { icon: "👥", label: "Liderança", value: "liderança" },
]

const AVAILABILITIES = [
  { label: "Menos de 5h/semana", value: "menos5", icon: "⚡" },
  { label: "5 a 10h/semana", value: "5a10", icon: "🕐" },
  { label: "10 a 20h/semana", value: "10a20", icon: "📅" },
  { label: "20 a 30h/semana", value: "20a30", icon: "📆" },
  { label: "Período integral", value: "integral", icon: "🕐" },
  { label: "Somente noturno", value: "noite", icon: "🌙" },
  { label: "Finais de semana", value: "fds", icon: "📅" },
]

const VICTORIES = [
  { label: "Conseguir emprego", value: "conseguir emprego", icon: "💼" },
  { label: "Começar faculdade", value: "começar faculdade", icon: "🎓" },
  { label: "Conseguir uma bolsa", value: "conseguir bolsa", icon: "🏅" },
  { label: "Aprender uma habilidade", value: "aprender habilidade", icon: "📚" },
  { label: "Aumentar minha renda", value: "aumentar renda", icon: "💰" },
  { label: "Mudar de carreira", value: "mudar de carreira", icon: "🔄" },
  { label: "Começar meu negócio", value: "começar negócio", icon: "🚀" },
  { label: "Encontrar uma oportunidade", value: "encontrar oportunidade", icon: "🔍" },
]

export default function OnboardingPage() {
  const { completeOnboarding, navigate } = useAuth()
  const { theme } = useTheme()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<UserProfile>({
    objetivo: "",
    dificuldades: [],
    habilidades: [],
    disponibilidade: "",
    vitoria: "",
  })
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)

  useEffect(() => {
    const preselect = localStorage.getItem("oec_preselect")
    if (preselect) {
      setProfile((p) => ({ ...p, objetivo: preselect }))
      localStorage.removeItem("oec_preselect")
    }
  }, [])

  const progress = ((step - 1) / STEPS.length) * 100

  const toggleMulti = (key: "dificuldades" | "habilidades", value: string) => {
    setProfile((p) => {
      const arr = p[key] || []
      return {
        ...p,
        [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      }
    })
  }

  const canAdvance = () => {
    if (step === 1) return !!profile.objetivo
    if (step === 2) return (profile.dificuldades?.length || 0) > 0
    if (step === 3) return (profile.habilidades?.length || 0) > 0
    if (step === 4) return !!profile.disponibilidade
    if (step === 5) return !!profile.vitoria
    return true
  }

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }

  const PROCESSING_LABELS = [
    "Entendendo seu perfil...",
    "Analisando seus objetivos...",
    "Consultando oportunidades...",
    "Comparando compatibilidade...",
    "Montando seu caminho...",
  ]

  const handleFinish = async () => {
    setProcessing(true)
    for (let i = 0; i < PROCESSING_LABELS.length; i++) {
      setProcessingStep(i)
      await new Promise((r) => setTimeout(r, 600))
    }
    await completeOnboarding(profile)
    navigate("/resultado")
  }

  if (processing) {
    const dark = theme === "dark"
    const pageBg = dark ? "#071B33" : "#F7FAFD"
    const titleColor = dark ? "#FFFFFF" : "#081A33"
    const subtitleColor = dark ? "#C8D5E3" : "#60758C"
    const cardBg = dark ? "#142C45" : "#FFFFFF"
    const cardBorder = dark ? "#2A4966" : "#D7E3EE"
    const activeText = dark ? "#FFFFFF" : "#16324F"
    const futureText = dark ? "#AFC0D1" : "#6E849A"

    return (
      <div
        style={{ minHeight: "100vh", backgroundColor: pageBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
          <div
            aria-label="Analisando perfil"
            style={{
              width: 58, height: 58, margin: "0 auto 30px", borderRadius: "50%",
              border: `3px solid ${dark ? "#294864" : "#D7E3EE"}`,
              borderTopColor: dark ? "#FFFFFF" : "#0B2A4A",
              animation: "spin-slow 1s linear infinite"
            }}
          />
          <h2
            style={{ margin: "0 0 8px", color: titleColor, fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 400, lineHeight: 1.15 }}
          >
            Estamos encontrando caminhos para você...
          </h2>
          <p style={{ margin: "0 0 38px", color: subtitleColor, fontSize: 15 }}>
            Nossa IA analisa seu perfil em segundos
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            {PROCESSING_LABELS.map((label, i) => {
              const completed = i < processingStep
              const currentStep = i === processingStep
              return (
                <div
                  key={label}
                  style={{
                    minHeight: 58, display: "flex", alignItems: "center", gap: 15,
                    padding: "13px 18px", borderRadius: 16,
                    backgroundColor: cardBg, border: `1px solid ${cardBorder}`,
                    boxShadow: dark ? "none" : "0 8px 24px rgba(7,27,51,.06)"
                  }}
                >
                  <div
                    style={{
                      width: 26, height: 26, flex: "0 0 26px", borderRadius: "50%",
                      display: "grid", placeItems: "center",
                      backgroundColor: completed ? "#10B981" : currentStep ? (dark ? "#E9F3FC" : "#0B2A4A") : (dark ? "#294864" : "#E2EAF2")
                    }}
                  >
                    {completed ? (
                      <Check size={13} color="#FFFFFF" />
                    ) : currentStep ? (
                      <Loader2 size={13} color={dark ? "#071B33" : "#FFFFFF"} className="animate-spin" />
                    ) : (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dark ? "#91A8BE" : "#8DA1B5" }} />
                    )}
                  </div>
                  <span style={{ color: i <= processingStep ? activeText : futureText, fontSize: 15, fontWeight: 600 }}>
                    {label}
                  </span>
                  {currentStep && <span style={{ marginLeft: "auto", color: subtitleColor, letterSpacing: 3 }}>•••</span>}
                  {completed && <span style={{ marginLeft: "auto", color: "#10B981", fontSize: 12, fontWeight: 700 }}>Concluído</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const current = STEPS[step - 1]

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/")} className="font-display text-lg font-semibold text-brand-600">
          onde eu começo?
        </button>
        <div className="flex-1 max-w-xs ml-auto">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Passo {step} de {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10 animate-fade-in">
            <div className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">
              {step}/{STEPS.length}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-slate-900 mb-2">
              {current.title}
            </h1>
            <p className="text-slate-500">{current.subtitle}</p>
          </div>

          <div className="animate-scale-in">
            {/* Step 1: Objective */}
            {step === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {OBJECTIVES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile((p) => ({ ...p, objetivo: opt.value }))}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 text-sm font-medium transition-all card-lift ${
                      profile.objetivo === opt.value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-center leading-tight">{opt.label}</span>
                    {profile.objetivo === opt.value && (
                      <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Difficulties */}
            {step === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DIFFICULTIES.map((opt) => {
                  const sel = profile.dificuldades?.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleMulti("dificuldades", opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-sm font-medium transition-all card-lift ${
                        sel ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <span className="text-left leading-tight">{opt.label}</span>
                      {sel && <Check size={14} className="text-brand-600 ml-auto flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {SKILLS.map((opt) => {
                  const sel = profile.habilidades?.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleMulti("habilidades", opt.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition-all card-lift ${
                        sel ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-center leading-tight">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 4: Availability */}
            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABILITIES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile((p) => ({ ...p, disponibilidade: opt.value }))}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-sm font-medium transition-all card-lift text-left ${
                      profile.disponibilidade === opt.value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="flex-1">{opt.label}</span>
                    {profile.disponibilidade === opt.value && <Check size={16} className="text-brand-600" />}
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Victory */}
            {step === 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VICTORIES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile((p) => ({ ...p, vitoria: opt.value }))}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-sm font-medium transition-all card-lift text-left ${
                      profile.vitoria === opt.value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="flex-1">{opt.label}</span>
                    {profile.vitoria === opt.value && <Check size={16} className="text-brand-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm"
            >
              <ArrowLeft size={16} />
              {step === 1 ? "Voltar" : "Anterior"}
            </button>
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
            >
              {step === STEPS.length ? "Ver meu resultado" : "Próximo"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
