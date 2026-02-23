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
      attempt_answers: {
        Row: {
          attempt_id: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_index: number | null
          time_spent_seconds: number | null
        }
        Insert: {
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_index?: number | null
          time_spent_seconds?: number | null
        }
        Update: {
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_index?: number | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          subject_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          subject_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          subject_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string
          exam_id: string
          id: string
          score: number | null
          time_taken_seconds: number | null
          total_questions: number | null
          unanswered: number | null
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          exam_id: string
          id?: string
          score?: number | null
          time_taken_seconds?: number | null
          total_questions?: number | null
          unanswered?: number | null
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          exam_id?: string
          id?: string
          score?: number | null
          time_taken_seconds?: number | null
          total_questions?: number | null
          unanswered?: number | null
          user_id?: string
          wrong_answers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          state: string | null
          subject_id: string
          title: string
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          state?: string | null
          subject_id: string
          title: string
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          state?: string | null
          subject_id?: string
          title?: string
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_published: boolean | null
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          state: string | null
          streak_days: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          state?: string | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          state?: string | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer_index: number
          created_at: string
          display_order: number | null
          exam_id: string
          explanation: string | null
          id: string
          options: Json
          question_text: string
        }
        Insert: {
          answer_index: number
          created_at?: string
          display_order?: number | null
          exam_id: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text: string
        }
        Update: {
          answer_index?: number
          created_at?: string
          display_order?: number | null
          exam_id?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
