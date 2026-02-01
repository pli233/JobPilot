export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          platform: string;
          title: string;
          company: string;
          location: string | null;
          location_type: "remote" | "hybrid" | "onsite" | null;
          salary_min: number | null;
          salary_max: number | null;
          url: string;
          description: string | null;
          easy_apply: boolean | null;
          match_score: number | null;
          saved_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          title: string;
          company: string;
          location?: string | null;
          location_type?: "remote" | "hybrid" | "onsite" | null;
          salary_min?: number | null;
          salary_max?: number | null;
          url: string;
          description?: string | null;
          easy_apply?: boolean | null;
          match_score?: number | null;
          saved_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          platform?: string;
          title?: string;
          company?: string;
          location?: string | null;
          location_type?: "remote" | "hybrid" | "onsite" | null;
          salary_min?: number | null;
          salary_max?: number | null;
          url?: string;
          description?: string | null;
          easy_apply?: boolean | null;
          match_score?: number | null;
          saved_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          name: string;
          file_path: string;
          storage_path: string | null;
          skills: string | null;
          is_default: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          file_path: string;
          storage_path?: string | null;
          skills?: string | null;
          is_default?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          file_path?: string;
          storage_path?: string | null;
          skills?: string | null;
          is_default?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          job_id: string | null;
          resume_id: string | null;
          status: "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn";
          applied_at: string | null;
          notes: string | null;
          platform: string | null;
          application_url: string | null;
          salary_min: number | null;
          salary_max: number | null;
          location: string | null;
          location_type: string | null;
          company: string | null;
          position: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          resume_id?: string | null;
          status?: "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn";
          applied_at?: string | null;
          notes?: string | null;
          platform?: string | null;
          application_url?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          location?: string | null;
          location_type?: string | null;
          company?: string | null;
          position?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string | null;
          resume_id?: string | null;
          status?: "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn";
          applied_at?: string | null;
          notes?: string | null;
          platform?: string | null;
          application_url?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          location?: string | null;
          location_type?: string | null;
          company?: string | null;
          position?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_resume_id_fkey";
            columns: ["resume_id"];
            isOneToOne: false;
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience types
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"];
export type Resume = Database["public"]["Tables"]["resumes"]["Row"];
export type NewResume = Database["public"]["Tables"]["resumes"]["Insert"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type NewApplication = Database["public"]["Tables"]["applications"]["Insert"];
