import { notificationPreferencesSchema, type NotificationPreferences } from "@/src/features/settings/schemas";
import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

export async function getNotificationPreferences() {
  const { data, error } = await requireSupabase().rpc("get_my_notification_preferences");
  if (error) throw error;
  return notificationPreferencesSchema.parse(data);
}

export async function updateNotificationPreferences(values: NotificationPreferences) {
  const { data, error } = await requireSupabase().rpc(
    "update_my_notification_preferences",
    {
      duo_invitations_enabled: values.duoInvitations,
      queue_status_enabled: values.queueStatus,
      matches_enabled: values.matches,
      messages_enabled: values.messages,
      product_updates_enabled: values.productUpdates,
    },
  );
  if (error) throw error;
  return notificationPreferencesSchema.parse(data);
}
