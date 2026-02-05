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
      acquisition_channels: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      acquisition_metrics: {
        Row: {
          channel_id: string
          conversions: number
          created_at: string
          id: string
          leads: number
          month: string
          spend: number
        }
        Insert: {
          channel_id: string
          conversions?: number
          created_at?: string
          id?: string
          leads?: number
          month: string
          spend?: number
        }
        Update: {
          channel_id?: string
          conversions?: number
          created_at?: string
          id?: string
          leads?: number
          month?: string
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_metrics_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "acquisition_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          acquisition_channel_id: string | null
          company: string
          country: string
          created_at: string
          email: string
          health_score: number
          id: string
          industry: string
          name: string
          plan_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acquisition_channel_id?: string | null
          company: string
          country: string
          created_at?: string
          email: string
          health_score?: number
          id?: string
          industry: string
          name: string
          plan_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acquisition_channel_id?: string | null
          company?: string
          country?: string
          created_at?: string
          email?: string
          health_score?: number
          id?: string
          industry?: string
          name?: string
          plan_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_acquisition_channel_id_fkey"
            columns: ["acquisition_channel_id"]
            isOneToOne: false
            referencedRelation: "acquisition_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          issued_at: string
          paid_at: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          issued_at?: string
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          issued_at?: string
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_health"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_metrics: {
        Row: {
          created_at: string | null
          failed_payments: number | null
          id: string
          month: string
          refund_amount: number | null
          refunds: number | null
          total_payments: number | null
        }
        Insert: {
          created_at?: string | null
          failed_payments?: number | null
          id?: string
          month: string
          refund_amount?: number | null
          refunds?: number | null
          total_payments?: number | null
        }
        Update: {
          created_at?: string | null
          failed_payments?: number | null
          id?: string
          month?: string
          refund_amount?: number | null
          refunds?: number | null
          total_payments?: number | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          name: string
          price_monthly: number
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          name: string
          price_monthly: number
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          name?: string
          price_monthly?: number
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          event_date: string
          event_type: string
          id: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          event_date?: string
          event_type: string
          id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          event_date?: string
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_health"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          api_calls: number
          created_at: string
          customer_id: string
          feature_usage: Json | null
          id: string
          logins: number
          month: string
        }
        Insert: {
          api_calls?: number
          created_at?: string
          customer_id: string
          feature_usage?: Json | null
          id?: string
          logins?: number
          month: string
        }
        Update: {
          api_calls?: number
          created_at?: string
          customer_id?: string
          feature_usage?: Json | null
          id?: string
          logins?: number
          month?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_metrics_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_health"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_acquisition_performance: {
        Row: {
          channel_name: string | null
          conversion_rate: number | null
          cost_per_acquisition: number | null
          total_conversions: number | null
          total_leads: number | null
          total_spend: number | null
        }
        Relationships: []
      }
      v_customer_health: {
        Row: {
          company: string | null
          country: string | null
          created_at: string | null
          email: string | null
          health_score: number | null
          id: string | null
          industry: string | null
          name: string | null
          plan_name: string | null
          risk_level: string | null
          status: string | null
        }
        Relationships: []
      }
      v_kpi_summary: {
        Row: {
          active_customers: number | null
          arr: number | null
          cac: number | null
          churn_rate: number | null
          churned_customers: number | null
          mrr: number | null
          new_customers: number | null
          total_customers: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_mrr_movement: {
        Row: {
          churned_mrr: number | null
          contraction_mrr: number | null
          expansion_mrr: number | null
          new_mrr: number | null
        }
        Relationships: []
      }
      v_revenue_by_plan: {
        Row: {
          customer_count: number | null
          monthly_revenue: number | null
          percentage: number | null
          plan_name: string | null
          price_monthly: number | null
        }
        Relationships: []
      }
      v_revenue_over_time: {
        Row: {
          invoice_count: number | null
          month: string | null
          paid_count: number | null
          revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
