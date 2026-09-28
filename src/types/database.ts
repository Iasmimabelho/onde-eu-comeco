export type UserRole = "user" | "organization" | "admin"
export type OrgType = "empresa" | "instituicao"
export type OppCategory = "bolsa" | "emprego" | "curso" | "programa" | "voluntariado"
export type OppModality = "presencial" | "remoto" | "hibrido"
export type OppStatus = "ativo" | "pausado" | "encerrado"
export type ApplicationStatus = "interesse" | "inscrito" | "em_analise" | "aprovado" | "recusado"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at">
        Update: Partial<Omit<Profile, "id" | "created_at">>
      }
      user_onboarding: {
        Row: UserOnboarding
        Insert: Omit<UserOnboarding, "created_at" | "updated_at">
        Update: Partial<Omit<UserOnboarding, "id" | "user_id" | "created_at">>
      }
      organizations: {
        Row: Organization
        Insert: Omit<Organization, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Organization, "id" | "user_id" | "created_at">>
      }
      opportunities: {
        Row: Opportunity
        Insert: Omit<Opportunity, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Opportunity, "id" | "created_at">>
      }
      applications: {
        Row: Application
        Insert: Omit<Application, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Application, "id" | "user_id" | "opportunity_id" | "created_at">>
      }
      saved_opportunities: {
        Row: SavedOpportunity
        Insert: Omit<SavedOpportunity, "id" | "created_at">
        Update: never
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, "id" | "created_at">
        Update: Partial<Pick<Notification, "read">>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  location: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  birth_date: string | null
  onboarding_completed: boolean
  progress: number
  created_at: string
  updated_at: string
}

export interface UserOnboarding {
  id: string
  user_id: string
  objective: string | null
  difficulties: string[]
  skills: string[]
  availability: string | null
  victory_goal: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  user_id: string
  name: string
  type: OrgType
  description: string | null
  logo_url: string | null
  website: string | null
  location: string | null
  category: string | null
  employees_count: string | null
  founded_year: number | null
  plan: "gratuito" | "profissional" | "empresarial"
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  org_id: string
  title: string
  description: string
  category: OppCategory
  modality: OppModality
  location: string | null
  requirements: string[]
  skills_required: string[]
  objectives_match: string[]
  deadline: string | null
  vacancies: number | null
  status: OppStatus
  image_url: string | null
  is_free: boolean
  salary: string | null
  created_at: string
  updated_at: string
  // joined
  organizations?: Organization
}

export interface Application {
  id: string
  user_id: string
  opportunity_id: string
  status: ApplicationStatus
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  opportunities?: Opportunity
}

export interface SavedOpportunity {
  id: string
  user_id: string
  opportunity_id: string
  created_at: string
  // joined
  opportunities?: Opportunity
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning"
  read: boolean
  link: string | null
  created_at: string
}
