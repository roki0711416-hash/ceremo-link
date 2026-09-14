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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availabilities: {
        Row: {
          created_at: string
          ends_at: string
          freelancer_id: string
          id: string
          is_active: boolean
          is_reserved: boolean
          note: string | null
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          freelancer_id: string
          id?: string
          is_active?: boolean
          is_reserved?: boolean
          note?: string | null
          starts_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          freelancer_id?: string
          id?: string
          is_active?: boolean
          is_reserved?: boolean
          note?: string | null
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellations: {
        Row: {
          created_at: string
          id: string
          job_request_id: string
          reason: string
          requested_by: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["cancellation_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          job_request_id: string
          reason: string
          requested_by: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["cancellation_status"]
        }
        Update: {
          created_at?: string
          id?: string
          job_request_id?: string
          reason?: string
          requested_by?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["cancellation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "cancellations_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_amendments: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          change_set: Json
          contract_id: string
          created_at: string
          id: string
          job_request_id: string
          notice_id: string | null
          proposed_by: string
          status: Database["public"]["Enums"]["amendment_status"]
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          change_set: Json
          contract_id: string
          created_at?: string
          id?: string
          job_request_id: string
          notice_id?: string | null
          proposed_by: string
          status?: Database["public"]["Enums"]["amendment_status"]
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          change_set?: Json
          contract_id?: string
          created_at?: string
          id?: string
          job_request_id?: string
          notice_id?: string | null
          proposed_by?: string
          status?: Database["public"]["Enums"]["amendment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contract_amendments_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_amendments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_amendments_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_amendments_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "job_change_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_amendments_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          freelancer_snapshot: Json
          funeral_company_snapshot: Json
          id: string
          job_request_id: string
          private_snapshot: Json
          terms_snapshot: Json
        }
        Insert: {
          created_at?: string
          freelancer_snapshot: Json
          funeral_company_snapshot: Json
          id?: string
          job_request_id: string
          private_snapshot: Json
          terms_snapshot: Json
        }
        Update: {
          created_at?: string
          freelancer_snapshot?: Json
          funeral_company_snapshot?: Json
          id?: string
          job_request_id?: string
          private_snapshot?: Json
          terms_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "contracts_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: true
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      crematoriums: {
        Row: {
          address: string
          created_at: string
          data_label: string
          id: string
          is_placeholder: boolean
          municipality_id: string
          name: string
          notes: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          data_label?: string
          id?: string
          is_placeholder?: boolean
          municipality_id: string
          name: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          data_label?: string
          id?: string
          is_placeholder?: boolean
          municipality_id?: string
          name?: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crematoriums_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_service_areas: {
        Row: {
          freelancer_id: string
          municipality_id: string
        }
        Insert: {
          freelancer_id: string
          municipality_id: string
        }
        Update: {
          freelancer_id?: string
          municipality_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_service_areas_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_service_areas_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_services: {
        Row: {
          freelancer_id: string
          service_type_id: string
        }
        Insert: {
          freelancer_id: string
          service_type_id: string
        }
        Update: {
          freelancer_id?: string
          service_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_services_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_services_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancers: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          desired_pay_min: number | null
          display_name: string | null
          id: string
          legal_name: string | null
          phone: string | null
          rating_avg: number
          rating_count: number
          rejection_reason: string | null
          residence_municipality_id: string | null
          transport_modes: string[]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          years_of_experience: number
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          desired_pay_min?: number | null
          display_name?: string | null
          id: string
          legal_name?: string | null
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          rejection_reason?: string | null
          residence_municipality_id?: string | null
          transport_modes?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          years_of_experience?: number
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          desired_pay_min?: number | null
          display_name?: string | null
          id?: string
          legal_name?: string | null
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          rejection_reason?: string | null
          residence_municipality_id?: string | null
          transport_modes?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "freelancers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancers_residence_municipality_id_fkey"
            columns: ["residence_municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      funeral_companies: {
        Row: {
          address: string | null
          business_document_path: string | null
          company_name: string | null
          contact_person_name: string | null
          corporate_number: string | null
          created_at: string
          emergency_phone: string | null
          id: string
          municipality_id: string | null
          phone: string | null
          postal_code: string | null
          prefecture: string
          profile_completed_at: string | null
          rating_avg: number
          rating_count: number
          rejection_reason: string | null
          representative_name: string | null
          terms_accepted_at: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_document_path?: string | null
          company_name?: string | null
          contact_person_name?: string | null
          corporate_number?: string | null
          created_at?: string
          emergency_phone?: string | null
          id: string
          municipality_id?: string | null
          phone?: string | null
          postal_code?: string | null
          prefecture?: string
          profile_completed_at?: string | null
          rating_avg?: number
          rating_count?: number
          rejection_reason?: string | null
          representative_name?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_document_path?: string | null
          company_name?: string | null
          contact_person_name?: string | null
          corporate_number?: string | null
          created_at?: string
          emergency_phone?: string | null
          id?: string
          municipality_id?: string | null
          phone?: string | null
          postal_code?: string | null
          prefecture?: string
          profile_completed_at?: string | null
          rating_avg?: number
          rating_count?: number
          rejection_reason?: string | null
          representative_name?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funeral_companies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funeral_companies_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          created_at: string
          doc_type: string
          freelancer_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["identity_doc_status"]
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          freelancer_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["identity_doc_status"]
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          freelancer_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["identity_doc_status"]
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_candidates: {
        Row: {
          created_at: string
          freelancer_id: string
          id: string
          job_request_id: string
          notified_at: string
          responded_at: string | null
          status: Database["public"]["Enums"]["candidate_status"]
        }
        Insert: {
          created_at?: string
          freelancer_id: string
          id?: string
          job_request_id: string
          notified_at?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
        }
        Update: {
          created_at?: string
          freelancer_id?: string
          id?: string
          job_request_id?: string
          notified_at?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
        }
        Relationships: [
          {
            foreignKeyName: "job_candidates_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_candidates_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_change_acknowledgements: {
        Row: {
          acknowledged_at: string
          id: string
          notice_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          id?: string
          notice_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          id?: string
          notice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_change_acknowledgements_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "job_change_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_change_acknowledgements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_change_notices: {
        Row: {
          created_at: string
          created_by: string
          id: string
          job_request_id: string
          notice_type: Database["public"]["Enums"]["change_notice_type"]
          payload: Json
          requires_reacceptance: boolean
          summary: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          job_request_id: string
          notice_type?: Database["public"]["Enums"]["change_notice_type"]
          payload?: Json
          requires_reacceptance?: boolean
          summary: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          job_request_id?: string
          notice_type?: Database["public"]["Enums"]["change_notice_type"]
          payload?: Json
          requires_reacceptance?: boolean
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_change_notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_change_notices_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_day_events: {
        Row: {
          actor_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["day_event_type"]
          id: string
          job_request_id: string
          note: string | null
        }
        Insert: {
          actor_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["day_event_type"]
          id?: string
          job_request_id: string
          note?: string | null
        }
        Update: {
          actor_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["day_event_type"]
          id?: string
          job_request_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_day_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_day_events_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          job_request_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          job_request_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          job_request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_messages_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_private_details: {
        Row: {
          company_contact_name: string | null
          company_contact_phone: string | null
          created_at: string
          deceased_name: string | null
          detailed_notes: string | null
          emergency_contact: string | null
          exact_address: string | null
          facility_name: string | null
          job_request_id: string
          meetup_location: string | null
          updated_at: string
        }
        Insert: {
          company_contact_name?: string | null
          company_contact_phone?: string | null
          created_at?: string
          deceased_name?: string | null
          detailed_notes?: string | null
          emergency_contact?: string | null
          exact_address?: string | null
          facility_name?: string | null
          job_request_id: string
          meetup_location?: string | null
          updated_at?: string
        }
        Update: {
          company_contact_name?: string | null
          company_contact_phone?: string | null
          created_at?: string
          deceased_name?: string | null
          detailed_notes?: string | null
          emergency_contact?: string | null
          exact_address?: string | null
          facility_name?: string | null
          job_request_id?: string
          meetup_location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_private_details_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: true
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requests: {
        Row: {
          assigned_freelancer_id: string | null
          availability_id: string | null
          belongings: string | null
          created_at: string
          crematorium_name: string | null
          description: string | null
          dress_code: string | null
          estimated_duration_minutes: number | null
          freelancer_id: string | null
          funeral_company_id: string
          id: string
          location_general: string
          meetup_at: string | null
          municipality_id: string
          notes: string | null
          pay_amount: number
          payment_due_on: string
          response_deadline_at: string
          service_type_id: string
          status: Database["public"]["Enums"]["job_status"]
          travel_expense: number
          updated_at: string
          work_ends_at: string
          work_starts_at: string
        }
        Insert: {
          assigned_freelancer_id?: string | null
          availability_id?: string | null
          belongings?: string | null
          created_at?: string
          crematorium_name?: string | null
          description?: string | null
          dress_code?: string | null
          estimated_duration_minutes?: number | null
          freelancer_id?: string | null
          funeral_company_id: string
          id?: string
          location_general: string
          meetup_at?: string | null
          municipality_id: string
          notes?: string | null
          pay_amount: number
          payment_due_on: string
          response_deadline_at: string
          service_type_id: string
          status?: Database["public"]["Enums"]["job_status"]
          travel_expense?: number
          updated_at?: string
          work_ends_at: string
          work_starts_at: string
        }
        Update: {
          assigned_freelancer_id?: string | null
          availability_id?: string | null
          belongings?: string | null
          created_at?: string
          crematorium_name?: string | null
          description?: string | null
          dress_code?: string | null
          estimated_duration_minutes?: number | null
          freelancer_id?: string | null
          funeral_company_id?: string
          id?: string
          location_general?: string
          meetup_at?: string | null
          municipality_id?: string
          notes?: string | null
          pay_amount?: number
          payment_due_on?: string
          response_deadline_at?: string
          service_type_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          travel_expense?: number
          updated_at?: string
          work_ends_at?: string
          work_starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_requests_assigned_freelancer_id_fkey"
            columns: ["assigned_freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "availabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_funeral_company_id_fkey"
            columns: ["funeral_company_id"]
            isOneToOne: false
            referencedRelation: "funeral_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      job_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["job_status"] | null
          id: string
          job_request_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["job_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["job_status"] | null
          id?: string
          job_request_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["job_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["job_status"] | null
          id?: string
          job_request_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["job_status"]
        }
        Relationships: [
          {
            foreignKeyName: "job_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_status_history_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      municipalities: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link_path: string | null
          payload: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          link_path?: string | null
          payload?: Json
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link_path?: string | null
          payload?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_suspended: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_suspended?: boolean
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_suspended?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_published: boolean
          job_request_id: string
          publish_after: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          job_request_id: string
          publish_after: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          job_request_id?: string
          publish_after?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_job_request: {
        Args: { p_job_id: string }
        Returns: {
          created_at: string
          freelancer_snapshot: Json
          funeral_company_snapshot: Json
          id: string
          job_request_id: string
          private_snapshot: Json
          terms_snapshot: Json
        }
        SetofOptions: {
          from: "*"
          to: "contracts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_open_job: {
        Args: { p_job_id: string }
        Returns: {
          created_at: string
          freelancer_snapshot: Json
          funeral_company_snapshot: Json
          id: string
          job_request_id: string
          private_snapshot: Json
          terms_snapshot: Json
        }
        SetofOptions: {
          from: "*"
          to: "contracts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      find_matching_freelancer_ids: {
        Args: { p_job_id: string }
        Returns: string[]
      }
      freelancer_is_eligible_for_job: {
        Args: {
          p_freelancer_id: string
          p_job: Database["public"]["Tables"]["job_requests"]["Row"]
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_approved_freelancer: { Args: never; Returns: boolean }
      is_approved_funeral_company: { Args: never; Returns: boolean }
      publish_job_request: {
        Args: { p_job_id: string }
        Returns: {
          assigned_freelancer_id: string | null
          availability_id: string | null
          belongings: string | null
          created_at: string
          crematorium_name: string | null
          description: string | null
          dress_code: string | null
          estimated_duration_minutes: number | null
          freelancer_id: string | null
          funeral_company_id: string
          id: string
          location_general: string
          meetup_at: string | null
          municipality_id: string
          notes: string | null
          pay_amount: number
          payment_due_on: string
          response_deadline_at: string
          service_type_id: string
          status: Database["public"]["Enums"]["job_status"]
          travel_expense: number
          updated_at: string
          work_ends_at: string
          work_starts_at: string
        }
        SetofOptions: {
          from: "*"
          to: "job_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      staff_availability_daily_counts: {
        Args: { p_from: string; p_municipality_id: string; p_to: string }
        Returns: {
          freelancer_count: number
          work_date: string
        }[]
      }
    }
    Enums: {
      amendment_status: "pending" | "accepted" | "rejected" | "expired"
      cancellation_status: "pending" | "approved" | "rejected"
      candidate_status: "notified" | "viewed" | "won" | "lost" | "withdrawn"
      change_notice_type: "operational" | "contractual"
      day_event_type:
        | "arrived"
        | "started"
        | "finished_ok"
        | "finished_with_issue"
      identity_doc_status: "pending" | "approved" | "rejected"
      job_status:
        | "draft"
        | "requested"
        | "accepted"
        | "declined"
        | "expired"
        | "in_progress"
        | "completion_pending"
        | "completed"
        | "cancellation_requested"
        | "cancelled"
        | "disputed"
        | "open"
        | "assigned"
      user_role: "freelancer" | "funeral_company" | "admin"
      verification_status: "pending" | "approved" | "rejected"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      amendment_status: ["pending", "accepted", "rejected", "expired"],
      cancellation_status: ["pending", "approved", "rejected"],
      candidate_status: ["notified", "viewed", "won", "lost", "withdrawn"],
      change_notice_type: ["operational", "contractual"],
      day_event_type: [
        "arrived",
        "started",
        "finished_ok",
        "finished_with_issue",
      ],
      identity_doc_status: ["pending", "approved", "rejected"],
      job_status: [
        "draft",
        "requested",
        "accepted",
        "declined",
        "expired",
        "in_progress",
        "completion_pending",
        "completed",
        "cancellation_requested",
        "cancelled",
        "disputed",
        "open",
        "assigned",
      ],
      user_role: ["freelancer", "funeral_company", "admin"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
