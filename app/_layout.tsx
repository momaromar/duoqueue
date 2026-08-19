import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/src/features/auth/AuthContext";
import { PushNotificationsProvider } from "@/src/features/notifications/PushNotificationsProvider";
import { queryClient } from "@/src/lib/queryClient";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PushNotificationsProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </PushNotificationsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
