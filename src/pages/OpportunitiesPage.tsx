import { useState } from "react"
import { Search, Sliders, X } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import OpportunityCard from "@/components/OpportunityCard"
import OpportunityModal from "@/components/OpportunityModal"
import { useOpportunities } from "@/hooks/useOpportunities"
import type { Opportunity, OppCategory, OppModality } from "@/types/database"
import { useAuth } from "@/contexts/AuthContext"
import { getRecommendations } from "@/lib/matching"

const CATEGORIES: { value: OppCategory | "all"; label: string; icon: string }[] = [
  { value: "all", label: "Todas", icon: "✨" },
  { value: "bolsa", label: "Bolsas", icon: "🎓" },
  { value: "emprego", label: "Empregos", icon: "💼" },
  { value: "curso", label: "Cursos", icon: "📚" },
  { value: "programa", label: "Programas", icon: "🤝" },
  { value: "voluntariado", label: "Voluntariado", icon: "💙" },
]

const MODALITIES: { value: OppModality | "all"; label: string }[] = [
  { value: "all", label: "Qualquer modalidade" },
  { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
]

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma oportunidade encontrada</h3>
      <p className="text-slate-500 text-sm max-w-xs">Tente ajustar os filtros ou busque por termos diferentes.</p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Erro ao carregar</h3>
      <p className="text-slate-500 text-sm mb-4">{message}</p>
      <button onClick={onRetry} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold">Tentar novamente</button>
    </div>
  )
}

export default function OpportunitiesPage() {
  const { profile } = useAuth()
  const { data: opportunities, loading, error, filters, setFilters, refetch } = useOpportunities()
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)

  // Compute match scores if user has profile
  const opportunitiesWithScores = opportunities.map((opp) => {
    if (!profile) return { opp, score: undefined, reasons: undefined }
    const result = getRecommendations(profile, [opp as never], 1)
    const match = result[0]
    return { opp, score: match?.score, reasons: match?.reasons }
  }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  // Client-side search filter
  const filtered = opportunitiesWithScores.filter(({ opp }) =>
    !search || opp.title.toLowerCase().includes(search.toLowerCase()) ||
    opp.description.toLowerCase().includes(search.toLowerCase())
  )

  function handleCategoryChange(cat: OppCategory | "all") {
    setFilters({ ...filters, category: cat === "all" ? undefined : cat })
  }

  function handleModalityChange(mod: OppModality | "all") {
    setFilters({ ...filters, modality: mod === "all" ? undefined : mod })
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F]">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-display font-semibold text-slate-900 mb-2">Explorar oportunidades</h1>
          <p className="text-slate-500 mb-6">
            {profile ? "Ordenado por compatibilidade com seu perfil." : "Encontre bolsas, vagas, cursos e programas."}
          </p>

          {/* Search + filter bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "border-brand-500 text-brand-700 bg-brand-50" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              <Sliders size={15} />
              Filtros
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!filters.isFree}
                onChange={(e) => setFilters({ ...filters, isFree: e.target.checked || undefined })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Apenas gratuitos
            </label>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Modalidade</div>
                <div className="flex flex-wrap gap-2">
                  {MODALITIES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleModalityChange(m.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        (filters.modality ?? "all") === m.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  (filters.category ?? "all") === cat.value
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Count */}
          {!loading && !error && (
            <p className="text-sm text-slate-500 mb-5">
              {filtered.length} {filtered.length === 1 ? "oportunidade encontrada" : "oportunidades encontradas"}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 h-48 shimmer" />
              ))
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map(({ opp, score, reasons }) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  matchScore={score}
                  matchReasons={reasons}
                  onOpen={setSelectedOpp}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />

      <OpportunityModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
    </div>
  )
}
