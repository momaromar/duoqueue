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
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      duos: {
        Row: {
          id: string;
          name: string;
          city: string;
          description: string | null;
          created_by: string;
          status: Database["public"]["Enums"]["duo_status"];
          profile_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          description?: string | null;
          created_by: string;
          status?: Database["public"]["Enums"]["duo_status"];
          profile_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["duos"]["Insert"]>;
        Relationships: [];
      };
      duo_members: {
        Row: {
          duo_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["duo_member_role"];
          membership_status: Database["public"]["Enums"]["duo_membership_status"];
          member_color_key: string;
          invited_by: string | null;
          joined_at: string;
          created_at: string;
          profile_submitted_at: string | null;
          profile_image_path: string | null;
        };
        Insert: {
          duo_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["duo_member_role"];
          membership_status?: Database["public"]["Enums"]["duo_membership_status"];
          member_color_key: string;
          invited_by?: string | null;
          joined_at?: string;
          created_at?: string;
          profile_submitted_at?: string | null;
          profile_image_path?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["duo_members"]["Insert"]>;
        Relationships: [];
      };
      duo_invitations: {
        Row: {
          id: string;
          duo_id: string;
          code: string;
          status: Database["public"]["Enums"]["duo_invitation_status"];
          created_by: string;
          accepted_by: string | null;
          expires_at: string;
          accepted_at: string | null;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          duo_id: string;
          code: string;
          status?: Database["public"]["Enums"]["duo_invitation_status"];
          created_by: string;
          accepted_by?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["duo_invitations"]["Insert"]>;
        Relationships: [];
      };
      duo_profile_prompts: {
        Row: {
          id: number;
          prompt_key: string;
          prompt_text: string;
          input_type: string;
          is_required: boolean;
          sort_order: number;
          assigned_color_key: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          prompt_key: string;
          prompt_text: string;
          input_type?: string;
          is_required?: boolean;
          sort_order: number;
          assigned_color_key: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["duo_profile_prompts"]["Insert"]>;
        Relationships: [];
      };
      duo_profile_contributions: {
        Row: {
          id: string;
          duo_id: string;
          user_id: string;
          prompt_id: number;
          response_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          duo_id: string;
          user_id: string;
          prompt_id: number;
          response_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["duo_profile_contributions"]["Insert"]>;
        Relationships: [];
      };
      queue_preferences: {
        Row: {
          duo_id: string;
          region: string;
          region_key: string;
          minimum_age: number | null;
          maximum_age: number | null;
          activity_preferences: Json;
          availability_windows: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          duo_id: string;
          region: string;
          region_key: string;
          minimum_age?: number | null;
          maximum_age?: number | null;
          activity_preferences?: Json;
          availability_windows?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["queue_preferences"]["Insert"]>;
        Relationships: [];
      };
      matchmaking_tickets: {
        Row: {
          id: string;
          duo_id: string;
          created_by_user_id: string;
          status: Database["public"]["Enums"]["matchmaking_ticket_status"];
          region_key: string;
          queued_at: string;
          eligible_at: string;
          expires_at: string;
          matched_at: string | null;
          cancelled_at: string | null;
          cancelled_by_user_id: string | null;
          match_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          duo_id: string;
          created_by_user_id: string;
          status?: Database["public"]["Enums"]["matchmaking_ticket_status"];
          region_key: string;
          queued_at: string;
          eligible_at: string;
          expires_at: string;
          matched_at?: string | null;
          cancelled_at?: string | null;
          cancelled_by_user_id?: string | null;
          match_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matchmaking_tickets"]["Insert"]>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          status: Database["public"]["Enums"]["match_status"];
          matched_at: string;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status?: Database["public"]["Enums"]["match_status"];
          matched_at?: string;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [];
      };
      match_duos: {
        Row: { match_id: string; duo_id: string; side: "a" | "b"; active: boolean; created_at: string };
        Insert: { match_id: string; duo_id: string; side: "a" | "b"; active?: boolean; created_at?: string };
        Update: { active?: boolean };
        Relationships: [];
      };
      conversations: {
        Row: { id: string; match_id: string; created_at: string; last_message_at: string | null };
        Insert: { id?: string; match_id: string; created_at?: string; last_message_at?: string | null };
        Update: { last_message_at?: string | null };
        Relationships: [];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
          muted_until: string | null;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string | null;
          muted_until?: string | null;
        };
        Update: { last_read_at?: string | null; muted_until?: string | null };
        Relationships: [];
      };
      duo_disband_image_cleanup: {
        Row: { object_path: string; authorized_user_id: string; created_at: string };
        Insert: { object_path: string; authorized_user_id: string; created_at?: string };
        Update: { authorized_user_id?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_duo_state: { Args: Record<PropertyKey, never>; Returns: Json };
      create_duo: {
        Args: {
          display_name: string;
          duo_name: string;
          duo_city: string;
          duo_description?: string | null;
        };
        Returns: string;
      };
      get_duo_invitation_preview: {
        Args: { invitation_code: string };
        Returns: Json;
      };
      join_duo: {
        Args: { invitation_code: string; display_name: string };
        Returns: string;
      };
      update_my_forming_duo: {
        Args: {
          duo_name: string;
          duo_city: string;
          duo_description?: string | null;
        };
        Returns: undefined;
      };
      cancel_my_duo_invitation: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      regenerate_my_duo_invitation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      delete_my_incomplete_duo: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_my_duo_profile_state: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      save_my_duo_profile_contributions: {
        Args: { answers: Json; submit_answers?: boolean };
        Returns: Json;
      };
      set_my_duo_profile_image: {
        Args: { image_path: string | null };
        Returns: Json;
      };
      get_my_matchmaking_state: { Args: Record<PropertyKey, never>; Returns: Json };
      enter_matchmaking: { Args: Record<PropertyKey, never>; Returns: Json };
      cancel_my_matchmaking_ticket: { Args: Record<PropertyKey, never>; Returns: Json };
      try_match_my_duo: { Args: Record<PropertyKey, never>; Returns: Json };
      get_my_queue_preferences: { Args: Record<PropertyKey, never>; Returns: Json };
      update_my_queue_preferences: {
        Args: {
          display_region: string;
          minimum_age?: number | null;
          maximum_age?: number | null;
          activity_preferences?: Json;
          availability_windows?: Json;
        };
        Returns: Json;
      };
      update_my_duo_basics: {
        Args: { duo_name: string; duo_city: string; duo_description?: string | null };
        Returns: undefined;
      };
      disband_my_duo: { Args: Record<PropertyKey, never>; Returns: Json };
      get_my_pending_disband_image_cleanup: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      finalize_my_disband_image_cleanup: {
        Args: { image_paths: string[] };
        Returns: undefined;
      };
    };
    Enums: {
      duo_status: "forming" | "active";
      duo_member_role: "creator" | "member";
      duo_membership_status: "accepted";
      duo_invitation_status: "pending" | "accepted" | "revoked" | "expired";
      matchmaking_ticket_status:
        | "waiting"
        | "eligible"
        | "matching"
        | "matched"
        | "cancelled"
        | "expired"
        | "failed";
      match_status: "active" | "ended";
    };
    CompositeTypes: Record<string, never>;
  };
};
