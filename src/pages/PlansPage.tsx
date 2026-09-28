import { useState } from "react"
import { Check, ArrowRight, Zap, Building2, GraduationCap } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { PLANS } from "@/data/mockData"

function PlanCard({ plan, onSelect }: { plan: typeof PLANS[0]; onSelect: () => void }) {
  return (
    <div
      className={`relative bg-white rounded-3xl p-7 border-2 shadow-sm card-lift flex flex-col ${
        plan.highlight ? "border-brand-500 shadow-brand-100" : "border-slate-100"
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-600 text-white text-xs font-bold">
          Mais popular
        </div>
      )}
      <div className="mb-6">
        <div className="font-display font-semibold text-slate-900 text-lg mb-1">{plan.name}</div>
        <div className="flex items-baseline gap-1">
          {plan.price === 0 ? (
            <span className="text-3xl font-bold text-slate-900">Sob consulta</span>
          ) : (
            <>
              <span className="text-slate-400 text-sm">R$</span>
              <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-slate-400 text-sm">/mês</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
            <Check size={15} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-brand-600" : "text-emerald-500"}`} />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          plan.highlight
            ? "bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            : "border-2 border-slate-200 hover:border-brand-400 text-slate-700 hover:text-brand-700"
        }`}
      >
        {plan.cta}
      </button>
    </div>
  )
}

export default function PlansPage() {
  const { navigate } = useAuth()
  const [activeTab, setActiveTab] = useState<"companies" | "institutions">("companies")

  const companyPlans = PLANS.filter((p) => p.target === "company")
  const institutionPlans = PLANS.filter((p) => p.target === "institution")
  const currentPlans = activeTab === "companies" ? companyPlans : institutionPlans

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F]">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-16 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">Planos e preços</div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-slate-900 mb-4">
            Invista no que realmente importa
          </h1>
          <p className="text-slate-500 text-lg mb-10">
            Pessoas que buscam oportunidades usam a plataforma gratuitamente.
            Empresas e instituições têm planos para publicar e gerenciar suas oportunidades.
          </p>

          {/* Tab toggle */}
          <div className="inline-flex bg-slate-100 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "companies" ? "bg-white shadow-sm text-brand-700" : "text-slate-600"
              }`}
            >
              <Building2 size={16} />
              Para Empresas
            </button>
            <button
              onClick={() => setActiveTab("institutions")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "institutions" ? "bg-white shadow-sm text-brand-700" : "text-slate-600"
              }`}
            >
              <GraduationCap size={16} />
              Para Instituições
            </button>
          </div>
        </div>
      </section>

      {/* Free user plan */}
      <section className="py-12 bg-gradient-to-r from-brand-50 to-indigo-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-brand-100 p-7 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Zap size={22} className="text-brand-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-display font-semibold text-slate-900 text-lg mb-1">Para quem busca oportunidades</div>
              <div className="text-4xl font-bold text-brand-700 mb-1">Gratuito · R$ 0</div>
              <p className="text-slate-500 text-sm">
                Cadastro, perfil, onboarding, matching, recomendações, mapa, caminho personalizado e acompanhamento de inscrições — tudo sem custo.
              </p>
            </div>
            <button
              onClick={() => navigate("/cadastro")}
              className="flex-shrink-0 group flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all"
            >
              Começar grátis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={() => navigate("/cadastro")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / trust */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-display font-semibold text-slate-900 text-center mb-10">
            Perguntas frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: "O matching é pago?", a: "Não. O matching e as recomendações são gratuitos para todos os usuários que buscam oportunidades." },
              { q: "O pagamento altera o match score?", a: "Nunca. O score é calculado exclusivamente com base na compatibilidade real entre perfil e oportunidade." },
              { q: "Posso cancelar quando quiser?", a: "Sim. Os planos são mensais e podem ser cancelados a qualquer momento sem multa." },
              { q: "Como funciona o destaque de oportunidade?", a: "O destaque aumenta a visibilidade em seções específicas da plataforma, mas não altera o score de compatibilidade." },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="font-semibold text-slate-900 mb-2">{item.q}</div>
                <div className="text-slate-500 text-sm leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
