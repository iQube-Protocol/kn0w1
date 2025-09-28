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
      agent_branches: {
        Row: {
          agent_site_id: string
          audience: string | null
          created_at: string
          display_name: string
          id: string
          kind: Database["public"]["Enums"]["branch_kind"]
          long_context_md: string | null
          safety_notes_md: string | null
          short_summary: string | null
          system_prompt_template_md: string | null
          tone: string | null
          updated_at: string
          values_json: Json
        }
        Insert: {
          agent_site_id: string
          audience?: string | null
          created_at?: string
          display_name: string
          id?: string
          kind: Database["public"]["Enums"]["branch_kind"]
          long_context_md?: string | null
          safety_notes_md?: string | null
          short_summary?: string | null
          system_prompt_template_md?: string | null
          tone?: string | null
          updated_at?: string
          values_json?: Json
        }
        Update: {
          agent_site_id?: string
          audience?: string | null
          created_at?: string
          display_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["branch_kind"]
          long_context_md?: string | null
          safety_notes_md?: string | null
          short_summary?: string | null
          system_prompt_template_md?: string | null
          tone?: string | null
          updated_at?: string
          values_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_branches_agent_site_id_fkey"
            columns: ["agent_site_id"]
            isOneToOne: false
            referencedRelation: "agent_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_sites: {
        Row: {
          branding_json: Json
          created_at: string
          id: string
          owner_user_id: string
          site_slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          branding_json?: Json
          created_at?: string
          id?: string
          owner_user_id: string
          site_slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          branding_json?: Json
          created_at?: string
          id?: string
          owner_user_id?: string
          site_slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      aigents: {
        Row: {
          agent_kind: Database["public"]["Enums"]["agent_kind"]
          agent_site_id: string
          created_at: string
          id: string
          is_mutable: boolean
          is_system_agent: boolean
          name: string
          runtime_prefs_json: Json
          system_prompt_md: string
          updated_at: string
        }
        Insert: {
          agent_kind?: Database["public"]["Enums"]["agent_kind"]
          agent_site_id: string
          created_at?: string
          id?: string
          is_mutable?: boolean
          is_system_agent?: boolean
          name: string
          runtime_prefs_json?: Json
          system_prompt_md?: string
          updated_at?: string
        }
        Update: {
          agent_kind?: Database["public"]["Enums"]["agent_kind"]
          agent_site_id?: string
          created_at?: string
          id?: string
          is_mutable?: boolean
          is_system_agent?: boolean
          name?: string
          runtime_prefs_json?: Json
          system_prompt_md?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aigents_agent_site_id_fkey"
            columns: ["agent_site_id"]
            isOneToOne: false
            referencedRelation: "agent_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          agent_site_id: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          agent_site_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          agent_site_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          session_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          session_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          session_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          agent_site_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          pillar_id: string | null
          slug: string
          strand: Database["public"]["Enums"]["content_strand"]
          updated_at: string | null
        }
        Insert: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          pillar_id?: string | null
          slug: string
          strand: Database["public"]["Enums"]["content_strand"]
          updated_at?: string | null
        }
        Update: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          pillar_id?: string | null
          slug?: string
          strand?: Database["public"]["Enums"]["content_strand"]
          updated_at?: string | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          accessibility_json: Json
          agent_site_id: string | null
          analytics_json: Json
          category_id: string | null
          completions_count: number | null
          content_qube_id: string | null
          contentqube_id: string | null
          cover_image_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          has_captions: boolean | null
          has_transcript: boolean | null
          id: string
          iqube_policy_json: Json | null
          l2e_cta_label: string | null
          l2e_cta_url: string | null
          l2e_points: number | null
          l2e_quiz_url: string | null
          og_json: Json | null
          owner_id: string
          pillar_id: string | null
          pinned: boolean | null
          publish_at: string | null
          slug: string
          social_embed_html: string | null
          social_source: string | null
          social_url: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          strand: Database["public"]["Enums"]["content_strand"]
          tags: string[] | null
          title: string
          token_qube_ref: string | null
          tokenqube_ref: string | null
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          accessibility_json?: Json
          agent_site_id?: string | null
          analytics_json?: Json
          category_id?: string | null
          completions_count?: number | null
          content_qube_id?: string | null
          contentqube_id?: string | null
          cover_image_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          has_captions?: boolean | null
          has_transcript?: boolean | null
          id?: string
          iqube_policy_json?: Json | null
          l2e_cta_label?: string | null
          l2e_cta_url?: string | null
          l2e_points?: number | null
          l2e_quiz_url?: string | null
          og_json?: Json | null
          owner_id: string
          pillar_id?: string | null
          pinned?: boolean | null
          publish_at?: string | null
          slug: string
          social_embed_html?: string | null
          social_source?: string | null
          social_url?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          strand: Database["public"]["Enums"]["content_strand"]
          tags?: string[] | null
          title: string
          token_qube_ref?: string | null
          tokenqube_ref?: string | null
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          accessibility_json?: Json
          agent_site_id?: string | null
          analytics_json?: Json
          category_id?: string | null
          completions_count?: number | null
          content_qube_id?: string | null
          contentqube_id?: string | null
          cover_image_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          has_captions?: boolean | null
          has_transcript?: boolean | null
          id?: string
          iqube_policy_json?: Json | null
          l2e_cta_label?: string | null
          l2e_cta_url?: string | null
          l2e_points?: number | null
          l2e_quiz_url?: string | null
          og_json?: Json | null
          owner_id?: string
          pillar_id?: string | null
          pinned?: boolean | null
          publish_at?: string | null
          slug?: string
          social_embed_html?: string | null
          social_source?: string | null
          social_url?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          strand?: Database["public"]["Enums"]["content_strand"]
          tags?: string[] | null
          title?: string
          token_qube_ref?: string | null
          tokenqube_ref?: string | null
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
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
      crm_interactions: {
        Row: {
          agent_site_id: string
          data_json: Json
          id: string
          item_id: string | null
          kind: string
          occurred_at: string
          pillar_id: string | null
          profile_id: string | null
          score_delta: number
        }
        Insert: {
          agent_site_id: string
          data_json?: Json
          id?: string
          item_id?: string | null
          kind: string
          occurred_at?: string
          pillar_id?: string | null
          profile_id?: string | null
          score_delta?: number
        }
        Update: {
          agent_site_id?: string
          data_json?: Json
          id?: string
          item_id?: string | null
          kind?: string
          occurred_at?: string
          pillar_id?: string | null
          profile_id?: string | null
          score_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_agent_site_id_fkey"
            columns: ["agent_site_id"]
            isOneToOne: false
            referencedRelation: "agent_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_profiles: {
        Row: {
          agent_site_id: string
          consents_json: Json
          created_at: string
          email: string | null
          handle: string | null
          id: string
          metadata_json: Json
          segments: string[]
          user_id: string | null
        }
        Insert: {
          agent_site_id: string
          consents_json?: Json
          created_at?: string
          email?: string | null
          handle?: string | null
          id?: string
          metadata_json?: Json
          segments?: string[]
          user_id?: string | null
        }
        Update: {
          agent_site_id?: string
          consents_json?: Json
          created_at?: string
          email?: string | null
          handle?: string | null
          id?: string
          metadata_json?: Json
          segments?: string[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_profiles_agent_site_id_fkey"
            columns: ["agent_site_id"]
            isOneToOne: false
            referencedRelation: "agent_sites"
            referencedColumns: ["id"]
          },
        ]
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
      media_assets: {
        Row: {
          caption_path: string | null
          checksum: string | null
          content_item_id: string
          created_at: string | null
          duration_seconds: number | null
          external_url: string | null
          filesize_bytes: number | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["content_type"]
          mime_type: string | null
          oembed_html: string | null
          storage_path: string | null
          transcript_path: string | null
          width: number | null
        }
        Insert: {
          caption_path?: string | null
          checksum?: string | null
          content_item_id: string
          created_at?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          filesize_bytes?: number | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["content_type"]
          mime_type?: string | null
          oembed_html?: string | null
          storage_path?: string | null
          transcript_path?: string | null
          width?: number | null
        }
        Update: {
          caption_path?: string | null
          checksum?: string | null
          content_item_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          filesize_bytes?: number | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["content_type"]
          mime_type?: string | null
          oembed_html?: string | null
          storage_path?: string | null
          transcript_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      media_content: {
        Row: {
          category: string
          content_type: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          duration: number | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          metadata: Json | null
          reward_points: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          metadata?: Json | null
          reward_points?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          metadata?: Json | null
          reward_points?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_pillars: {
        Row: {
          agent_site_id: string
          contentqube_id: string | null
          created_at: string
          default_utilities_json: Json
          display_name: string
          goals_json: Json
          id: string
          iqube_policy_json: Json | null
          kpis_json: Json
          long_context_md: string | null
          short_summary: string | null
          tokenqube_ref: string | null
          updated_at: string
        }
        Insert: {
          agent_site_id: string
          contentqube_id?: string | null
          created_at?: string
          default_utilities_json?: Json
          display_name: string
          goals_json?: Json
          id?: string
          iqube_policy_json?: Json | null
          kpis_json?: Json
          long_context_md?: string | null
          short_summary?: string | null
          tokenqube_ref?: string | null
          updated_at?: string
        }
        Update: {
          agent_site_id?: string
          contentqube_id?: string | null
          created_at?: string
          default_utilities_json?: Json
          display_name?: string
          goals_json?: Json
          id?: string
          iqube_policy_json?: Json | null
          kpis_json?: Json
          long_context_md?: string | null
          short_summary?: string | null
          tokenqube_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_pillars_agent_site_id_fkey"
            columns: ["agent_site_id"]
            isOneToOne: false
            referencedRelation: "agent_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      mm_super_admins: {
        Row: {
          created_at: string | null
          email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          civic_status: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          level: number | null
          preferences: Json | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          civic_status?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          level?: number | null
          preferences?: Json | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          civic_status?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          level?: number | null
          preferences?: Json | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
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
      social_connections: {
        Row: {
          account_handle: string | null
          connected: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          oauth_meta: Json | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          account_handle?: string | null
          connected?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          oauth_meta?: Json | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          account_handle?: string | null
          connected?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          oauth_meta?: Json | null
          provider?: string
          updated_at?: string | null
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
      user_content_progress: {
        Row: {
          completed_at: string | null
          content_item_id: string
          created_at: string | null
          id: string
          progress_percentage: number | null
          score: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_item_id: string
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_item_id?: string
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_progress_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
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
      user_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string
          id: string
          progress_percentage: number | null
          quiz_scores: Json | null
          rewards_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string
          id?: string
          progress_percentage?: number | null
          quiz_scores?: Json | null
          rewards_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string
          id?: string
          progress_percentage?: number | null
          quiz_scores?: Json | null
          rewards_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "media_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          agent_site_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
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
      utilities_config: {
        Row: {
          agent_site_id: string
          commercial_on: boolean
          commercial_opts_json: Json
          content_creation_on: boolean
          created_at: string
          id: string
          social_on: boolean
          social_opts_json: Json
          teaching_on: boolean
          teaching_opts_json: Json
          updated_at: string
        }
        Insert: {
          agent_site_id: string
          commercial_on?: boolean
          commercial_opts_json?: Json
          content_creation_on?: boolean
          created_at?: string
          id?: string
          social_on?: boolean
          social_opts_json?: Json
          teaching_on?: boolean
          teaching_opts_json?: Json
          updated_at?: string
        }
        Update: {
          agent_site_id?: string
          commercial_on?: boolean
          commercial_opts_json?: Json
          content_creation_on?: boolean
          created_at?: string
          id?: string
          social_on?: boolean
          social_opts_json?: Json
          teaching_on?: boolean
          teaching_opts_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utilities_config_agent_site_id_fkey"
            columns: ["agent_site_id"]
            isOneToOne: true
            referencedRelation: "agent_sites"
            referencedColumns: ["id"]
          },
        ]
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
      has_admin_role: {
        Args: {
          _role: Database["public"]["Enums"]["admin_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_send_attempts: {
        Args: { target_email: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_any_admin: {
        Args: { _user_id: string }
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
      admin_role: "super_admin" | "content_admin" | "social_admin" | "moderator"
      agent_kind: "satoshi" | "knyt" | "custom"
      branch_kind: "mythos" | "logos"
      content_status:
        | "draft"
        | "in_review"
        | "scheduled"
        | "published"
        | "archived"
      content_strand: "civic_readiness" | "learn_to_earn"
      content_type:
        | "audio"
        | "video"
        | "text"
        | "pdf"
        | "image"
        | "mixed"
        | "social"
      media_kind: "audio" | "video" | "text" | "pdf" | "image" | "mixed"
      role_type:
        | "super_admin"
        | "content_admin"
        | "social_admin"
        | "moderator"
        | "member"
      status_type:
        | "draft"
        | "in_review"
        | "scheduled"
        | "published"
        | "archived"
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
      admin_role: ["super_admin", "content_admin", "social_admin", "moderator"],
      agent_kind: ["satoshi", "knyt", "custom"],
      branch_kind: ["mythos", "logos"],
      content_status: [
        "draft",
        "in_review",
        "scheduled",
        "published",
        "archived",
      ],
      content_strand: ["civic_readiness", "learn_to_earn"],
      content_type: [
        "audio",
        "video",
        "text",
        "pdf",
        "image",
        "mixed",
        "social",
      ],
      media_kind: ["audio", "video", "text", "pdf", "image", "mixed"],
      role_type: [
        "super_admin",
        "content_admin",
        "social_admin",
        "moderator",
        "member",
      ],
      status_type: ["draft", "in_review", "scheduled", "published", "archived"],
    },
  },
} as const
