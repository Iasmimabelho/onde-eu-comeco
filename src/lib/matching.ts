import type { Opportunity } from "@/types/database"
import type { UserProfile } from "@/contexts/AuthContext"

export interface MatchResult {
  opportunity: Opportunity
  score: number
  reasons: string[]
  breakdown: {
    objetivo: number
    habilidades: number
    categoria: number
    disponibilidade: number
    localizacao: number
  }
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
}

function normArr(arr: string[]): string[] {
  return (arr ?? []).map(norm)
}

function fuzzyIncludes(haystack: string[], needle: string): boolean {
  const n = norm(needle)
  return haystack.some((h) => h.includes(n) || n.includes(h))
}

function scoreObjetivo(profile: UserProfile, opp: Opportunity): number {
  const obj = norm(profile.objetivo ?? "")
  const cat = opp.category
  const vitoria = norm(profile.vitoria ?? "")
  const objMatch = normArr(opp.objectives_match ?? [])

  if (obj && objMatch.includes(obj)) return 100
  if (obj && fuzzyIncludes(objMatch, obj)) return 95

  const matrix: Record<string, string[]> = {
    estudar:       ["bolsa", "curso"],
    tecnologia:    ["curso", "bolsa", "emprego"],
    carreira:      ["emprego", "programa"],
    trabalho:      ["emprego", "programa"],
    negocio:       ["programa"],
    oportunidades: ["bolsa", "emprego", "curso", "programa", "voluntariado"],
    naosei:        ["bolsa", "emprego", "curso", "programa", "voluntariado"],
  }
  if (obj && (matrix[obj] ?? []).includes(cat)) return 88

  if (vitoria.includes("faculdade") || vitoria.includes("universidade")) {
    if (cat === "bolsa") return 92
  }
  if (vitoria.includes("aprender") || vitoria.includes("curso")) {
    if (cat === "curso" || cat === "bolsa") return 90
  }
  if (vitoria.includes("emprego") || vitoria.includes("trabalh")) {
    if (cat === "emprego" || cat === "programa") return 88
  }
  if (vitoria.includes("negoc") || vitoria.includes("empresa")) {
    if (cat === "programa") return 85
  }

  if (!obj && !vitoria) return 55
  return 45
}

function scoreHabilidades(profile: UserProfile, opp: Opportunity): number {
  const skills = normArr(profile.habilidades ?? [])
  const required = normArr(opp.skills_required ?? [])
  const reqText = norm((opp.requirements ?? []).join(" "))

  if (skills.length === 0 && required.length === 0) return 60
  if (skills.length === 0) return 50
  if (required.length === 0) return 65

  let score = 0
  for (const skill of skills) {
    if (required.some((r) => r.includes(skill) || skill.includes(r))) score += 2
    else if (reqText.includes(skill)) score += 1
  }

  const pct = Math.round((score / (required.length * 2)) * 100)
  return Math.max(40, Math.min(100, pct))
}

function scoreCategoria(profile: UserProfile, opp: Opportunity): number {
  const diffs = normArr(profile.dificuldades ?? [])

  if (diffs.includes("dinheiro") && (opp.category === "bolsa" || opp.category === "curso")) return 100
  if (diffs.includes("dinheiro") && opp.is_free) return 95
  if (diffs.includes("emprego") && opp.category === "emprego") return 100
  if (diffs.includes("estudo") && (opp.category === "bolsa" || opp.category === "curso")) return 95
  if (diffs.includes("tempo") && opp.category === "curso") return 85
  if (diffs.includes("localizacao") && opp.modality === "remoto") return 90

  if (diffs.length === 0) return 60
  return 55
}

