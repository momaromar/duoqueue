import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/features/auth/AuthContext";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function AccountScreen() {
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  let email = "Authenticated account";
  if (user?.email) email = user.email;

  const submitSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      router.replace("/welcome");
    } catch (error) {
      setSignOutError(getErrorMessage(error));
      setIsSigningOut(false);
    }
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Account" subtitle="Your current DuoQueue session." />
      <View style={styles.panel}>
        <Text style={styles.label}>SIGNED IN AS</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.note}>
          Notification, privacy, safety, and full account controls arrive in their later phases.
        </Text>
      </View>
      {signOutError && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>{signOutError}</Text>
      )}
      <LobbyButton
        label="SIGN OUT"
        detail="END THIS SESSION"
        disabled={isSigningOut}
        accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
        onPress={() => void submitSignOut()}
      />
      <LobbyButton label="BACK TO LOBBY" disabled={isSigningOut} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  panel: {
    gap: 10,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 14,
    backgroundColor: lobbyColors.surface,
    padding: 18,
  },
  label: { color: lobbyColors.cyan, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  email: { color: lobbyColors.text, fontSize: 19, fontWeight: "700" },
  note: { color: lobbyColors.muted, lineHeight: 21 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
