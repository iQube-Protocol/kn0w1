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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blak_qubes: {
        Row: {
          Address: string | null
          Age: string | null
          "BTC-Public-Key": string
          "Chain-IDs": string[]
          "Characters-Owned": string | null
          created_at: string
          "Digital-Comics-Owned": string | null
          "Discord-Handle": string | null
          Email: string
          "EVM-Public-Key": string
          "Facebook-ID": string | null
          "First-Name": string | null
          "GitHub-Handle": string | null
          id: string
          "Instagram-Handle": string | null
          "KNYT-Cards-Owned": string | null
          "KNYT-COYN-Owned": string | null
          "KNYT-ID": string | null
          "KNYT-Posters-Owned": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string
          "Metaiye-Shares-Owned": string | null
          "MetaKeep-Public-Key": string | null
          "Motion-Comics-Owned": string | null
          "OM-Member-Since": string | null
          "OM-Tier-Status": string | null
          "Paper-Comics-Owned": string | null
          "Phone-Number": string | null
          Profession: string
          "Qrypto-ID": string | null
          "Telegram-Handle": string | null
          "ThirdWeb-Public-Key": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[]
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[]
          "Web3-Interests": string[]
          "YouTube-ID": string | null
        }
        Insert: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string
          "Chain-IDs"?: string[]
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string
          "EVM-Public-Key"?: string
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[]
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest"?: string[]
          "Web3-Interests"?: string[]
          "YouTube-ID"?: string | null
        }
        Update: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string
          "Chain-IDs"?: string[]
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string
          "EVM-Public-Key"?: string
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[]
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[]
          "Web3-Interests"?: string[]
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          conversation_type: string
          created_at: string
          id: string
          included_interaction_ids: string[]
          summary_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_type: string
          created_at?: string
          id?: string
          included_interaction_ids?: string[]
          summary_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          id?: string
          included_interaction_ids?: string[]
          summary_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_batches: {
        Row: {
          batch_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          emails_failed: number
          emails_sent: number
          id: string
          started_at: string | null
          status: string
          total_emails: number
        }
        Insert: {
          batch_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          emails_failed?: number
          emails_sent?: number
          id?: string
          started_at?: string | null
          status?: string
          total_emails: number
        }
        Update: {
          batch_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          emails_failed?: number
          emails_sent?: number
          id?: string
          started_at?: string | null
          status?: string
          total_emails?: number
        }
        Relationships: []
      }
      invited_users: {
        Row: {
          batch_id: string | null
          completed_at: string | null
          email: string
          email_sent: boolean
          email_sent_at: string | null
          expires_at: string
          id: string
          invitation_token: string
          invited_at: string
          invited_by: string | null
          persona_data: Json
          persona_type: string
          send_attempts: number
          signup_completed: boolean
        }
        Insert: {
          batch_id?: string | null
          completed_at?: string | null
          email: string
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string | null
          persona_data: Json
          persona_type: string
          send_attempts?: number
          signup_completed?: boolean
        }
        Update: {
          batch_id?: string | null
          completed_at?: string | null
          email?: string
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string | null
          persona_data?: Json
          persona_type?: string
          send_attempts?: number
          signup_completed?: boolean
        }
        Relationships: []
      }
      knyt_persona_rewards: {
        Row: {
          created_at: string
          data_completed: boolean | null
          id: string
          linkedin_connected: boolean | null
          metamask_connected: boolean | null
          reward_amount: number | null
          reward_claimed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_completed?: boolean | null
          id?: string
          linkedin_connected?: boolean | null
          metamask_connected?: boolean | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_completed?: boolean | null
          id?: string
          linkedin_connected?: boolean | null
          metamask_connected?: boolean | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knyt_personas: {
        Row: {
          Address: string | null
          Age: string | null
          "BTC-Public-Key": string | null
          "Chain-IDs": string[] | null
          "Characters-Owned": string | null
          created_at: string
          "Digital-Comics-Owned": string | null
          "Discord-Handle": string | null
          Email: string | null
          "EVM-Public-Key": string | null
          "Facebook-ID": string | null
          "First-Name": string | null
          id: string
          "Instagram-Handle": string | null
          "KNYT-Cards-Owned": string | null
          "KNYT-COYN-Owned": string | null
          "KNYT-ID": string | null
          "KNYT-Posters-Owned": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string | null
          "Metaiye-Shares-Owned": string | null
          "MetaKeep-Public-Key": string | null
          "Motion-Comics-Owned": string | null
          "OM-Member-Since": string | null
          "OM-Tier-Status": string | null
          "Paper-Comics-Owned": string | null
          "Phone-Number": string | null
          Profession: string | null
          profile_image_url: string | null
          "Telegram-Handle": string | null
          "ThirdWeb-Public-Key": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[] | null
          "Total-Invested": string | null
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[] | null
          "Web3-Interests": string[] | null
          "YouTube-ID": string | null
        }
        Insert: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Total-Invested"?: string | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Update: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Total-Invested"?: string | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      qripto_personas: {
        Row: {
          "BTC-Public-Key": string | null
          "Chain-IDs": string[] | null
          created_at: string
          "Discord-Handle": string | null
          Email: string | null
          "EVM-Public-Key": string | null
          "Facebook-ID": string | null
          "First-Name": string | null
          "GitHub-Handle": string | null
          id: string
          "Instagram-Handle": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string | null
          Profession: string | null
          profile_image_url: string | null
          "Qripto-ID": string | null
          "Telegram-Handle": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[] | null
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[] | null
          "Web3-Interests": string[] | null
          "YouTube-ID": string | null
        }
        Insert: {
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          created_at?: string
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          "Qripto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Update: {
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          created_at?: string
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          "Qripto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connected_at: string
          connection_data: Json | null
          created_at: string
          id: string
          service: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          connection_data?: Json | null
          created_at?: string
          id?: string
          service: string
          user_id: string
        }
        Update: {
          connected_at?: string
          connection_data?: Json | null
          created_at?: string
          id?: string
          service?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          query: string
          response: string
          summarized: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          query: string
          response: string
          summarized?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          query?: string
          response?: string
          summarized?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_name_preferences: {
        Row: {
          created_at: string
          custom_first_name: string | null
          custom_last_name: string | null
          id: string
          invitation_first_name: string | null
          invitation_last_name: string | null
          linkedin_first_name: string | null
          linkedin_last_name: string | null
          name_source: string
          persona_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_first_name?: string | null
          custom_last_name?: string | null
          id?: string
          invitation_first_name?: string | null
          invitation_last_name?: string | null
          linkedin_first_name?: string | null
          linkedin_last_name?: string | null
          name_source: string
          persona_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_first_name?: string | null
          custom_last_name?: string | null
          id?: string
          invitation_first_name?: string | null
          invitation_last_name?: string | null
          linkedin_first_name?: string | null
          linkedin_last_name?: string | null
          name_source?: string
          persona_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          active: boolean
          created_at: string
          device_info: Json | null
          id: string
          session_end: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_info?: Json | null
          id?: string
          session_end?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_info?: Json | null
          id?: string
          session_end?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      invitation_signup_stats: {
        Row: {
          completed_signups: number | null
          conversion_rate_percent: number | null
          emails_sent: number | null
          invitation_date: string | null
          pending_signups: number | null
          persona_type: string | null
          total_invitations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      count_direct_signups: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      extend_invitation_expiration: {
        Args: { email_list?: string[]; extend_days?: number }
        Returns: Json
      }
      get_expiring_invitations: {
        Args: { days_ahead?: number }
        Returns: {
          days_until_expiry: number
          email: string
          expires_at: string
          persona_type: string
        }[]
      }
      get_invitation_by_token: {
        Args: { token_value: string }
        Returns: {
          email: string
          expires_at: string
          id: string
          persona_type: string
          signup_completed: boolean
        }[]
      }
      get_invitation_expiration_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          expiring_soon_3_days: number
          expiring_soon_7_days: number
          expiring_today: number
          total_active: number
          total_expired: number
        }[]
      }
      increment_send_attempts: {
        Args: { target_email: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recover_incomplete_invited_signups: {
        Args: Record<PropertyKey, never>
        Returns: {
          invitation_id: string
          persona_type: string
          recovery_status: string
          user_email: string
          user_id: string
        }[]
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
