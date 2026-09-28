import { supabase } from "@/lib/supabase"
import type { Organization, OrgType } from "@/types/database"

export async function getOrganizations(type?: OrgType) {
  let query = supabase.from("organizations").select("*").order("name")
  if (type) query = query.eq("type", type)
  const { data, error } = await query
  return { data: (data ?? []) as Organization[], error }
}

export async function getOrganizationById(id: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single()
  return { data: data as Organization | null, error }
}

export async function getOrganizationByUserId(userId: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  return { data: data as Organization | null, error }
}

export async function createOrganization(org: Omit<Organization, "id" | "created_at" | "updated_at" | "verified">) {
  const { data, error } = await supabase.from("organizations").insert(org).select().single()
  return { data, error }
}

export async function updateOrganization(id: string, updates: Partial<Organization>) {
  const { data, error } = await supabase.from("organizations").update(updates).eq("id", id).select().single()
  return { data, error }
}
