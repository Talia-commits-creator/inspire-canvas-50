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
  public: {
    Tables: {
      creative_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      creative_skills: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      creator_profile_categories: {
        Row: {
          category_id: string
          created_at: string
          creator_profile_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          creator_profile_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          creator_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profile_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "creative_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_profile_categories_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profile_skills: {
        Row: {
          created_at: string
          creator_profile_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          creator_profile_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          creator_profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profile_skills_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "creative_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          about: string | null
          availability: Database["public"]["Enums"]["creator_availability"]
          created_at: string
          creator_name: string | null
          experience_level: Database["public"]["Enums"]["creator_experience"]
          headline: string
          id: string
          links: Json
          location: string | null
          primary_category_id: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["creator_visibility"]
          website: string | null
          years_experience: number | null
        }
        Insert: {
          about?: string | null
          availability?: Database["public"]["Enums"]["creator_availability"]
          created_at?: string
          creator_name?: string | null
          experience_level?: Database["public"]["Enums"]["creator_experience"]
          headline: string
          id?: string
          links?: Json
          location?: string | null
          primary_category_id?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["creator_visibility"]
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          about?: string | null
          availability?: Database["public"]["Enums"]["creator_availability"]
          created_at?: string
          creator_name?: string | null
          experience_level?: Database["public"]["Enums"]["creator_experience"]
          headline?: string
          id?: string
          links?: Json
          location?: string | null
          primary_category_id?: string | null
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["creator_visibility"]
          website?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "creative_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category_id: string | null
          created_at: string
          creator_profile_id: string
          description: string | null
          external_url: string | null
          id: string
          is_featured: boolean
          media_path: string | null
          media_type: Database["public"]["Enums"]["portfolio_media_type"]
          position: number
          thumbnail_path: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["creator_visibility"]
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          creator_profile_id: string
          description?: string | null
          external_url?: string | null
          id?: string
          is_featured?: boolean
          media_path?: string | null
          media_type: Database["public"]["Enums"]["portfolio_media_type"]
          position?: number
          thumbnail_path?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["creator_visibility"]
        }
        Update: {
          category_id?: string | null
          created_at?: string
          creator_profile_id?: string
          description?: string | null
          external_url?: string | null
          id?: string
          is_featured?: boolean
          media_path?: string | null
          media_type?: Database["public"]["Enums"]["portfolio_media_type"]
          position?: number
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["creator_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          location: string | null
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          location?: string | null
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      reserved_usernames: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      generate_username: { Args: { _seed: string }; Returns: string }
      get_public_creator_profile: { Args: { _username: string }; Returns: Json }
      get_public_portfolio: { Args: { _username: string }; Returns: Json }
      get_public_profile: {
        Args: { _username: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          location: string
          username: string
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_username_available: { Args: { _username: string }; Returns: boolean }
      list_public_creators: { Args: { _limit?: number }; Returns: Json }
    }
    Enums: {
      app_role: "creator" | "client" | "organization" | "admin"
      creator_availability: "available" | "limited" | "unavailable"
      creator_experience:
        | "beginner"
        | "intermediate"
        | "experienced"
        | "professional"
      creator_visibility: "public" | "private"
      portfolio_media_type: "image" | "video" | "audio" | "link"
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
      app_role: ["creator", "client", "organization", "admin"],
      creator_availability: ["available", "limited", "unavailable"],
      creator_experience: [
        "beginner",
        "intermediate",
        "experienced",
        "professional",
      ],
      creator_visibility: ["public", "private"],
      portfolio_media_type: ["image", "video", "audio", "link"],
    },
  },
} as const
