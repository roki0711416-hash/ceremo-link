export type UserRole = "freelancer" | "funeral_company" | "admin";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type JobStatus =
  | "draft"
  | "open"
  | "assigned"
  | "requested"
  | "accepted"
  | "declined"
  | "expired"
  | "in_progress"
  | "completion_pending"
  | "completed"
  | "cancellation_requested"
  | "cancelled"
  | "disputed";

export type CandidateStatus =
  | "notified"
  | "viewed"
  | "won"
  | "lost"
  | "withdrawn";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * App-facing Database type.
 * After applying migrations, prefer regenerating with `npm run db:types`
 * and aligning this file (or switching imports to database.generated.ts).
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          email: string;
          phone: string | null;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          email: string;
          phone?: string | null;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          email?: string;
          phone?: string | null;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      freelancers: {
        Row: {
          id: string;
          legal_name: string | null;
          display_name: string | null;
          avatar_path: string | null;
          phone: string | null;
          residence_municipality_id: string | null;
          years_of_experience: number;
          bio: string | null;
          transport_modes: string[];
          desired_pay_min: number | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          rejection_reason: string | null;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          legal_name?: string | null;
          display_name?: string | null;
          avatar_path?: string | null;
          phone?: string | null;
          residence_municipality_id?: string | null;
          years_of_experience?: number;
          bio?: string | null;
          transport_modes?: string[];
          desired_pay_min?: number | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          rejection_reason?: string | null;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["freelancers"]["Insert"]>;
        Relationships: [];
      };
      funeral_companies: {
        Row: {
          id: string;
          company_name: string | null;
          representative_name: string | null;
          phone: string | null;
          municipality_id: string | null;
          address: string | null;
          contact_person_name: string | null;
          postal_code: string | null;
          prefecture: string;
          emergency_phone: string | null;
          corporate_number: string | null;
          website_url: string | null;
          business_document_path: string | null;
          terms_accepted_at: string | null;
          profile_completed_at: string | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          rejection_reason: string | null;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_name?: string | null;
          representative_name?: string | null;
          phone?: string | null;
          municipality_id?: string | null;
          address?: string | null;
          contact_person_name?: string | null;
          postal_code?: string | null;
          prefecture?: string;
          emergency_phone?: string | null;
          corporate_number?: string | null;
          website_url?: string | null;
          business_document_path?: string | null;
          terms_accepted_at?: string | null;
          profile_completed_at?: string | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          rejection_reason?: string | null;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["funeral_companies"]["Insert"]
        >;
        Relationships: [];
      };
      crematoriums: {
        Row: {
          id: string;
          name: string;
          municipality_id: string;
          address: string;
          notes: string | null;
          is_placeholder: boolean;
          data_label: string;
          sort_order: number;
          slug: string | null;
          lat: number | null;
          lng: number | null;
          usage_fee_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          municipality_id: string;
          address: string;
          notes?: string | null;
          is_placeholder?: boolean;
          data_label?: string;
          sort_order?: number;
          slug?: string | null;
          lat?: number | null;
          lng?: number | null;
          usage_fee_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["crematoriums"]["Insert"]>;
        Relationships: [];
      };
      municipalities: {
        Row: {
          id: string;
          code: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["municipalities"]["Insert"]>;
        Relationships: [];
      };
      service_types: {
        Row: {
          id: string;
          code: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_types"]["Insert"]>;
        Relationships: [];
      };
      job_requests: {
        Row: {
          id: string;
          funeral_company_id: string;
          freelancer_id: string | null;
          assigned_freelancer_id: string | null;
          availability_id: string | null;
          service_type_id: string;
          municipality_id: string;
          location_general: string;
          crematorium_name: string | null;
          estimated_duration_minutes: number | null;
          work_starts_at: string;
          work_ends_at: string;
          meetup_at: string | null;
          description: string | null;
          dress_code: string | null;
          belongings: string | null;
          notes: string | null;
          pay_amount: number;
          travel_expense: number;
          payment_due_on: string;
          response_deadline_at: string;
          status: JobStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          funeral_company_id: string;
          freelancer_id?: string | null;
          assigned_freelancer_id?: string | null;
          availability_id?: string | null;
          service_type_id: string;
          municipality_id: string;
          location_general: string;
          crematorium_name?: string | null;
          estimated_duration_minutes?: number | null;
          work_starts_at: string;
          work_ends_at: string;
          meetup_at?: string | null;
          description?: string | null;
          dress_code?: string | null;
          belongings?: string | null;
          notes?: string | null;
          pay_amount: number;
          travel_expense?: number;
          payment_due_on: string;
          response_deadline_at: string;
          status?: JobStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_requests"]["Insert"]>;
        Relationships: [];
      };
      job_private_details: {
        Row: {
          job_request_id: string;
          exact_address: string | null;
          facility_name: string | null;
          meetup_location: string | null;
          emergency_contact: string | null;
          deceased_name: string | null;
          company_contact_name: string | null;
          company_contact_phone: string | null;
          detailed_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          job_request_id: string;
          exact_address?: string | null;
          facility_name?: string | null;
          meetup_location?: string | null;
          emergency_contact?: string | null;
          deceased_name?: string | null;
          company_contact_name?: string | null;
          company_contact_phone?: string | null;
          detailed_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["job_private_details"]["Insert"]
        >;
        Relationships: [];
      };
      job_candidates: {
        Row: {
          id: string;
          job_request_id: string;
          freelancer_id: string;
          status: CandidateStatus;
          notified_at: string;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_request_id: string;
          freelancer_id: string;
          status?: CandidateStatus;
          notified_at?: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_candidates"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link_path: string | null;
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link_path?: string | null;
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      publish_job_request: {
        Args: { p_job_id: string };
        Returns: unknown;
      };
      claim_open_job: {
        Args: { p_job_id: string };
        Returns: unknown;
      };
      accept_job_request: {
        Args: { p_job_id: string };
        Returns: unknown;
      };
      current_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      staff_availability_daily_counts: {
        Args: {
          p_municipality_id: string;
          p_from: string;
          p_to: string;
        };
        Returns: { work_date: string; freelancer_count: number }[];
      };
    };
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      job_status: JobStatus;
      candidate_status: CandidateStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type JobRequest = Database["public"]["Tables"]["job_requests"]["Row"];
export type FuneralCompany =
  Database["public"]["Tables"]["funeral_companies"]["Row"];
export type Crematorium = Database["public"]["Tables"]["crematoriums"]["Row"];
