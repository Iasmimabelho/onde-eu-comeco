import { useState } from "react"
import { MapPin, Clock, Bookmark, BookmarkCheck, Users, ArrowRight } from "lucide-react"
import type { Opportunity } from "@/types/database"
import { useAuth } from "@/contexts/AuthContext"
import { applyToOpportunity, saveOpportunity, unsaveOpportunity } from "@/services/applications"

interface OpportunityCardProps {
  opportunity: Opportunity
  matchScore?: number
  matchReasons?: string[]
  isSavedInitial?: boolean
  isAppliedInitial?: boolean
  onOpen?: (opp: Opportunity) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  bolsa: "bg-purple-100 text-purple-700",
  emprego: "bg-amber-100 text-amber-700",
  curso: "bg-blue-100 text-blue-700",
  programa: "bg-emerald-100 text-emerald-700",
  voluntariado: "bg-rose-100 text-rose-700",
}

const CATEGORY_LABELS: Record<string, string> = {
  bolsa: "Bolsa",
  emprego: "Emprego",
  curso: "Curso",
  programa: "Programa",
  voluntariado: "Voluntariado",
}

export default function OpportunityCard({
  opportunity: opp,
  matchScore,
  matchReasons,
  isSavedInitial = false,
  isAppliedInitial = false,
  onOpen,
}: OpportunityCardProps) {
  const { user, navigate } = useAuth()
  const [saved, setSaved] = useState(isSavedInitial)
  const [applied, setApplied] = useState(isAppliedInitial)
  const [savingLoading, setSavingLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (!user) { navigate("/login"); return }
    setSavingLoading(true)
    if (saved) {
      await unsaveOpportunity(user.id, opp.id)
      setSaved(false)
    } else {
      await saveOpportunity(user.id, opp.id)
      setSaved(true)
    }
    setSavingLoading(false)
  }

  async function handleApply(e: React.MouseEvent) {
    e.stopPropagation()
    if (!user) { navigate("/login"); return }
    setApplyLoading(true)
    setApplyError(null)
    const { error } = await applyToOpportunity(user.id, opp.id)
    if (error) setApplyError(error.message)
    else setApplied(true)
    setApplyLoading(false)
  }

  const org = opp.organizations
  const deadline = opp.deadline ? new Date(opp.deadline) : null
  const isExpired = deadline ? deadline < new Date() : false

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden card-lift"
      onClick={() => onOpen ? onOpen(opp) : navigate(`/oportunidades`)}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[opp.category] ?? "bg-slate-100 text-slate-600"}`}>
                {CATEGORY_LABELS[opp.category] ?? opp.category}
              </span>
              <span className="text-xs text-slate-400">{opp.modality === "remoto" ? "🌐 Remoto" : opp.modality === "hibrido" ? "🔄 Híbrido" : "📍 Presencial"}</span>
              {opp.is_free && <span className="text-xs font-semibold text-emerald-600">Gratuito</span>}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
              {opp.title}
            </h3>
          </div>
          {matchScore != null && (
            <div className="flex-shrink-0 text-center">
              <div className="text-lg font-bold text-brand-600">{matchScore}%</div>
              <div className="text-[10px] text-slate-400">match</div>
            </div>
          )}
        </div>

        {org && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {org.name.charAt(0)}
            </div>
            <span className="truncate">{org.name}</span>
            {org.verified && <span className="text-brand-500">✓</span>}
          </div>
        )}

        {opp.location && (
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <MapPin size={11} />
            <span>{opp.location}</span>
          </div>
        )}
      </div>

      {/* Match reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {matchReasons.slice(0, 2).map((r) => (
            <span key={r} className="text-[11px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">✓ {r}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {deadline && (
            <span className={`flex items-center gap-1 ${isExpired ? "text-red-400" : ""}`}>
              <Clock size={11} />
              {isExpired ? "Encerrado" : deadline.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}
          {opp.vacancies && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {opp.vacancies} vagas
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            disabled={savingLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
            title={saved ? "Remover dos salvos" : "Salvar"}
          >
            {saved ? <BookmarkCheck size={15} className="text-brand-600" /> : <Bookmark size={15} />}
          </button>

          {applied ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              ✓ Inscrito
            </span>
          ) : (
            <button
              onClick={handleApply}
              disabled={applyLoading}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 transition-colors"
            >
              {applyLoading ? "..." : <><span>Tenho interesse</span><ArrowRight size={11} /></>}
            </button>
          )}
        </div>
      </div>

      {applyError && (
        <div className="px-5 pb-3 text-xs text-red-500">{applyError}</div>
      )}
    </div>
  )
}
