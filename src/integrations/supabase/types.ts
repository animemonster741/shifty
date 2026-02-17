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
      access_approvers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          tab_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          tab_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          tab_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_pages_tab_id_fkey"
            columns: ["tab_id"]
            isOneToOne: false
            referencedRelation: "navigation_tabs"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_items: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string | null
          file_path: string | null
          id: string
          item_type: string
          team_id: string | null
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          item_type: string
          team_id?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          item_type?: string
          team_id?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_tabs: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          is_custom_page: boolean
          is_system: boolean
          is_visible: boolean
          label_en: string
          label_he: string
          tab_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_custom_page?: boolean
          is_system?: boolean
          is_visible?: boolean
          label_en: string
          label_he: string
          tab_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_custom_page?: boolean
          is_system?: boolean
          is_visible?: boolean
          label_en?: string
          label_he?: string
          tab_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          employee_id: string
          full_name: string
          id: string
          is_access_only: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          full_name: string
          id: string
          is_access_only?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          full_name?: string
          id?: string
          is_access_only?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      role_change_logs: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      room_access_entries: {
        Row: {
          approver_id: string | null
          authorized_personnel: string[]
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          reason: string
          room_ids: string[]
          start_date: string
          updated_at: string
        }
        Insert: {
          approver_id?: string | null
          authorized_personnel?: string[]
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          reason: string
          room_ids?: string[]
          start_date: string
          updated_at?: string
        }
        Update: {
          approver_id?: string | null
          authorized_personnel?: string[]
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          reason?: string
          room_ids?: string[]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_access_entries_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "access_approvers"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      token_activity_log: {
        Row: {
          action_type: string
          created_at: string
          created_by: string | null
          id: string
          operator_id: string
          requestor_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          operator_id: string
          requestor_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          operator_id?: string
          requestor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_activity_log_requestor_id_fkey"
            columns: ["requestor_id"]
            isOneToOne: false
            referencedRelation: "tokens_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_registry: {
        Row: {
          company: string
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          id_number: string
          phone_number: string
          token_type: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          created_by?: string | null
          full_name: string
          id?: string
          id_number: string
          phone_number: string
          token_type: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          id_number?: string
          phone_number?: string
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      useful_links: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
