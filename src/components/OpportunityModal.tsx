import { useState, useEffect } from "react"
import { X, MapPin, Clock, Users, Building2, CheckCircle2, ArrowRight, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react"
import type { Opportunity } from "@/types/database"
import { useAuth } from "@/contexts/AuthContext"
import { applyToOpportunity, saveOpportunity, unsaveOpportunity, getApplicationStatus, isSaved as checkSaved } from "@/services/applications"

interface OpportunityModalProps {
  opportunity: Opportunity | null
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  bolsa: "Bolsa de estudos",
  emprego: "Vaga de emprego",
  curso: "Curso",
  programa: "Programa",
  voluntariado: "Voluntariado",
}

export default function OpportunityModal({ opportunity: opp, onClose }: OpportunityModalProps) {
  const { user, navigate } = useAuth()
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!opp || !user) return
    Promise.all([
      checkSaved(user.id, opp.id),
      getApplicationStatus(user.id, opp.id),
    ]).then(([savedStatus, appStatus]) => {
      setSaved(savedStatus)
      setApplied(!!appStatus)
    })
  }, [opp?.id, user?.id])

  if (!opp) return null

  const org = opp.organizations
  const deadline = opp.deadline ? new Date(opp.deadline) : null

  async function handleApply() {
    if (!user) { navigate("/login"); return }
    setApplyLoading(true)
    setError(null)
    const { error: err } = await applyToOpportunity(user.id, opp!.id)
    if (err) setError(err.message)
    else { setApplied(true); setApplySuccess(true) }
    setApplyLoading(false)
  }

  async function handleSave() {
    if (!user) { navigate("/login"); return }
    setSaveLoading(true)
    if (saved) {
      await unsaveOpportunity(user.id, opp!.id)
      setSaved(false)
    } else {
      await saveOpportunity(user.id, opp!.id)
      setSaved(true)
    }
    setSaveLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Image / header band */}
        <div className="h-32 bg-gradient-to-br from-brand-600 to-brand-800 sm:rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute bottom-4 left-6">
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
              {CATEGORY_LABELS[opp.category] ?? opp.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Title + org */}
          <h2 className="text-xl font-bold text-slate-900 mb-1 pr-6">{opp.title}</h2>
          {org && (
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
              <Building2 size={14} />
              <span>{org.name}</span>
              {org.verified && <span className="text-brand-500 text-xs">✓ Verificado</span>}
            </div>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {opp.modality && (
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {opp.modality === "remoto" ? "🌐 Remoto" : opp.modality === "hibrido" ? "🔄 Híbrido" : "📍 Presencial"}
              </span>
            )}
            {opp.location && (
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin size={10} />{opp.location}
              </span>
            )}
            {deadline && (
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock size={10} />Prazo: {deadline.toLocaleDateString("pt-BR")}
              </span>
            )}
            {opp.vacancies && (
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex items-center gap-1">
                <Users size={10} />{opp.vacancies} vagas
              </span>
            )}
            {opp.is_free && (
              <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">Gratuito</span>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Sobre a oportunidade</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{opp.description}</p>
          </div>

          {/* Requirements */}
          {opp.requirements.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Requisitos</h3>
              <ul className="space-y-1.5">
                {opp.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {opp.skills_required.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Habilidades desejadas</h3>
              <div className="flex flex-wrap gap-2">
                {opp.skills_required.map((s) => (
                  <span key={s} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-red-500 mb-4 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

          {/* Success */}
          {applySuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">
                Interesse registrado! Você pode acompanhar pelo dashboard.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saved ? <BookmarkCheck size={16} className="text-brand-600" /> : <Bookmark size={16} />}
              {saved ? "Salvo" : "Salvar"}
            </button>

            {applied ? (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm">
                <CheckCircle2 size={16} />
                Inscrito
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applyLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {applyLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Quero participar</span><ArrowRight size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
