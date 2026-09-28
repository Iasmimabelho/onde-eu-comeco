import { supabase } from "@/lib/supabase"
import type { Opportunity } from "@/types/database"

export interface AiRecommendation {
  id: string
  compatibilidade: number
  motivo: string
  primeiroPasso: string
}

export interface AiAnalysis {
  resumo: string
  recomendacoes: AiRecommendation[]
  planoDeAcao: string[]
}

export async function analyzeFreeTextSituation(texto: string, opportunities: Opportunity[]) {
  const cleanText = texto.trim()
  if (!cleanText) throw new Error("Conte um pouco sobre sua situação antes de analisar.")

  const compactOpportunities = opportunities.map((opp) => ({
    id: opp.id,
    titulo: opp.title,
    descricao: opp.description,
    tipo: opp.category,
    modalidade: opp.modality,
    localizacao: opp.location ?? opp.organizations?.location ?? "Não informada",
    requisitos: opp.requirements ?? [],
    habilidades: opp.skills_required ?? [],
    objetivos: opp.objectives_match ?? [],
    gratuito: opp.is_free,
    salario: opp.salary,
    prazo: opp.deadline,
    organizacao: opp.organizations?.name ?? "Não informada",
  }))

  const { data, error } = await supabase.functions.invoke("analisar-perfil", {
    body: {
      perfil: {
        textoLivre: cleanText,
        instrucao:
          "Interprete este texto livre identificando objetivo, habilidades, experiência, dificuldades, localização e preferências mencionadas. Não presuma informações que a pessoa não informou.",
      },
      oportunidades: compactOpportunities,
    },
  })

  if (error) throw new Error(error.message || "Não foi possível consultar a IA.")
  if (!data?.success || !data?.analise) {
    throw new Error(data?.error || "A IA não retornou uma análise válida.")
  }

  return data.analise as AiAnalysis
}