function scoreDisponibilidade(profile: UserProfile, opp: Opportunity): number {
  const disp = norm(profile.disponibilidade ?? "")
  if (!disp) return 60

  if (disp === "integral") return 100
  if (opp.modality === "remoto") return 92

  if (disp === "noite") {
    const text = norm((opp.description ?? "") + " " + (opp.requirements ?? []).join(" "))
    if (text.includes("noturno") || text.includes("noite") || text.includes("flexivel")) return 95
    if (text.includes("integral") || text.includes("manha")) return 40
    return 70
  }
  if (disp === "manha" || disp === "tarde") {
    if (opp.modality === "hibrido") return 78
    if (opp.modality === "presencial") return 72
  }
  if (disp === "fds") return opp.modality !== "presencial" ? 70 : 50

  return 60
}

function scoreLocalizacao(profile: UserProfile, opp: Opportunity): number {
  if (opp.modality === "remoto") return 100
  const oppLoc = norm(opp.location ?? "")
  if (!oppLoc || oppLoc === "online") return 100

  const userLoc = norm(profile.localizacao ?? "")
  if (!userLoc) return 65

  const userCity = userLoc.split(",")[0].trim()
  const oppCity = oppLoc.split(",")[0].trim()
  const userState = userLoc.split(",")[1]?.trim() ?? ""
  const oppState = oppLoc.split(",")[1]?.trim() ?? ""

  if (userCity && oppCity && userCity === oppCity) return 100
  if (userCity && oppLoc.includes(userCity)) return 95
  if (
    (userLoc.includes("niteroi") && oppLoc.includes("rio")) ||
    (userLoc.includes("rio") && oppLoc.includes("niteroi"))
  ) return 75
  if (userState && oppState && userState === oppState) return 65

  return 30
}

function buildReasons(profile: UserProfile, opp: Opportunity, bd: MatchResult["breakdown"]): string[] {
  const reasons: string[] = []
  if (bd.objetivo >= 80) reasons.push("Alinhado com seu objetivo principal")
  if (bd.localizacao >= 90) reasons.push(opp.modality === "remoto" ? "100% online, sem deslocamento" : "Próximo da sua localização")
  if (bd.habilidades >= 70) reasons.push("Compatível com suas habilidades")
  if (bd.disponibilidade >= 85) reasons.push("Encaixa na sua disponibilidade")
  if (opp.is_free) reasons.push("Totalmente gratuito")
  if (reasons.length === 0) reasons.push("Pode ser uma boa descoberta para você")
  return reasons.slice(0, 4)
}

const W = { objetivo: 0.30, habilidades: 0.30, categoria: 0.15, disponibilidade: 0.15, localizacao: 0.10 }

export function calculateMatch(profile: UserProfile, opp: Opportunity): MatchResult {
  const bd = {
    objetivo:        scoreObjetivo(profile, opp),
    habilidades:     scoreHabilidades(profile, opp),
    categoria:       scoreCategoria(profile, opp),
    disponibilidade: scoreDisponibilidade(profile, opp),
    localizacao:     scoreLocalizacao(profile, opp),
  }

  const raw =
    bd.objetivo      * W.objetivo +
    bd.habilidades   * W.habilidades +
    bd.categoria     * W.categoria +
    bd.disponibilidade * W.disponibilidade +
    bd.localizacao   * W.localizacao

  return {
    opportunity: opp,
    score: Math.round(Math.min(98, Math.max(30, raw))),
    reasons: buildReasons(profile, opp, bd),
    breakdown: bd,
  }
}

export function getRecommendations(
  profile: UserProfile | null,
  opportunities: Opportunity[],
  limit = 8,
): MatchResult[] {
  if (opportunities.length === 0) return []
  const effectiveProfile: UserProfile = profile ?? {}
  return opportunities
    .map((opp) => calculateMatch(effectiveProfile, opp))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981"
  if (score >= 65) return "#6366F1"
  if (score >= 50) return "#F59E0B"
  return "#94A3B8"
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Alta compatibilidade"
  if (score >= 65) return "Boa compatibilidade"
  if (score >= 50) return "Compatível"
  return "Oportunidade próxima"
}
