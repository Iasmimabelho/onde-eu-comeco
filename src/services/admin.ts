import { supabase } from "@/lib/supabase"

export async function getAdminStats() {
  const [usersRes, oppsRes, appsRes, orgsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("opportunities").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
  ])
  return {
    users: usersRes.count ?? 0,
    opportunities: oppsRes.count ?? 0,
    applications: appsRes.count ?? 0,
    organizations: orgsRes.count ?? 0,
  }
}

export async function getAllUsers(search?: string) {
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })
  if (search) query = query.ilike("name", `%${search}%`)
  const { data, error } = await query
  return { data: data ?? [], error }
}

export async function getAllOpportunities() {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*, organizations(*)")
    .order("created_at", { ascending: false })
  return { data: data ?? [], error }
}

export async function getAllApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*, profiles(*), opportunities(title, organizations(name))")
    .order("created_at", { ascending: false })
  return { data: data ?? [], error }
}

export async function getAllOrganizations() {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false })
  return { data: data ?? [], error }
}

export async function setUserRole(userId: string, role: string) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  return { error }
}
