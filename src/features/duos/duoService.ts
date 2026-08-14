import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";
import {
  currentDuoStateSchema,
  invitationPreviewSchema,
  normalizeInvitationCode,
  type CreateDuoValues,
  type EditDuoValues,
} from "@/src/features/duos/schemas";

let duoChannelSequence = 0;

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }

  return supabase;
}

function optionalDescription(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export async function getCurrentDuoState() {
  const { data, error } = await requireSupabase().rpc("get_my_duo_state");
  if (error) throw error;
  return currentDuoStateSchema.parse(data);
}

export async function createDuo(values: CreateDuoValues) {
  const { data, error } = await requireSupabase().rpc("create_duo", {
    display_name: values.displayName.trim(),
    duo_name: values.duoName.trim(),
    duo_city: values.city.trim(),
    duo_description: optionalDescription(values.description),
  });
  if (error) throw error;
  return data;
}

export async function getInvitationPreview(invitationCode: string) {
  const { data, error } = await requireSupabase().rpc("get_duo_invitation_preview", {
    invitation_code: normalizeInvitationCode(invitationCode),
  });
  if (error) throw error;
  return invitationPreviewSchema.parse(data);
}

export async function joinDuo(invitationCode: string, displayName: string) {
  const { data, error } = await requireSupabase().rpc("join_duo", {
    invitation_code: normalizeInvitationCode(invitationCode),
    display_name: displayName.trim(),
  });
  if (error) throw error;
  return data;
}

export async function updateFormingDuo(values: EditDuoValues) {
  const { error } = await requireSupabase().rpc("update_my_forming_duo", {
    duo_name: values.duoName.trim(),
    duo_city: values.city.trim(),
    duo_description: optionalDescription(values.description),
  });
  if (error) throw error;
}

export async function cancelInvitation() {
  const { error } = await requireSupabase().rpc("cancel_my_duo_invitation");
  if (error) throw error;
}

export async function regenerateInvitation() {
  const { data, error } = await requireSupabase().rpc(
    "regenerate_my_duo_invitation",
  );
  if (error) throw error;
  return data;
}

export async function deleteIncompleteDuo() {
  const { error } = await requireSupabase().rpc("delete_my_incomplete_duo");
  if (error) throw error;
}

export function subscribeToDuo(duoId: string, onChange: () => void) {
  const client = requireSupabase();
  duoChannelSequence += 1;
  const channel = client
    .channel(`duo:${duoId}:${duoChannelSequence}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "duos", filter: `id=eq.${duoId}` },
      onChange,
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
