import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string
  bio?: string
  college?: string
  github_url?: string
  instagram_url?: string
  avatar_url?: string
  created_at: string
}

export type Project = {
  id: string
  user_id: string
  name: string
  category: string
  description: string
  deployed_url: string
  created_at: string
  username?: string
  profiles?: Profile
  comments?: Comment[]
}

export type Comment = {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  username?: string
  profiles?: Profile
}
