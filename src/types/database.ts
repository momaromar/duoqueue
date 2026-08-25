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
        Row: { id: string; match_id: string; created_at: string; last_message_at: string | null; status: "active" | "closed"; closed_at: string | null; closed_by_block_group_id: string | null };
        Insert: { id?: string; match_id: string; created_at?: string; last_message_at?: string | null; status?: "active" | "closed"; closed_at?: string | null; closed_by_block_group_id?: string | null };
        Update: { last_message_at?: string | null; status?: "active" | "closed"; closed_at?: string | null; closed_by_block_group_id?: string | null };
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
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string | null;
          message_type: "text" | "system";
          body: string;
          event_key: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          conversation_id: string;
          sender_id?: string | null;
          message_type: "text" | "system";
          body: string;
          event_key?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      game_sessions: {
        Row: {
          id: string;
          conversation_id: string;
          game_type: "tic_tac_toe";
          preset_key: "classic" | "quick" | "extended" | "large";
          board_size: number;
          win_length: number;
          status: "pending" | "active" | "won" | "draw" | "resigned" | "declined" | "cancelled" | "closed";
          challenger_user_id: string;
          invited_user_id: string;
          next_turn_user_id: string | null;
          winner_user_id: string | null;
          state_version: number;
          winning_line: Json;
          previous_game_id: string | null;
          invited_at: string;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          conversation_id: string;
          game_type?: "tic_tac_toe";
          preset_key: "classic" | "quick" | "extended" | "large";
          board_size: number;
          win_length: number;
          status?: "pending" | "active" | "won" | "draw" | "resigned" | "declined" | "cancelled" | "closed";
          challenger_user_id: string;
          invited_user_id: string;
          next_turn_user_id?: string | null;
          winner_user_id?: string | null;
          state_version?: number;
          winning_line?: Json;
          previous_game_id?: string | null;
          invited_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["game_sessions"]["Insert"]>;
        Relationships: [];
      };
      game_players: {
        Row: {
          game_id: string;
          user_id: string;
          mark: "X" | "O";
          player_order: 1 | 2;
          accepted_at: string;
          resigned_at: string | null;
        };
        Insert: {
          game_id: string;
          user_id: string;
          mark: "X" | "O";
          player_order: 1 | 2;
          accepted_at?: string;
          resigned_at?: string | null;
        };
        Update: { resigned_at?: string | null };
        Relationships: [];
      };
      game_moves: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          move_number: number;
          row_index: number;
          column_index: number;
          mark: "X" | "O";
          resulting_state_version: number;
          created_at: string;
        };
        Insert: {
          id: string;
          game_id: string;
          user_id: string;
          move_number: number;
          row_index: number;
          column_index: number;
          mark: "X" | "O";
          resulting_state_version: number;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          duo_invitations_enabled: boolean;
          queue_status_enabled: boolean;
          matches_enabled: boolean;
          messages_enabled: boolean;
          product_updates_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          duo_invitations_enabled?: boolean;
          queue_status_enabled?: boolean;
          matches_enabled?: boolean;
          messages_enabled?: boolean;
          product_updates_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          duo_invitations_enabled?: boolean;
          queue_status_enabled?: boolean;
          matches_enabled?: boolean;
          messages_enabled?: boolean;
          product_updates_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_device_installations: {
        Row: {
          id: string;
          user_id: string;
          installation_id: string;
          expo_push_token: string;
          platform: "android" | "ios";
          enabled: boolean;
          disabled_reason: string | null;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          installation_id: string;
          expo_push_token: string;
          platform: "android" | "ios";
          enabled?: boolean;
          disabled_reason?: string | null;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_device_installations"]["Insert"]>;
        Relationships: [];
      };
      push_notification_outbox: {
        Row: {
          id: string;
          recipient_user_id: string;
          category: "duo_invitations" | "queue_status" | "matches" | "messages" | "product_updates";
          dedupe_key: string;
          title: string;
          body: string;
          data: Json;
          status: "pending" | "processing" | "sent" | "suppressed" | "failed";
          attempt_count: number;
          available_at: string;
          locked_at: string | null;
          sent_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipient_user_id: string;
          category: "duo_invitations" | "queue_status" | "matches" | "messages" | "product_updates";
          dedupe_key: string;
          title: string;
          body: string;
          data?: Json;
          status?: "pending" | "processing" | "sent" | "suppressed" | "failed";
          attempt_count?: number;
          available_at?: string;
          locked_at?: string | null;
          sent_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_notification_outbox"]["Insert"]>;
        Relationships: [];
      };
      push_delivery_attempts: {
        Row: {
          id: string;
          outbox_id: string;
          installation_id: string | null;
          expo_push_token: string;
          expo_ticket_id: string | null;
          status: "ticketed" | "delivered" | "failed";
          error_code: string | null;
          error_detail: string | null;
          receipt_checked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outbox_id: string;
          installation_id?: string | null;
          expo_push_token: string;
          expo_ticket_id?: string | null;
          status?: "ticketed" | "delivered" | "failed";
          error_code?: string | null;
          error_detail?: string | null;
          receipt_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_delivery_attempts"]["Insert"]>;
        Relationships: [];
      };
      safety_block_groups: {
        Row: { id: string; blocker_user_id: string; source_match_id: string | null; blocked_duo_id: string; blocked_duo_name: string; blocked_members: Json; created_at: string; revoked_at: string | null };
        Insert: { id?: string; blocker_user_id: string; source_match_id?: string | null; blocked_duo_id: string; blocked_duo_name: string; blocked_members: Json; created_at?: string; revoked_at?: string | null };
        Update: { revoked_at?: string | null };
        Relationships: [];
      };
      blocks: {
        Row: { id: string; block_group_id: string; blocker_user_id: string; blocked_user_id: string; created_at: string; revoked_at: string | null };
        Insert: { id?: string; block_group_id: string; blocker_user_id: string; blocked_user_id: string; created_at?: string; revoked_at?: string | null };
        Update: { revoked_at?: string | null };
        Relationships: [];
      };
      reports: {
        Row: { id: string; reporter_user_id: string; subject_type: "user" | "duo" | "conversation" | "message"; subject_id: string; reason: "harassment" | "hate" | "sexual_content" | "threats_or_violence" | "spam_or_scam" | "underage_concern" | "privacy_violation" | "other"; details: string | null; status: string; evidence_snapshot: Json; created_at: string; updated_at: string };
        Insert: { id: string; reporter_user_id: string; subject_type: "user" | "duo" | "conversation" | "message"; subject_id: string; reason: "harassment" | "hate" | "sexual_content" | "threats_or_violence" | "spam_or_scam" | "underage_concern" | "privacy_violation" | "other"; details?: string | null; status?: string; evidence_snapshot: Json; created_at?: string; updated_at?: string };
        Update: { status?: string; updated_at?: string };
        Relationships: [];
      };
      conversation_participant_history: {
        Row: { conversation_id: string; user_id: string; joined_at: string; last_read_at: string | null; archived_at: string; archive_reason: string };
        Insert: { conversation_id: string; user_id: string; joined_at: string; last_read_at?: string | null; archived_at?: string; archive_reason?: string };
        Update: never;
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
      get_conversation_messages: {
        Args: {
          conversation_id: string;
          before_created_at?: string | null;
          before_message_id?: string | null;
          page_size?: number;
        };
        Returns: Json;
      };
      send_conversation_message: {
        Args: { conversation_id: string; client_message_id: string; body: string };
        Returns: Json;
      };
      mark_conversation_read: {
        Args: { conversation_id: string };
        Returns: Json;
      };
      get_my_conversation_summary: {
        Args: { conversation_id: string };
        Returns: Json;
      };
      get_my_notification_preferences: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      update_my_notification_preferences: {
        Args: {
          duo_invitations_enabled: boolean;
          queue_status_enabled: boolean;
          matches_enabled: boolean;
          messages_enabled: boolean;
          product_updates_enabled: boolean;
        };
        Returns: Json;
      };
      register_my_push_token: {
        Args: {
          installation_id: string;
          expo_push_token: string;
          device_platform: string;
        };
        Returns: Json;
      };
      disable_my_push_installation: {
        Args: { installation_id: string };
        Returns: Json;
      };
      get_reportable_safety_subject: {
        Args: { subject_type: string; subject_id: string };
        Returns: Json;
      };
      submit_safety_report: {
        Args: { report_id: string; subject_type: string; subject_id: string; report_reason: string; report_details?: string | null };
        Returns: Json;
      };
      block_current_opponent_duo: {
        Args: { source_match_id: string };
        Returns: Json;
      };
      get_my_blocked_duos: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      unblock_duo_block_group: {
        Args: { block_group_id: string };
        Returns: Json;
      };
      get_conversation_game: {
        Args: { conversation_id: string };
        Returns: Json;
      };
      create_game_invitation: {
        Args: {
          conversation_id: string;
          client_game_id: string;
          preset_key: "classic" | "quick" | "extended" | "large";
          invited_user_id: string;
        };
        Returns: Json;
      };
      accept_game_invitation: {
        Args: { game_id: string; expected_state_version: number };
        Returns: Json;
      };
      decline_game_invitation: {
        Args: { game_id: string; expected_state_version: number };
        Returns: Json;
      };
      cancel_game_invitation: {
        Args: { game_id: string; expected_state_version: number };
        Returns: Json;
      };
      submit_game_move: {
        Args: {
          game_id: string;
          client_move_id: string;
          expected_state_version: number;
          row_index: number;
          column_index: number;
        };
        Returns: Json;
      };
      resign_game: {
        Args: { game_id: string; expected_state_version: number };
        Returns: Json;
      };
      create_game_rematch: {
        Args: {
          previous_game_id: string;
          client_game_id: string;
          expected_state_version: number;
        };
        Returns: Json;
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
