export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          user_id: string | null
          email: string
          full_name: string
          phone: string | null
          membership_type: string
          status: 'active' | 'inactive' | 'suspended'
          member_number: string
          joined_date: string
          expiry_date: string | null
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          full_name: string
          phone?: string | null
          membership_type?: string
          status?: 'active' | 'inactive' | 'suspended'
          member_number: string
          joined_date?: string
          expiry_date?: string | null
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          full_name?: string
          phone?: string | null
          membership_type?: string
          status?: 'active' | 'inactive' | 'suspended'
          member_number?: string
          joined_date?: string
          expiry_date?: string | null
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      membership_types: {
        Row: {
          id: string
          name: string
          description: string | null
          benefits: Json | null
          price: number | null
          duration_months: number | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          benefits?: Json | null
          price?: number | null
          duration_months?: number | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          benefits?: Json | null
          price?: number | null
          duration_months?: number | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          title: string
          description: string | null
          discount_type: 'percentage' | 'fixed' | 'points'
          discount_value: number
          start_date: string
          end_date: string
          min_usage_count: number
          max_usage_count: number | null
          applicable_membership_types: string[] | null
          is_active: boolean
          terms_conditions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          discount_type: 'percentage' | 'fixed' | 'points'
          discount_value: number
          start_date: string
          end_date: string
          min_usage_count?: number
          max_usage_count?: number | null
          applicable_membership_types?: string[] | null
          is_active?: boolean
          terms_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed' | 'points'
          discount_value?: number
          start_date?: string
          end_date?: string
          min_usage_count?: number
          max_usage_count?: number | null
          applicable_membership_types?: string[] | null
          is_active?: boolean
          terms_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      card_usage: {
        Row: {
          id: string
          member_id: string
          usage_date: string
          location: string | null
          notes: string | null
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          usage_date?: string
          location?: string | null
          notes?: string | null
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          usage_date?: string
          location?: string | null
          notes?: string | null
          points_earned?: number
          created_at?: string
        }
      }
      applied_promotions: {
        Row: {
          id: string
          member_id: string
          promotion_id: string
          card_usage_id: string | null
          applied_date: string
          discount_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          promotion_id: string
          card_usage_id?: string | null
          applied_date?: string
          discount_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          promotion_id?: string
          card_usage_id?: string | null
          applied_date?: string
          discount_amount?: number | null
          created_at?: string
        }
      }
      wallet_passes: {
        Row: {
          id: string
          member_id: string
          pass_type: 'apple' | 'google'
          pass_id: string
          serial_number: string
          pass_data: Json | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          pass_type: 'apple' | 'google'
          pass_id: string
          serial_number: string
          pass_data?: Json | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          pass_type?: 'apple' | 'google'
          pass_id?: string
          serial_number?: string
          pass_data?: Json | null
          last_updated?: string
          created_at?: string
        }
      }
    }
  }
}
