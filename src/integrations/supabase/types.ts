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
          affected_line: string | null
          alert_type: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          severity: string
          title: string
        }
        Insert: {
          affected_line?: string | null
          alert_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          severity?: string
          title: string
        }
        Update: {
          affected_line?: string | null
          alert_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      login_logs: {
        Row: {
          display_name: string | null
          email: string | null
          id: string
          ip_address: string | null
          signed_in_at: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          signed_in_at?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          signed_in_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_logs: {
        Row: {
          id: string
          is_valid: boolean | null
          scan_type: string
          scanned_at: string
          station_id: string | null
          ticket_id: string
        }
        Insert: {
          id?: string
          is_valid?: boolean | null
          scan_type: string
          scanned_at?: string
          station_id?: string | null
          ticket_id: string
        }
        Update: {
          id?: string
          is_valid?: boolean | null
          scan_type?: string
          scanned_at?: string
          station_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_logs_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          arrival_time: string
          created_at: string
          crowd_level: string | null
          current_occupancy: number | null
          departure_time: string
          from_station_id: string
          id: string
          is_active: boolean | null
          max_capacity: number | null
          platform: string | null
          service_number: string
          to_station_id: string
          type: string
        }
        Insert: {
          arrival_time: string
          created_at?: string
          crowd_level?: string | null
          current_occupancy?: number | null
          departure_time: string
          from_station_id: string
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          platform?: string | null
          service_number: string
          to_station_id: string
          type: string
        }
        Update: {
          arrival_time?: string
          created_at?: string
          crowd_level?: string | null
          current_occupancy?: number | null
          departure_time?: string
          from_station_id?: string
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          platform?: string | null
          service_number?: string
          to_station_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_from_station_id_fkey"
            columns: ["from_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_to_station_id_fkey"
            columns: ["to_station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          code: string
          created_at: string
          id: string
          latitude: number | null
          line: string
          longitude: number | null
          name: string
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          latitude?: number | null
          line: string
          longitude?: number | null
          name: string
          type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          latitude?: number | null
          line?: string
          longitude?: number | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          from_station: string
          id: string
          mode: string
          price: number
          qr_data: string | null
          status: string
          ticket_code: string
          ticket_type: string
          to_station: string
          user_id: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          from_station: string
          id?: string
          mode: string
          price: number
          qr_data?: string | null
          status?: string
          ticket_code: string
          ticket_type: string
          to_station: string
          user_id: string
          valid_until: string
        }
        Update: {
          created_at?: string
          from_station?: string
          id?: string
          mode?: string
          price?: number
          qr_data?: string | null
          status?: string
          ticket_code?: string
          ticket_type?: string
          to_station?: string
          user_id?: string
          valid_until?: string
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
