import { supabase } from "@/lib/supabase"
import type { Application, ApplicationStatus } from "@/types/database"

export async function applyToOpportunity(userId: string, opportunityId: string) {
  const { data, error } = await supabase
    .from("applications")
    .upsert({ user_id: userId, opportunity_id: opportunityId, status: "interesse" })
    .select()
    .single()
  return { data, error }
}

export async function getUserApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, opportunities(*, organizations(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data: (data ?? []) as Application[], error }
}

export async function getApplicationStatus(userId: string, opportunityId: string) {
  const { data } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle()
  return data?.status as ApplicationStatus | null
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const { error } = await supabase.from("applications").update({ status }).eq("id", id)
  return { error }
}

export async function getOpportunityApplicants(opportunityId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, profiles(*)")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
  return { data: data ?? [], error }
}

// Saved opportunities
export async function saveOpportunity(userId: string, opportunityId: string) {
  const { data, error } = await supabase
    .from("saved_opportunities")
    .upsert({ user_id: userId, opportunity_id: opportunityId })
    .select()
    .single()
  return { data, error }
}

export async function unsaveOpportunity(userId: string, opportunityId: string) {
  const { error } = await supabase
    .from("saved_opportunities")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
  return { error }
}

export async function getSavedOpportunities(userId: string) {
  const { data, error } = await supabase
    .from("saved_opportunities")
    .select("*, opportunities(*, organizations(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data: data ?? [], error }
}

export async function isSaved(userId: string, opportunityId: string): Promise<boolean> {
  const { data } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle()
  return !!data
}
