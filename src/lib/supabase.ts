import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      threads: {
        Row: {
          id: string
          parent_id: string | null
          content: string
          user_id: string
          visibility_type: string
          depth: number
          path: string[]
          created_at: string
          updated_at: string
          likes: number
          dislikes: number
          reply_count: number
        }
        Insert: {
          id?: string
          parent_id?: string | null
          content: string
          user_id: string
          visibility_type?: string
          depth?: number
          path?: string[]
          created_at?: string
          updated_at?: string
          likes?: number
          dislikes?: number
          reply_count?: number
        }
        Update: {
          id?: string
          parent_id?: string | null
          content?: string
          user_id?: string
          visibility_type?: string
          depth?: number
          path?: string[]
          created_at?: string
          updated_at?: string
          likes?: number
          dislikes?: number
          reply_count?: number
        }
      }
    }
  }
}

export type Thread = Database['public']['Tables']['threads']['Row']