import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";

import {
  duoProfileStateSchema,
  imageRegistrationSchema,
  type ContributionFormValues,
  type DuoProfileStateWithImages,
} from "@/src/features/duo-profile/schemas";
import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";

const BUCKET = "duo-profile-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

async function addSignedImageUrls(state: ReturnType<typeof duoProfileStateSchema.parse>) {
  const client = requireSupabase();
  const members = await Promise.all(state.members.map(async (member) => {
    let imageUrl: string | null = null;
    if (member.imagePath) {
      const { data, error } = await client.storage
        .from(BUCKET)
        .createSignedUrl(member.imagePath, 60 * 60);
      if (!error) imageUrl = data.signedUrl;
    }
    return { ...member, imageUrl };
  }));
  return { ...state, members } satisfies DuoProfileStateWithImages;
}

export async function getDuoProfileState() {
  const { data, error } = await requireSupabase().rpc("get_my_duo_profile_state");
  if (error) throw error;
  if (!data) throw new Error("No current duo profile was found.");
  return addSignedImageUrls(duoProfileStateSchema.parse(data));
}

export async function saveContributions(
  values: ContributionFormValues,
  submitAnswers: boolean,
) {
  const answers = values.answers.map((answer) => ({
    promptId: answer.promptId,
    responseText: answer.responseText.trim(),
  }));
  const { data, error } = await requireSupabase().rpc(
    "save_my_duo_profile_contributions",
    { answers, submit_answers: submitAnswers },
  );
  if (error) throw error;
  return duoProfileStateSchema.parse(data);
}

export async function chooseAndUploadProfileImage(duoId: string, userId: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled) return false;
  const asset = result.assets[0];
  if (!asset.base64) throw new Error("The selected image could not be prepared for upload.");
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new Error("Choose a JPEG smaller than 5 MB.");
  }

  const client = requireSupabase();
  const path = `${duoId}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, decode(asset.base64), { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await client.rpc("set_my_duo_profile_image", {
    image_path: path,
  });
  if (error) {
    await client.storage.from(BUCKET).remove([path]);
    throw error;
  }

  const registration = imageRegistrationSchema.parse(data);
  if (registration.previousPath) {
    await client.storage.from(BUCKET).remove([registration.previousPath]);
  }
  return true;
}

export async function removeProfileImage() {
  const client = requireSupabase();
  const { data, error } = await client.rpc("set_my_duo_profile_image", {
    image_path: null,
  });
  if (error) throw error;
  const registration = imageRegistrationSchema.parse(data);
  if (registration.previousPath) {
    const { error: removalError } = await client.storage
      .from(BUCKET)
      .remove([registration.previousPath]);
    if (removalError) throw removalError;
  }
}
