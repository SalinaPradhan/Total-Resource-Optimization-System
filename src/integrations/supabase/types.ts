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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: []
      }
      assets: {
        Row: {
          assigned_to: string | null
          code: string
          created_at: string
          id: string
          location: string | null
          name: string
          room_id: string | null
          status: Database["public"]["Enums"]["asset_status"]
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          code: string
          created_at?: string
          id?: string
          location?: string | null
          name: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          code?: string
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "support_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          branch: string
          class_end_time: string | null
          class_start_time: string | null
          code: string
          created_at: string
          discipline: string
          id: string
          name: string
          section: string
          semester: number
          size: number
          stream: string
          sub_branch: string | null
          updated_at: string
          year: number
        }
        Insert: {
          branch?: string
          class_end_time?: string | null
          class_start_time?: string | null
          code: string
          created_at?: string
          discipline?: string
          id?: string
          name: string
          section?: string
          semester: number
          size?: number
          stream: string
          sub_branch?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          branch?: string
          class_end_time?: string | null
          class_start_time?: string | null
          code?: string
          created_at?: string
          discipline?: string
          id?: string
          name?: string
          section?: string
          semester?: number
          size?: number
          stream?: string
          sub_branch?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      coordinator_assignments: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordinator_assignments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credit_hours: number
          department: string
          id: string
          name: string
          requires_lab: boolean | null
          requires_projector: boolean | null
          updated_at: string
          weekly_hours: number
        }
        Insert: {
          code: string
          created_at?: string
          credit_hours?: number
          department: string
          id?: string
          name: string
          requires_lab?: boolean | null
          requires_projector?: boolean | null
          updated_at?: string
          weekly_hours?: number
        }
        Update: {
          code?: string
          created_at?: string
          credit_hours?: number
          department?: string
          id?: string
          name?: string
          requires_lab?: boolean | null
          requires_projector?: boolean | null
          updated_at?: string
          weekly_hours?: number
        }
        Relationships: []
      }
      faculty: {
        Row: {
          created_at: string
          current_load: number
          department: string
          email: string
          id: string
          max_load: number
          name: string
          status: Database["public"]["Enums"]["faculty_status"]
          subjects: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_load?: number
          department: string
          email: string
          id?: string
          max_load?: number
          name: string
          status?: Database["public"]["Enums"]["faculty_status"]
          subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_load?: number
          department?: string
          email?: string
          id?: string
          max_load?: number
          name?: string
          status?: Database["public"]["Enums"]["faculty_status"]
          subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      faculty_availability: {
        Row: {
          created_at: string
          day_of_week: string
          end_time: string
          faculty_id: string
          id: string
          preference_type: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          end_time: string
          faculty_id: string
          id?: string
          preference_type: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          end_time?: string
          faculty_id?: string
          id?: string
          preference_type?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_availability_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batch_id: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          batch_id?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          batch_id?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string
          capacity: number
          code: string
          created_at: string
          floor: number
          has_ac: boolean | null
          has_projector: boolean | null
          has_smart_board: boolean | null
          id: string
          name: string
          status: Database["public"]["Enums"]["room_status"]
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          building: string
          capacity?: number
          code: string
          created_at?: string
          floor?: number
          has_ac?: boolean | null
          has_projector?: boolean | null
          has_smart_board?: boolean | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          building?: string
          capacity?: number
          code?: string
          created_at?: string
          floor?: number
          has_ac?: boolean | null
          has_projector?: boolean | null
          has_smart_board?: boolean | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      schedule_warnings: {
        Row: {
          created_at: string
          id: string
          resolved: boolean | null
          schedule_id: string
          warning: string
        }
        Insert: {
          created_at?: string
          id?: string
          resolved?: boolean | null
          schedule_id: string
          warning: string
        }
        Update: {
          created_at?: string
          id?: string
          resolved?: boolean | null
          schedule_id?: string
          warning?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_warnings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          academic_year: string
          assigned_staff_id: string | null
          batch_id: string
          course_id: string
          created_at: string
          day: string
          end_time: string
          faculty_id: string
          id: string
          room_id: string
          semester: number
          start_time: string
          type: Database["public"]["Enums"]["schedule_type"]
          updated_at: string
        }
        Insert: {
          academic_year: string
          assigned_staff_id?: string | null
          batch_id: string
          course_id: string
          created_at?: string
          day: string
          end_time: string
          faculty_id: string
          id?: string
          room_id: string
          semester: number
          start_time: string
          type?: Database["public"]["Enums"]["schedule_type"]
          updated_at?: string
        }
        Update: {
          academic_year?: string
          assigned_staff_id?: string | null
          batch_id?: string
          course_id?: string
          created_at?: string
          day?: string
          end_time?: string
          faculty_id?: string
          id?: string
          room_id?: string
          semester?: number
          start_time?: string
          type?: Database["public"]["Enums"]["schedule_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "support_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      support_staff: {
        Row: {
          created_at: string
          department: string
          email: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["staff_role"]
          shift: Database["public"]["Enums"]["staff_shift"]
          status: Database["public"]["Enums"]["staff_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department: string
          email?: string | null
          id?: string
          name: string
          role?: Database["public"]["Enums"]["staff_role"]
          shift?: Database["public"]["Enums"]["staff_shift"]
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          email?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["staff_role"]
          shift?: Database["public"]["Enums"]["staff_shift"]
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      swap_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          current_day: string
          current_end_time: string
          current_start_time: string
          faculty_id: string
          id: string
          reason: string
          requested_day: string
          requested_end_time: string
          requested_start_time: string
          reviewed_at: string | null
          reviewed_by: string | null
          schedule_id: string
          status: Database["public"]["Enums"]["swap_request_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          current_day: string
          current_end_time: string
          current_start_time: string
          faculty_id: string
          id?: string
          reason: string
          requested_day: string
          requested_end_time: string
          requested_start_time: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          schedule_id: string
          status?: Database["public"]["Enums"]["swap_request_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          current_day?: string
          current_end_time?: string
          current_start_time?: string
          faculty_id?: string
          id?: string
          reason?: string
          requested_day?: string
          requested_end_time?: string
          requested_start_time?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          schedule_id?: string
          status?: Database["public"]["Enums"]["swap_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      alert_type: "error" | "warning" | "info"
      app_role: "admin" | "faculty" | "student" | "super_admin"
      asset_status: "working" | "broken" | "maintenance"
      asset_type: "projector" | "computer" | "equipment" | "furniture"
      faculty_status: "available" | "on_leave" | "busy"
      room_status: "available" | "occupied" | "maintenance"
      room_type: "lecture" | "lab" | "seminar" | "auditorium"
      schedule_type: "lecture" | "lab" | "tutorial"
      staff_role: "lab_assistant" | "technician" | "admin_staff"
      staff_shift: "morning" | "afternoon" | "full_day"
      staff_status: "available" | "assigned" | "on_leave"
      swap_request_status: "pending" | "approved" | "rejected"
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
    Enums: {
      alert_type: ["error", "warning", "info"],
      app_role: ["admin", "faculty", "student", "super_admin"],
      asset_status: ["working", "broken", "maintenance"],
      asset_type: ["projector", "computer", "equipment", "furniture"],
      faculty_status: ["available", "on_leave", "busy"],
      room_status: ["available", "occupied", "maintenance"],
      room_type: ["lecture", "lab", "seminar", "auditorium"],
      schedule_type: ["lecture", "lab", "tutorial"],
      staff_role: ["lab_assistant", "technician", "admin_staff"],
      staff_shift: ["morning", "afternoon", "full_day"],
      staff_status: ["available", "assigned", "on_leave"],
      swap_request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
