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
    };
    Enums: {
      duo_status: "forming" | "active";
      duo_member_role: "creator" | "member";
      duo_membership_status: "accepted";
      duo_invitation_status: "pending" | "accepted" | "revoked" | "expired";
    };
    CompositeTypes: Record<string, never>;
  };
};
