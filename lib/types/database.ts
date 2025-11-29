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
          membership_type: string // @deprecated - use membership_type_id
          membership_type_id: string | null // FK to membership_types.id
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
          membership_type_id?: string | null
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
          membership_type_id?: string | null
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
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          benefits?: Json | null
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          benefits?: Json | null
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          title: string
          description: string | null
          discount_type: 'percentage' | 'fixed' | 'points' | 'perk'
          discount_value: number | null
          start_date: string
          end_date: string
          min_usage_count: number
          max_usage_count: number | null
          applicable_to: string[] | null
          applicable_branches: string[] | null
          is_active: boolean
          terms_conditions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          discount_type: 'percentage' | 'fixed' | 'points' | 'perk'
          discount_value?: number | null
          start_date: string
          end_date: string
          min_usage_count?: number
          max_usage_count?: number | null
          applicable_to?: string[] | null
          applicable_branches?: string[] | null
          is_active?: boolean
          terms_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed' | 'points' | 'perk'
          discount_value?: number | null
          start_date?: string
          end_date?: string
          min_usage_count?: number
          max_usage_count?: number | null
          applicable_to?: string[] | null
          applicable_branches?: string[] | null
          is_active?: boolean
          terms_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      card_usage: {
        Row: {
          id: string
          transaction_id: string | null
          member_id: string
          usage_date: string
          location: string | null
          notes: string | null
          points_earned: number
          amount_spent: number
          event_type: 'purchase' | 'event' | 'visit'
          branch_location: string | null
          branch_id: string | null
          served_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id?: string | null
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
          transaction_id?: string | null
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
          platform: 'apple' | 'google'
          pass_type_identifier: string | null
          serial_number: string
          authentication_token: string | null
          voided: boolean
          created_at: string
          updated_at: string
          last_updated_at: string | null
          push_message: string | null
          push_link: string | null
        }
        Insert: {
          id?: string
          member_id: string
          platform: 'apple' | 'google'
          pass_type_identifier?: string | null
          serial_number: string
          authentication_token?: string | null
          voided?: boolean
          created_at?: string
          updated_at?: string
          last_updated_at?: string | null
          push_message?: string | null
          push_link?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          platform?: 'apple' | 'google'
          pass_type_identifier?: string | null
          serial_number?: string
          authentication_token?: string | null
          voided?: boolean
          created_at?: string
          updated_at?: string
          last_updated_at?: string | null
          push_message?: string | null
          push_link?: string | null
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
      branches: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          phone: string | null
          email: string | null
          manager_name: string | null
          latitude: number | null
          longitude: number | null
          is_active: boolean
          opening_hours: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          manager_name?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          opening_hours?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          manager_name?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          opening_hours?: Json
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          event_date: string
          end_date: string | null
          location: string | null
          branch_id: string | null
          max_attendees: number | null
          points_reward: number
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          image_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          event_date: string
          end_date?: string | null
          location?: string | null
          branch_id?: string | null
          max_attendees?: number | null
          points_reward?: number
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          image_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          event_date?: string
          end_date?: string | null
          location?: string | null
          branch_id?: string | null
          max_attendees?: number | null
          points_reward?: number
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          image_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          member_id: string
          status: 'invited' | 'confirmed' | 'attended' | 'cancelled'
          invited_at: string
          attended_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          event_id: string
          member_id: string
          status?: 'invited' | 'confirmed' | 'attended' | 'cancelled'
          invited_at?: string
          attended_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          member_id?: string
          status?: 'invited' | 'confirmed' | 'attended' | 'cancelled'
          invited_at?: string
          attended_at?: string | null
          notes?: string | null
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
          has_wallet: boolean
          wallet_types: string[] | null
        }
      }
      branch_stats: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          is_active: boolean
          unique_customers: number
          total_transactions: number
          total_purchases: number
          total_visits: number
          total_events: number
          total_revenue: number
          average_purchase: number
          transactions_last_30_days: number
          revenue_last_30_days: number
          last_transaction_date: string | null
        }
      }
      event_stats: {
        Row: {
          id: string
          name: string
          description: string | null
          event_date: string
          end_date: string | null
          location: string | null
          branch_id: string | null
          max_attendees: number | null
          points_reward: number
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          image_url: string | null
          created_at: string
          total_invited: number
          confirmed_count: number
          attended_count: number
          cancelled_count: number
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
