 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      addon_catalog: {
        Row: {
          addon_type: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          price_annual: number | null
          price_monthly: number | null
          updated_at: string | null
          usage_unit: string | null
        }
        Insert: {
          addon_type: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          price_annual?: number | null
          price_monthly?: number | null
          updated_at?: string | null
          usage_unit?: string | null
        }
        Update: {
          addon_type?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price_annual?: number | null
          price_monthly?: number | null
          updated_at?: string | null
          usage_unit?: string | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_type: string
          company_id: string
          created_at: string | null
          endpoint: string | null
          id: string
          request_data: Json | null
          response_data: Json | null
          response_status: number | null
          usage_recorded: boolean | null
          user_id: string | null
        }
        Insert: {
          api_type: string
          company_id: string
          created_at?: string | null
          endpoint?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_status?: number | null
          usage_recorded?: boolean | null
          user_id?: string | null
        }
        Update: {
          api_type?: string
          company_id?: string
          created_at?: string | null
          endpoint?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_status?: number | null
          usage_recorded?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          changes: Json | null
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          changes?: Json | null
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          changes?: Json | null
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          status: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          status?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_tags: {
        Row: {
          booking_id: string
          tag_id: string
        }
        Insert: {
          booking_id: string
          tag_id: string
        }
        Update: {
          booking_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_tags_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          approval_limit: number | null
          assigned_mechanic_id: string | null
          booking_date: string
          booking_number: string | null
          branch_id: string | null
          company_id: string
          courtesy_vehicle_required: boolean | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          description: string | null
          estimated_finish_time: string | null
          id: string
          is_wof_booking: boolean | null
          notes: string | null
          pickup_time: string | null
          service_type: string | null
          source_of_business: string | null
          start_time: string
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
          wof_booking_type: string | null
        }
        Insert: {
          approval_limit?: number | null
          assigned_mechanic_id?: string | null
          booking_date: string
          booking_number?: string | null
          branch_id?: string | null
          company_id: string
          courtesy_vehicle_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          estimated_finish_time?: string | null
          id?: string
          is_wof_booking?: boolean | null
          notes?: string | null
          pickup_time?: string | null
          service_type?: string | null
          source_of_business?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          wof_booking_type?: string | null
        }
        Update: {
          approval_limit?: number | null
          assigned_mechanic_id?: string | null
          booking_date?: string
          booking_number?: string | null
          branch_id?: string | null
          company_id?: string
          courtesy_vehicle_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          estimated_finish_time?: string | null
          id?: string
          is_wof_booking?: boolean | null
          notes?: string | null
          pickup_time?: string | null
          service_type?: string | null
          source_of_business?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          wof_booking_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_mechanic_id_fkey"
            columns: ["assigned_mechanic_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          phone: string | null
          postal_code: string | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name: string
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          body: string
          channel: string
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          body: string
          channel: string
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          channel?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          body: string | null
          channel: string
          communication_type: string
          company_id: string
          created_at: string | null
          created_by: string | null
          delivered_at: string | null
          entity_id: string
          entity_type: string
          error_message: string | null
          failed_at: string | null
          id: string
          is_internal: boolean | null
          recipient: string
          sender: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          channel: string
          communication_type: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          entity_id: string
          entity_type: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          is_internal?: boolean | null
          recipient: string
          sender?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          communication_type?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          is_internal?: boolean | null
          recipient?: string
          sender?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          business_number: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          region: string | null
          timezone: string | null
          trading_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          timezone?: string | null
          trading_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          timezone?: string | null
          trading_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_addons: {
        Row: {
          addon_id: string
          company_id: string
          created_at: string | null
          disabled_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
        }
        Insert: {
          addon_id: string
          company_id: string
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
        }
        Update: {
          addon_id?: string
          company_id?: string
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "company_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addon_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_addons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean | null
          company_id: string
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          company_id: string
          created_at?: string | null
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          company_id?: string
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      courtesy_vehicle_assignments: {
        Row: {
          assigned_at: string | null
          courtesy_vehicle_id: string
          id: string
          job_id: string
          returned_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          courtesy_vehicle_id: string
          id?: string
          job_id: string
          returned_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          courtesy_vehicle_id?: string
          id?: string
          job_id?: string
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courtesy_vehicle_assignments_courtesy_vehicle_id_fkey"
            columns: ["courtesy_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtesy_vehicle_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          credit_note_number: string | null
          customer_id: string | null
          id: string
          invoice_id: string | null
          issue_date: string
          notes: string | null
          reason: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          credit_note_number?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          issue_date?: string
          notes?: string | null
          reason?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          credit_note_number?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          issue_date?: string
          notes?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address: string | null
          address_type: string | null
          city: string | null
          country: string | null
          created_at: string | null
          customer_id: string
          id: string
          is_default: boolean | null
          postal_code: string | null
          region: string | null
        }
        Insert: {
          address?: string | null
          address_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          is_default?: boolean | null
          postal_code?: string | null
          region?: string | null
        }
        Update: {
          address?: string | null
          address_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          is_default?: boolean | null
          postal_code?: string | null
          region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string | null
          customer_id: string
          email: string | null
          id: string
          is_primary: boolean | null
          mobile: string | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          mobile?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          mobile?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          note: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          note: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          customer_id: string
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          customer_id: string
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          customer_id?: string
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          customer_id: string
          tag_id: string
        }
        Insert: {
          customer_id: string
          tag_id: string
        }
        Update: {
          customer_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tags_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_number: string | null
          deleted_at: string | null
          email: string | null
          fleet_billing_contact: string | null
          id: string
          is_company: boolean | null
          is_fleet_account: boolean | null
          marketing_consent: boolean | null
          mobile: string | null
          name: string
          notes: string | null
          phone: string | null
          physical_address: string | null
          physical_city: string | null
          physical_postal_code: string | null
          postal_address: string | null
          postal_city: string | null
          postal_postal_code: string | null
          source_of_business: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_number?: string | null
          deleted_at?: string | null
          email?: string | null
          fleet_billing_contact?: string | null
          id?: string
          is_company?: boolean | null
          is_fleet_account?: boolean | null
          marketing_consent?: boolean | null
          mobile?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          physical_address?: string | null
          physical_city?: string | null
          physical_postal_code?: string | null
          postal_address?: string | null
          postal_city?: string | null
          postal_postal_code?: string | null
          source_of_business?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_number?: string | null
          deleted_at?: string | null
          email?: string | null
          fleet_billing_contact?: string | null
          id?: string
          is_company?: boolean | null
          is_fleet_account?: boolean | null
          marketing_consent?: boolean | null
          mobile?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          physical_address?: string | null
          physical_city?: string | null
          physical_postal_code?: string | null
          postal_address?: string | null
          postal_city?: string | null
          postal_postal_code?: string | null
          source_of_business?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          company_id: string
          created_at: string | null
          discount_amount: number
          discount_type: string
          discount_value: number
          entity_id: string
          entity_type: string
          id: string
          reason: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          company_id: string
          created_at?: string | null
          discount_amount: number
          discount_type: string
          discount_value: number
          entity_id: string
          entity_type: string
          id?: string
          reason?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          company_id?: string
          created_at?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_history: {
        Row: {
          action: string
          company_id: string
          created_at: string | null
          created_by: string | null
          document_type: string
          entity_id: string
          entity_type: string
          file_url: string | null
          id: string
          recipient: string | null
          sent_at: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          document_type: string
          entity_id: string
          entity_type: string
          file_url?: string | null
          id?: string
          recipient?: string | null
          sent_at?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          entity_id?: string
          entity_type?: string
          file_url?: string | null
          id?: string
          recipient?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          company_id: string
          content: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_calibrations: {
        Row: {
          calibrated_by: string | null
          calibration_date: string
          certification_number: string | null
          created_at: string | null
          document_url: string | null
          equipment_id: string
          id: string
          next_calibration_due: string
          notes: string | null
        }
        Insert: {
          calibrated_by?: string | null
          calibration_date: string
          certification_number?: string | null
          created_at?: string | null
          document_url?: string | null
          equipment_id: string
          id?: string
          next_calibration_due: string
          notes?: string | null
        }
        Update: {
          calibrated_by?: string | null
          calibration_date?: string
          certification_number?: string | null
          created_at?: string | null
          document_url?: string | null
          equipment_id?: string
          id?: string
          next_calibration_due?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_calibrations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "inspection_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_entitlements: {
        Row: {
          company_id: string
          created_at: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          quota_limit: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          quota_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          quota_limit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_entitlements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      import_history: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          errors: Json | null
          failed_rows: number | null
          field_mapping: Json | null
          file_name: string | null
          file_url: string | null
          id: string
          import_type: string
          status: string | null
          success_rows: number | null
          total_rows: number | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          errors?: Json | null
          failed_rows?: number | null
          field_mapping?: Json | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          import_type: string
          status?: string | null
          success_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          errors?: Json | null
          failed_rows?: number | null
          field_mapping?: Json | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          import_type?: string
          status?: string | null
          success_rows?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_equipment: {
        Row: {
          branch_id: string | null
          company_id: string
          created_at: string | null
          equipment_name: string
          equipment_type: string
          id: string
          is_active: boolean | null
          manufacturer: string | null
          model: string | null
          purchase_date: string | null
          serial_number: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          equipment_name: string
          equipment_type: string
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          model?: string | null
          purchase_date?: string | null
          serial_number?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          equipment_name?: string
          equipment_type?: string
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          model?: string | null
          purchase_date?: string | null
          serial_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_equipment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inspector_certifications: {
        Row: {
          certification_body: string | null
          certification_number: string
          company_id: string
          created_at: string | null
          document_url: string | null
          expiry_date: string
          id: string
          is_active: boolean | null
          issue_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certification_body?: string | null
          certification_number: string
          company_id: string
          created_at?: string | null
          document_url?: string | null
          expiry_date: string
          id?: string
          is_active?: boolean | null
          issue_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certification_body?: string | null
          certification_number?: string
          company_id?: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          issue_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspector_certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspector_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          created_at: string | null
          credential_type: string
          credential_value: string
          expires_at: string | null
          id: string
          integration_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credential_type: string
          credential_value: string
          expires_at?: string | null
          id?: string
          integration_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credential_type?: string
          credential_value?: string
          expires_at?: string | null
          id?: string
          integration_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          company_id: string
          config: Json | null
          created_at: string | null
          disabled_at: string | null
          enabled_at: string | null
          id: string
          integration_type: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          config?: Json | null
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          integration_type: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          config?: Json | null
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          integration_type?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          company_id: string
          cost_price: number | null
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          part_number: string | null
          reorder_level: number | null
          sell_price: number | null
          supplier_id: string | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          cost_price?: number | null
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          part_number?: string | null
          reorder_level?: number | null
          sell_price?: number | null
          supplier_id?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          cost_price?: number | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          part_number?: string | null
          reorder_level?: number | null
          sell_price?: number | null
          supplier_id?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          branch_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          inventory_item_id: string
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          inventory_item_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          inventory_item_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock_levels: {
        Row: {
          branch_id: string
          id: string
          inventory_item_id: string
          quantity_available: number | null
          quantity_on_hand: number | null
          quantity_reserved: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          id?: string
          inventory_item_id: string
          quantity_available?: number | null
          quantity_on_hand?: number | null
          quantity_reserved?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          id?: string
          inventory_item_id?: string
          quantity_available?: number | null
          quantity_on_hand?: number | null
          quantity_reserved?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_levels_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_levels_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          invoice_id: string
          line_total: number | null
          line_type: string
          notes: string | null
          quantity: number | null
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id: string
          line_total?: number | null
          line_type: string
          notes?: string | null
          quantity?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          line_total?: number | null
          line_type?: string
          notes?: string | null
          quantity?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_tags: {
        Row: {
          invoice_id: string
          tag_id: string
        }
        Insert: {
          invoice_id: string
          tag_id: string
        }
        Update: {
          invoice_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_tags_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance: number | null
          branch_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          invoice_to_third_party: boolean | null
          job_id: string | null
          notes: string | null
          quote_id: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          third_party_billing_address: string | null
          third_party_name: string | null
          total_amount: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance?: number | null
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          invoice_to_third_party?: boolean | null
          job_id?: string | null
          notes?: string | null
          quote_id?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          third_party_billing_address?: string | null
          third_party_name?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance?: number | null
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          invoice_to_third_party?: boolean | null
          job_id?: string | null
          notes?: string | null
          quote_id?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          third_party_billing_address?: string | null
          third_party_name?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_approvals: {
        Row: {
          amount: number | null
          approval_type: string
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string | null
          id: string
          job_id: string
          notes: string | null
          rejected_at: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          approval_type: string
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          job_id: string
          notes?: string | null
          rejected_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          approval_type?: string
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          rejected_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_approvals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_attachments: {
        Row: {
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          job_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          job_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          job_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_checklists: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          item_text: string
          job_id: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          item_text: string
          job_id: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          item_text?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklists_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_job_types: {
        Row: {
          job_id: string
          job_type_id: string
        }
        Insert: {
          job_id: string
          job_type_id: string
        }
        Update: {
          job_id?: string
          job_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_job_types_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_job_types_job_type_id_fkey"
            columns: ["job_type_id"]
            isOneToOne: false
            referencedRelation: "job_types"
            referencedColumns: ["id"]
          },
        ]
      }
      job_line_items: {
        Row: {
          created_at: string | null
          description: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          job_id: string
          line_total: number | null
          line_type: string
          notes: string | null
          quantity: number | null
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          job_id: string
          line_total?: number | null
          line_type: string
          notes?: string | null
          quantity?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          job_id?: string
          line_total?: number | null
          line_type?: string
          notes?: string | null
          quantity?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_line_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_mechanics: {
        Row: {
          assigned_at: string | null
          job_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          job_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_mechanics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_mechanics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          from_status: string | null
          id: string
          job_id: string
          notes: string | null
          to_status: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          from_status?: string | null
          id?: string
          job_id: string
          notes?: string | null
          to_status: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          from_status?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_status_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tags: {
        Row: {
          job_id: string
          tag_id: string
        }
        Insert: {
          job_id: string
          tag_id: string
        }
        Update: {
          job_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tags_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      job_timers: {
        Row: {
          company_id: string
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          job_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          job_id: string
          start_time: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          job_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_timers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_timers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_timers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_types: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string | null
          branch_id: string | null
          company_id: string
          courtesy_vehicle_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_notes: string | null
          customer_visible_notes: string | null
          deleted_at: string | null
          description: string | null
          email_sent: boolean | null
          estimated_finish_time: string | null
          estimated_work_hours: number | null
          finished_at: string | null
          finished_odometer: number | null
          follow_up: string | null
          id: string
          internal_notes: string | null
          invoice_to_third_party: boolean | null
          job_number: string | null
          job_title: string
          next_service_date: string | null
          next_service_kms: number | null
          next_service_note: string | null
          notes: string | null
          odometer: number | null
          order_number: string | null
          parts_eta: string | null
          pickup_time: string | null
          priority: string | null
          qc_completed_at: string | null
          qc_completed_by: string | null
          signed_off_at: string | null
          signed_off_by: string | null
          sms_sent: boolean | null
          source_of_business: string | null
          start_time: string | null
          status: string | null
          third_party_billing_address: string | null
          third_party_contact: string | null
          third_party_name: string | null
          updated_at: string | null
          vehicle_id: string | null
          wheel_alignment_due: string | null
          wof_due_date: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          branch_id?: string | null
          company_id: string
          courtesy_vehicle_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          customer_visible_notes?: string | null
          deleted_at?: string | null
          description?: string | null
          email_sent?: boolean | null
          estimated_finish_time?: string | null
          estimated_work_hours?: number | null
          finished_at?: string | null
          finished_odometer?: number | null
          follow_up?: string | null
          id?: string
          internal_notes?: string | null
          invoice_to_third_party?: boolean | null
          job_number?: string | null
          job_title: string
          next_service_date?: string | null
          next_service_kms?: number | null
          next_service_note?: string | null
          notes?: string | null
          odometer?: number | null
          order_number?: string | null
          parts_eta?: string | null
          pickup_time?: string | null
          priority?: string | null
          qc_completed_at?: string | null
          qc_completed_by?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          sms_sent?: boolean | null
          source_of_business?: string | null
          start_time?: string | null
          status?: string | null
          third_party_billing_address?: string | null
          third_party_contact?: string | null
          third_party_name?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          wheel_alignment_due?: string | null
          wof_due_date?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          branch_id?: string | null
          company_id?: string
          courtesy_vehicle_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          customer_visible_notes?: string | null
          deleted_at?: string | null
          description?: string | null
          email_sent?: boolean | null
          estimated_finish_time?: string | null
          estimated_work_hours?: number | null
          finished_at?: string | null
          finished_odometer?: number | null
          follow_up?: string | null
          id?: string
          internal_notes?: string | null
          invoice_to_third_party?: boolean | null
          job_number?: string | null
          job_title?: string
          next_service_date?: string | null
          next_service_kms?: number | null
          next_service_note?: string | null
          notes?: string | null
          odometer?: number | null
          order_number?: string | null
          parts_eta?: string | null
          pickup_time?: string | null
          priority?: string | null
          qc_completed_at?: string | null
          qc_completed_by?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          sms_sent?: boolean | null
          source_of_business?: string | null
          start_time?: string | null
          status?: string | null
          third_party_billing_address?: string | null
          third_party_contact?: string | null
          third_party_name?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          wheel_alignment_due?: string | null
          wof_due_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_courtesy_vehicle_id_fkey"
            columns: ["courtesy_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_qc_completed_by_fkey"
            columns: ["qc_completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_signed_off_by_fkey"
            columns: ["signed_off_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          account_number: string | null
          company_id: string
          created_at: string | null
          customer_id: string
          id: string
          is_active: boolean | null
          lifetime_points: number | null
          points_balance: number | null
          tier_level: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          company_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          is_active?: boolean | null
          lifetime_points?: number | null
          points_balance?: number | null
          tier_level?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          company_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          is_active?: boolean | null
          lifetime_points?: number | null
          points_balance?: number | null
          tier_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          loyalty_account_id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          loyalty_account_id: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          loyalty_account_id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          campaign_name: string
          campaign_type: string | null
          clicked_count: number | null
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          message_template: string | null
          opened_count: number | null
          recipients_count: number | null
          scheduled_send_at: string | null
          send_via: string[] | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          target_audience_filter: Json | null
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          campaign_type?: string | null
          clicked_count?: number | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_template?: string | null
          opened_count?: number | null
          recipients_count?: number | null
          scheduled_send_at?: string | null
          send_via?: string[] | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_audience_filter?: Json | null
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          campaign_type?: string | null
          clicked_count?: number | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_template?: string | null
          opened_count?: number | null
          recipients_count?: number | null
          scheduled_send_at?: string | null
          send_via?: string[] | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_audience_filter?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          company_id: string
          created_at: string | null
          display_order: number | null
          fee_amount: number | null
          fee_type: string | null
          has_fee: boolean | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          display_order?: number | null
          fee_amount?: number | null
          fee_type?: string | null
          has_fee?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          display_order?: number | null
          fee_amount?: number | null
          fee_type?: string | null
          has_fee?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_splits: {
        Row: {
          amount: number
          created_at: string | null
          fee_amount: number | null
          id: string
          method_name: string
          payment_id: string
          payment_method_id: string | null
          total_amount: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee_amount?: number | null
          id?: string
          method_name: string
          payment_id: string
          payment_method_id?: string | null
          total_amount: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee_amount?: number | null
          id?: string
          method_name?: string
          payment_id?: string
          payment_method_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_splits_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          fee_amount: number | null
          id: string
          invoice_id: string | null
          is_split: boolean | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_method_id: string | null
          payment_number: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          fee_amount?: number | null
          id?: string
          invoice_id?: string | null
          is_split?: boolean | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_method_id?: string | null
          payment_number?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          fee_amount?: number | null
          id?: string
          invoice_id?: string | null
          is_split?: boolean | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_method_id?: string | null
          payment_number?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          line_total: number | null
          notes: string | null
          part_number: string | null
          purchase_order_id: string
          quantity: number
          quantity_received: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          line_total?: number | null
          notes?: string | null
          part_number?: string | null
          purchase_order_id: string
          quantity: number
          quantity_received?: number | null
          tax_rate?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          line_total?: number | null
          notes?: string | null
          part_number?: string | null
          purchase_order_id?: string
          quantity?: number
          quantity_received?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          branch_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          delivery_date: string | null
          delivery_notes: string | null
          expected_delivery_date: string | null
          id: string
          job_id: string | null
          notes: string | null
          order_date: string
          po_number: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          expected_delivery_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          order_date?: string
          po_number?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          expected_delivery_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          order_date?: string
          po_number?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line_items: {
        Row: {
          created_at: string | null
          description: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          is_approved: boolean | null
          is_optional: boolean | null
          is_upsell: boolean | null
          line_total: number | null
          line_type: string
          notes: string | null
          quantity: number | null
          quote_id: string
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          is_approved?: boolean | null
          is_optional?: boolean | null
          is_upsell?: boolean | null
          line_total?: number | null
          line_type: string
          notes?: string | null
          quantity?: number | null
          quote_id: string
          sort_order?: number | null
          tax_rate?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          is_approved?: boolean | null
          is_optional?: boolean | null
          is_upsell?: boolean | null
          line_total?: number | null
          line_type?: string
          notes?: string | null
          quantity?: number | null
          quote_id?: string
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_tags: {
        Row: {
          quote_id: string
          tag_id: string
        }
        Insert: {
          quote_id: string
          tag_id: string
        }
        Update: {
          quote_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_tags_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          decline_reason: string | null
          deleted_at: string | null
          description: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          expiry_date: string | null
          id: string
          job_id: string | null
          notes: string | null
          quote_date: string
          quote_number: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          decline_reason?: string | null
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          expiry_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          quote_date?: string
          quote_number?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          decline_reason?: string | null
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          expiry_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          quote_date?: string
          quote_number?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_id: string | null
          reason: string | null
          refund_date: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_id?: string | null
          reason?: string | null
          refund_date?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_id?: string | null
          reason?: string | null
          refund_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          body: string | null
          channel: string
          company_id: string
          created_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          recipient: string
          reminder_id: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          body?: string | null
          channel: string
          company_id: string
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          recipient: string
          reminder_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          company_id?: string
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          recipient?: string
          reminder_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "reminder_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_settings: {
        Row: {
          channels: string[] | null
          company_id: string
          created_at: string | null
          days_before: number | null
          enabled: boolean | null
          id: string
          recurring: boolean | null
          reminder_type: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          channels?: string[] | null
          company_id: string
          created_at?: string | null
          days_before?: number | null
          enabled?: boolean | null
          id?: string
          recurring?: boolean | null
          reminder_type: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channels?: string[] | null
          company_id?: string
          created_at?: string | null
          days_before?: number | null
          enabled?: boolean | null
          id?: string
          recurring?: boolean | null
          reminder_type?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_settings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "reminder_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_templates: {
        Row: {
          body: string
          channel: string
          company_id: string
          created_at: string | null
          days_before: number | null
          id: string
          is_active: boolean | null
          name: string
          reminder_type: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          body: string
          channel: string
          company_id: string
          created_at?: string | null
          days_before?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          reminder_type: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          channel?: string
          company_id?: string
          created_at?: string | null
          days_before?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          reminder_type?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          channel: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          due_date: string
          error_message: string | null
          failed_at: string | null
          id: string
          is_recurring: boolean | null
          last_sent_at: string | null
          next_scheduled_date: string | null
          opt_out: boolean | null
          recurring_interval: string | null
          reminder_note: string | null
          reminder_type: string
          sent_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          channel?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          due_date: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          is_recurring?: boolean | null
          last_sent_at?: string | null
          next_scheduled_date?: string | null
          opt_out?: boolean | null
          recurring_interval?: string | null
          reminder_note?: string | null
          reminder_type: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          channel?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          due_date?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          is_recurring?: boolean | null
          last_sent_at?: string | null
          next_scheduled_date?: string | null
          opt_out?: boolean | null
          recurring_interval?: string | null
          reminder_note?: string | null
          reminder_type?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "reminder_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      sales_opportunities: {
        Row: {
          company_id: string
          converted_at: string | null
          converted_to_id: string | null
          converted_to_type: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          description: string | null
          estimated_value: number | null
          id: string
          priority: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          company_id: string
          converted_at?: string | null
          converted_to_id?: string | null
          converted_to_type?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          priority?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string
          converted_at?: string | null
          converted_to_id?: string | null
          converted_to_type?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          priority?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_opportunities_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          account_id: string | null
          company_id: string
          content: string
          created_at: string | null
          created_by: string | null
          engagement_stats: Json | null
          id: string
          media_urls: string[] | null
          platform: string
          post_id: string | null
          posted_at: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          company_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          engagement_stats?: Json | null
          id?: string
          media_urls?: string[] | null
          platform: string
          post_id?: string | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          company_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          engagement_stats?: Json | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          post_id?: string | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_certifications: {
        Row: {
          certification_number: string | null
          certification_type: string
          company_id: string
          created_at: string | null
          expiry_date: string | null
          file_url: string | null
          id: string
          issued_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certification_number?: string | null
          certification_type: string
          company_id: string
          created_at?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issued_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certification_number?: string | null
          certification_type?: string
          company_id?: string
          created_at?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issued_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustment_items: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          quantity_after: number | null
          quantity_before: number | null
          quantity_change: number | null
          stock_adjustment_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_change?: number | null
          stock_adjustment_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_change?: number | null
          stock_adjustment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustment_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustment_items_stock_adjustment_id_fkey"
            columns: ["stock_adjustment_id"]
            isOneToOne: false
            referencedRelation: "stock_adjustments"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjustment_date: string
          branch_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          reason: string
        }
        Insert: {
          adjustment_date?: string
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          reason: string
        }
        Update: {
          adjustment_date?: string
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_branches: number | null
          max_users: number | null
          name: string
          price_annual: number | null
          price_monthly: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_users?: number | null
          name: string
          price_annual?: number | null
          price_monthly?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_users?: number | null
          name?: string
          price_annual?: number | null
          price_monthly?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supplier_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          mobile: string | null
          name: string
          phone: string | null
          role: string | null
          supplier_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          mobile?: string | null
          name: string
          phone?: string | null
          role?: string | null
          supplier_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          mobile?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_contacts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean | null
          name: string
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          pricing_notes: string | null
          supplier_code: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          name: string
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          pricing_notes?: string | null
          supplier_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          pricing_notes?: string | null
          supplier_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          company_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_minutes: number | null
          clock_in: string
          clock_out: string | null
          company_id: string
          created_at: string | null
          hours_billed: number | null
          hours_worked: number | null
          id: string
          job_id: string | null
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number | null
          clock_in: string
          clock_out?: string | null
          company_id: string
          created_at?: string | null
          hours_billed?: number | null
          hours_worked?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number | null
          clock_in?: string
          clock_out?: string | null
          company_id?: string
          created_at?: string | null
          hours_billed?: number | null
          hours_worked?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          addon_id: string | null
          billing_period_end: string | null
          billing_period_start: string | null
          company_id: string
          id: string
          metadata: Json | null
          quantity: number | null
          recorded_at: string | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          addon_id?: string | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          company_id: string
          id?: string
          metadata?: Json | null
          quantity?: number | null
          recorded_at?: string | null
          usage_type: string
          user_id?: string | null
        }
        Update: {
          addon_id?: string | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          company_id?: string
          id?: string
          metadata?: Json | null
          quantity?: number | null
          recorded_at?: string | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addon_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_branches: {
        Row: {
          branch_id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          branch_id: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          branch_id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_branches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          availability: Json | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          mobile: string | null
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: Json | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          mobile?: string | null
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: Json | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          mobile?: string | null
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_files_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_tags: {
        Row: {
          tag_id: string
          vehicle_id: string
        }
        Insert: {
          tag_id: string
          vehicle_id: string
        }
        Update: {
          tag_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_tags_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: string | null
          carjam_data: Json | null
          carjam_last_fetched: string | null
          colour: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          engine_size: string | null
          fuel_type: string | null
          id: string
          is_courtesy_vehicle: boolean | null
          last_service_date: string | null
          last_service_odometer: number | null
          make: string | null
          model: string | null
          notes: string | null
          odometer: number | null
          odometer_unit: string | null
          registration_number: string
          rego_expiry: string | null
          service_due_date: string | null
          service_due_odometer: number | null
          transmission: string | null
          updated_at: string | null
          vin: string | null
          wof_expiry: string | null
          year: number | null
        }
        Insert: {
          body_type?: string | null
          carjam_data?: Json | null
          carjam_last_fetched?: string | null
          colour?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          id?: string
          is_courtesy_vehicle?: boolean | null
          last_service_date?: string | null
          last_service_odometer?: number | null
          make?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          odometer_unit?: string | null
          registration_number: string
          rego_expiry?: string | null
          service_due_date?: string | null
          service_due_odometer?: number | null
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          wof_expiry?: string | null
          year?: number | null
        }
        Update: {
          body_type?: string | null
          carjam_data?: Json | null
          carjam_last_fetched?: string | null
          colour?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          id?: string
          is_courtesy_vehicle?: boolean | null
          last_service_date?: string | null
          last_service_odometer?: number | null
          make?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          odometer_unit?: string | null
          registration_number?: string
          rego_expiry?: string | null
          service_due_date?: string | null
          service_due_odometer?: number | null
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          wof_expiry?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      website_analytics: {
        Row: {
          booking_submissions: number | null
          company_id: string
          created_at: string | null
          date: string
          id: string
          lead_submissions: number | null
          page_views: number | null
          unique_visitors: number | null
          website_id: string
        }
        Insert: {
          booking_submissions?: number | null
          company_id: string
          created_at?: string | null
          date: string
          id?: string
          lead_submissions?: number | null
          page_views?: number | null
          unique_visitors?: number | null
          website_id: string
        }
        Update: {
          booking_submissions?: number | null
          company_id?: string
          created_at?: string | null
          date?: string
          id?: string
          lead_submissions?: number | null
          page_views?: number | null
          unique_visitors?: number | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_analytics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_analytics_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      website_domains: {
        Row: {
          cloudflare_zone_id: string | null
          company_id: string
          created_at: string | null
          dns_verified_at: string | null
          domain: string
          id: string
          ssl_issued_at: string | null
          ssl_status: string | null
          updated_at: string | null
          verification_status: string | null
          website_id: string
        }
        Insert: {
          cloudflare_zone_id?: string | null
          company_id: string
          created_at?: string | null
          dns_verified_at?: string | null
          domain: string
          id?: string
          ssl_issued_at?: string | null
          ssl_status?: string | null
          updated_at?: string | null
          verification_status?: string | null
          website_id: string
        }
        Update: {
          cloudflare_zone_id?: string | null
          company_id?: string
          created_at?: string | null
          dns_verified_at?: string | null
          domain?: string
          id?: string
          ssl_issued_at?: string | null
          ssl_status?: string | null
          updated_at?: string | null
          verification_status?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_domains_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_domains_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      website_leads: {
        Row: {
          company_id: string
          converted_customer_id: string | null
          created_at: string | null
          email: string | null
          id: string
          lead_type: string | null
          message: string | null
          metadata: Json | null
          mobile: string | null
          name: string | null
          registration_number: string | null
          status: string | null
          website_id: string | null
        }
        Insert: {
          company_id: string
          converted_customer_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_type?: string | null
          message?: string | null
          metadata?: Json | null
          mobile?: string | null
          name?: string | null
          registration_number?: string | null
          status?: string | null
          website_id?: string | null
        }
        Update: {
          company_id?: string
          converted_customer_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          lead_type?: string | null
          message?: string | null
          metadata?: Json | null
          mobile?: string | null
          name?: string | null
          registration_number?: string | null
          status?: string | null
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_leads_converted_customer_id_fkey"
            columns: ["converted_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_leads_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          about_text: string | null
          address: string | null
          business_name: string | null
          company_id: string
          created_at: string | null
          custom_domain: string | null
          domain: string | null
          email: string | null
          hero_image_url: string | null
          hours: string | null
          id: string
          is_published: boolean | null
          logo_url: string | null
          phone: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          services: string[] | null
          settings: Json | null
          show_booking_form: boolean | null
          show_lead_form: boolean | null
          show_portal_link: boolean | null
          subdomain: string | null
          tagline: string | null
          template: string | null
          template_data: Json | null
          template_name: string | null
          updated_at: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          business_name?: string | null
          company_id: string
          created_at?: string | null
          custom_domain?: string | null
          domain?: string | null
          email?: string | null
          hero_image_url?: string | null
          hours?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          phone?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          services?: string[] | null
          settings?: Json | null
          show_booking_form?: boolean | null
          show_lead_form?: boolean | null
          show_portal_link?: boolean | null
          subdomain?: string | null
          tagline?: string | null
          template?: string | null
          template_data?: Json | null
          template_name?: string | null
          updated_at?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          business_name?: string | null
          company_id?: string
          created_at?: string | null
          custom_domain?: string | null
          domain?: string | null
          email?: string | null
          hero_image_url?: string | null
          hours?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          phone?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          services?: string[] | null
          settings?: Json | null
          show_booking_form?: boolean | null
          show_lead_form?: boolean | null
          show_portal_link?: boolean | null
          subdomain?: string | null
          tagline?: string | null
          template?: string | null
          template_data?: Json | null
          template_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "websites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      wof_compliance_logs: {
        Row: {
          after_data: Json | null
          before_data: Json | null
          change_summary: string | null
          changed_by: string | null
          company_id: string
          id: string
          ip_address: string | null
          log_type: string
          logged_at: string | null
          user_agent: string | null
          wof_inspection_id: string | null
        }
        Insert: {
          after_data?: Json | null
          before_data?: Json | null
          change_summary?: string | null
          changed_by?: string | null
          company_id: string
          id?: string
          ip_address?: string | null
          log_type: string
          logged_at?: string | null
          user_agent?: string | null
          wof_inspection_id?: string | null
        }
        Update: {
          after_data?: Json | null
          before_data?: Json | null
          change_summary?: string | null
          changed_by?: string | null
          company_id?: string
          id?: string
          ip_address?: string | null
          log_type?: string
          logged_at?: string | null
          user_agent?: string | null
          wof_inspection_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wof_compliance_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_compliance_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_compliance_logs_wof_inspection_id_fkey"
            columns: ["wof_inspection_id"]
            isOneToOne: false
            referencedRelation: "wof_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      wof_inspection_items: {
        Row: {
          category: string
          created_at: string | null
          fail_reason: string | null
          id: string
          item_name: string
          notes: string | null
          photo_url: string | null
          result: string
          sort_order: number | null
          wof_inspection_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          fail_reason?: string | null
          id?: string
          item_name: string
          notes?: string | null
          photo_url?: string | null
          result: string
          sort_order?: number | null
          wof_inspection_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          fail_reason?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          photo_url?: string | null
          result?: string
          sort_order?: number | null
          wof_inspection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wof_inspection_items_wof_inspection_id_fkey"
            columns: ["wof_inspection_id"]
            isOneToOne: false
            referencedRelation: "wof_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      wof_inspections: {
        Row: {
          booking_id: string | null
          branch_id: string | null
          company_id: string
          created_at: string | null
          customer_id: string | null
          expiry_date: string | null
          form_locked: boolean | null
          id: string
          inspection_date: string
          inspection_number: string | null
          inspection_type: string
          inspector_id: string
          is_recheck: boolean | null
          is_voided: boolean | null
          notes: string | null
          odometer: number | null
          original_inspection_id: string | null
          overall_result: string
          pass_date: string | null
          recheck_started_at: string | null
          repair_job_id: string | null
          system_authorization_number: string | null
          updated_at: string | null
          vehicle_id: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
          wof_label_serial_number: string | null
          wof_rule_version_id: string | null
        }
        Insert: {
          booking_id?: string | null
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          customer_id?: string | null
          expiry_date?: string | null
          form_locked?: boolean | null
          id?: string
          inspection_date?: string
          inspection_number?: string | null
          inspection_type: string
          inspector_id: string
          is_recheck?: boolean | null
          is_voided?: boolean | null
          notes?: string | null
          odometer?: number | null
          original_inspection_id?: string | null
          overall_result: string
          pass_date?: string | null
          recheck_started_at?: string | null
          repair_job_id?: string | null
          system_authorization_number?: string | null
          updated_at?: string | null
          vehicle_id: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
          wof_label_serial_number?: string | null
          wof_rule_version_id?: string | null
        }
        Update: {
          booking_id?: string | null
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          customer_id?: string | null
          expiry_date?: string | null
          form_locked?: boolean | null
          id?: string
          inspection_date?: string
          inspection_number?: string | null
          inspection_type?: string
          inspector_id?: string
          is_recheck?: boolean | null
          is_voided?: boolean | null
          notes?: string | null
          odometer?: number | null
          original_inspection_id?: string | null
          overall_result?: string
          pass_date?: string | null
          recheck_started_at?: string | null
          repair_job_id?: string | null
          system_authorization_number?: string | null
          updated_at?: string | null
          vehicle_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
          wof_label_serial_number?: string | null
          wof_rule_version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wof_inspections_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_original_inspection_id_fkey"
            columns: ["original_inspection_id"]
            isOneToOne: false
            referencedRelation: "wof_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_repair_job_id_fkey"
            columns: ["repair_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_inspections_wof_rule_version_id_fkey"
            columns: ["wof_rule_version_id"]
            isOneToOne: false
            referencedRelation: "wof_rule_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      wof_rechecks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          original_inspection_id: string
          recheck_completed_date: string | null
          recheck_due_date: string | null
          recheck_inspection_id: string | null
          recheck_result: string | null
          repair_job_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          original_inspection_id: string
          recheck_completed_date?: string | null
          recheck_due_date?: string | null
          recheck_inspection_id?: string | null
          recheck_result?: string | null
          repair_job_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          original_inspection_id?: string
          recheck_completed_date?: string | null
          recheck_due_date?: string | null
          recheck_inspection_id?: string | null
          recheck_result?: string | null
          repair_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wof_rechecks_original_inspection_id_fkey"
            columns: ["original_inspection_id"]
            isOneToOne: false
            referencedRelation: "wof_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_rechecks_recheck_inspection_id_fkey"
            columns: ["recheck_inspection_id"]
            isOneToOne: false
            referencedRelation: "wof_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wof_rechecks_repair_job_id_fkey"
            columns: ["repair_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      wof_rule_versions: {
        Row: {
          created_at: string | null
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          rule_document_url: string | null
          version_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          rule_document_url?: string | null
          version_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          rule_document_url?: string | null
          version_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_payment_methods: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      merge_customers: {
        Args: { source_customer_id: string; target_customer_id: string }
        Returns: Json
      }
      move_vehicle: {
        Args: {
          moved_by_user_id: string
          new_customer_id: string
          vehicle_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
