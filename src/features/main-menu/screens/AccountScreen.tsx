import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

function formatAccountDate(value: string | undefined) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function AccountScreen() {
  const { signOut, user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const refetchDuo = duoQuery.refetch;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    void refetchDuo();
  }, [refetchDuo]));

  if (duoQuery.isPending) return <LoadingView label="Loading account…" />;
  if (duoQuery.error) return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;

  const duo = duoQuery.data?.duo;
  const email = user?.email ?? "Authenticated account";
  let verification = "Not verified";
  if (user?.email_confirmed_at) verification = "Verified";

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
      <LobbyHeader showBack title="Account" subtitle="Your account, duo, and saved preferences." />
      <View style={styles.panel}>
        <Text style={styles.label}>ACCOUNT</Text>
        <Detail label="Email" value={email} />
        <Detail label="Email status" value={verification} />
        <Detail label="Created" value={formatAccountDate(user?.created_at)} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>CURRENT DUO</Text>
        <Detail label="Name" value={duo?.name ?? "No active duo"} />
        <Detail label="Region" value={duo?.city ?? "Unavailable"} />
        <Detail label="Members" value={duo?.members.map((member) => member.displayName).join(" + ") ?? "Unavailable"} />
      </View>
      <View style={styles.menuRow}>
        <LobbyButton label="NOTIFICATIONS" detail="SAVED PREFERENCES" disabled={isSigningOut} onPress={() => router.push("/settings/notifications" as Href)} />
      </View>
      <LobbyButton label="CHANGE PASSWORD" detail="VERIFY BY EMAIL CODE" disabled={isSigningOut} onPress={() => router.push("/settings/change-password" as Href)} />
      <View style={styles.privacyPanel}>
        <Text style={styles.privacyTitle}>PRIVACY & SAFETY</Text>
        <Text style={styles.note}>Your authentication email stays private. Reports preserve relevant match context for trusted review, and account-level blocks can be managed below.</Text>
      </View>
      <LobbyButton label="BLOCKED ACCOUNTS" detail="REVIEW OR UNBLOCK GROUPS" disabled={isSigningOut} onPress={() => router.push("/safety/blocked" as Href)} />
      <View style={styles.menuRow}>
        <LobbyButton label="GUIDELINES" detail="18+ COMMUNITY RULES" disabled={isSigningOut} onPress={() => router.push("/legal/community-guidelines" as Href)} />
        <LobbyButton label="PRIVACY" detail="DATA SUMMARY" disabled={isSigningOut} onPress={() => router.push("/legal/privacy" as Href)} />
        <LobbyButton label="TERMS" detail="MVP CONDITIONS" disabled={isSigningOut} onPress={() => router.push("/legal/terms" as Href)} />
      </View>
      {signOutError && <Text accessibilityLiveRegion="polite" style={styles.error}>{signOutError}</Text>}
      <LobbyButton label="SIGN OUT" detail="END THIS SESSION" disabled={isSigningOut} accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }} onPress={() => void submitSignOut()} />
    </LobbyScreen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  panel: { gap: 10, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 14, backgroundColor: lobbyColors.surface, padding: 18 },
  label: { color: lobbyColors.cyan, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 },
  detailLabel: { color: lobbyColors.muted, lineHeight: 20 },
  detailValue: { flex: 1, color: lobbyColors.text, fontWeight: "700", lineHeight: 20, textAlign: "right" },
  menuRow: { flexDirection: "row", gap: 10 },
  privacyPanel: { gap: 8, borderWidth: 1, borderColor: lobbyColors.magenta, borderRadius: 14, backgroundColor: lobbyColors.surface, padding: 18 },
  privacyTitle: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "900", letterSpacing: 1.6 },
  note: { color: lobbyColors.text, lineHeight: 21 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
