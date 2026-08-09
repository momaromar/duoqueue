type PublicEnv = {
  supabaseUrl: string;
  supabaseKey: string;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim();

export let publicEnv: PublicEnv | null = null;
if (supabaseUrl && supabaseKey) {
  publicEnv = { supabaseUrl, supabaseKey };
}

export const missingPublicEnv: string[] = [];
if (!supabaseUrl) missingPublicEnv.push("EXPO_PUBLIC_SUPABASE_URL");
if (!supabaseKey) {
  missingPublicEnv.push("EXPO_PUBLIC_SUPABASE_KEY");
}
