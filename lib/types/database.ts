export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          status: 'active' | 'inactive'
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
          status?: 'active' | 'inactive'
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
          status?: 'active' | 'inactive'
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
          amount_spent: number
          event_type: 'purchase' | 'event' | 'visit'
          branch_location: string | null
          served_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          usage_date?: string
          location?: string | null
          notes?: string | null
          points_earned?: number
          amount_spent?: number
          event_type?: 'purchase' | 'event' | 'visit'
          branch_location?: string | null
          served_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          usage_date?: string
          location?: string | null
          notes?: string | null
          points_earned?: number
          amount_spent?: number
          event_type?: 'purchase' | 'event' | 'visit'
          branch_location?: string | null
          served_by?: string | null
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
      user_roles: {
        Row: {
          user_id: string
          role: 'admin' | 'branch' | 'readonly'
          branch_name: string | null
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role?: 'admin' | 'branch' | 'readonly'
          branch_name?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          role?: 'admin' | 'branch' | 'readonly'
          branch_name?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      special_invitations: {
        Row: {
          id: string
          member_id: string
          event_name: string
          event_date: string
          description: string | null
          status: 'sent' | 'accepted' | 'declined' | 'attended'
          invitation_data: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          event_name: string
          event_date: string
          description?: string | null
          status?: 'sent' | 'accepted' | 'declined' | 'attended'
          invitation_data?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          event_name?: string
          event_date?: string
          description?: string | null
          status?: 'sent' | 'accepted' | 'declined' | 'attended'
          invitation_data?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      member_segments: {
        Row: {
          id: string
          name: string
          description: string | null
          filters: Json
          member_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          filters: Json
          member_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          filters?: Json
          member_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      member_assigned_promotions: {
        Row: {
          id: string
          member_id: string
          promotion_id: string
          assigned_by: string | null
          auto_apply: boolean
          status: 'pending' | 'used' | 'expired'
          assigned_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          promotion_id: string
          assigned_by?: string | null
          auto_apply?: boolean
          status?: 'pending' | 'used' | 'expired'
          assigned_at?: string
          used_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          promotion_id?: string
          assigned_by?: string | null
          auto_apply?: boolean
          status?: 'pending' | 'used' | 'expired'
          assigned_at?: string
          used_at?: string | null
        }
      }
      tier_history: {
        Row: {
          id: string
          member_id: string
          old_tier: string
          new_tier: string
          reason: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          member_id: string
          old_tier: string
          new_tier: string
          reason?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          old_tier?: string
          new_tier?: string
          reason?: string | null
          changed_at?: string
        }
      }
    }
    Views: {
      member_stats: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          membership_type: string
          status: 'active' | 'inactive'
          member_number: string
          joined_date: string
          points: number
          total_visits: number
          total_purchases: number
          total_events: number
          lifetime_spent: number
          visits_last_30_days: number
          spent_last_30_days: number
          visits_last_90_days: number
          spent_last_90_days: number
          last_visit: string | null
          average_purchase: number
          promotions_used: number
        }
      }
    }
    Functions: {
      calculate_member_tier: {
        Args: { p_member_id: string }
        Returns: string
      }
    }
  }
}
