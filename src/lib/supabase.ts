import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

import { publicEnv } from "@/src/lib/env";

export let supabase: SupabaseClient | null = null;

if (publicEnv) {
  let nativeStorage = {};
  if (Platform.OS !== "web") nativeStorage = { storage: AsyncStorage };

  supabase = createClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    auth: {
      ...nativeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });
}
