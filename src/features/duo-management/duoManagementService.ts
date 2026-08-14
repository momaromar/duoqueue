import {
  disbandResultSchema,
  listFromText,
  pendingCleanupSchema,
  queuePreferencesStateSchema,
  type QueuePreferencesFormValues,
} from "@/src/features/duo-management/schemas";
import type { EditDuoValues } from "@/src/features/duos/schemas";
import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";

const PROFILE_IMAGE_BUCKET = "duo-profile-images";

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

function optionalNumber(value: string) {
  if (!value.trim()) return null;
  return Number(value);
}

async function removeDisbandImages(paths: string[]) {
  if (paths.length === 0) return true;
  const client = requireSupabase();
  const { error } = await client.storage.from(PROFILE_IMAGE_BUCKET).remove(paths);
  if (error) return false;
  const { error: finalizeError } = await client.rpc("finalize_my_disband_image_cleanup", {
    image_paths: paths,
  });
  return !finalizeError;
}

export async function getQueuePreferences() {
  const { data, error } = await requireSupabase().rpc("get_my_queue_preferences");
  if (error) throw error;
  return queuePreferencesStateSchema.parse(data);
}

export async function updateQueuePreferences(values: QueuePreferencesFormValues) {
  const { data, error } = await requireSupabase().rpc("update_my_queue_preferences", {
    display_region: values.region.trim(),
    minimum_age: optionalNumber(values.minimumAge),
    maximum_age: optionalNumber(values.maximumAge),
    activity_preferences: listFromText(values.activities),
    availability_windows: listFromText(values.availability),
  });
  if (error) throw error;
  return queuePreferencesStateSchema.parse(data);
}

export async function updateActiveDuoBasics(values: EditDuoValues) {
  const description = values.description.trim() || null;
  const { error } = await requireSupabase().rpc("update_my_duo_basics", {
    duo_name: values.duoName.trim(),
    duo_city: values.city.trim(),
    duo_description: description,
  });
  if (error) throw error;
}

export async function disbandActiveDuo() {
  const client = requireSupabase();
  const { data, error } = await client.rpc("disband_my_duo");
  if (error) throw error;
  const result = disbandResultSchema.parse(data);
  const imagesCleaned = await removeDisbandImages(result.imagePaths);
  return { imagesCleaned };
}

export async function cleanupPendingDisbandImages() {
  const client = requireSupabase();
  const { data, error } = await client.rpc("get_my_pending_disband_image_cleanup");
  if (error) return false;
  const paths = pendingCleanupSchema.parse(data);
  return removeDisbandImages(paths);
}
