import { supabase } from "@/lib/supabase"
import type { Opportunity, OppCategory, OppModality, OppStatus } from "@/types/database"

export interface OpportunityFilters {
  search?: string
  category?: OppCategory | "all"
  modality?: OppModality | "all"
  location?: string
  isFree?: boolean
  status?: OppStatus
  orgId?: string
}

export async function getOpportunities(filters: OpportunityFilters = {}) {
  let query = supabase
    .from("opportunities")
    .select("*, organizations(*)")
    .order("created_at", { ascending: false })

  if (filters.status) {
    query = query.eq("status", filters.status)
  } else {
    query = query.eq("status", "ativo")
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category)
  }

  if (filters.modality && filters.modality !== "all") {
    query = query.eq("modality", filters.modality)
  }

  if (filters.isFree) {
    query = query.eq("is_free", true)
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`)
  }

  if (filters.orgId) {
    query = query.eq("org_id", filters.orgId)
  }

  const { data, error } = await query
  return { data: (data ?? []) as Opportunity[], error }
}

export async function getOpportunityById(id: string) {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*, organizations(*)")
    .eq("id", id)
    .single()
  return { data: data as Opportunity | null, error }
}

export async function createOpportunity(opp: Omit<Opportunity, "id" | "created_at" | "updated_at" | "organizations">) {
  const { data, error } = await supabase.from("opportunities").insert(opp).select().single()
  return { data, error }
}

export async function updateOpportunity(id: string, updates: Partial<Opportunity>) {
  const { data, error } = await supabase.from("opportunities").update(updates).eq("id", id).select().single()
  return { data, error }
}

export async function deleteOpportunity(id: string) {
  const { error } = await supabase.from("opportunities").delete().eq("id", id)
  return { error }
}
