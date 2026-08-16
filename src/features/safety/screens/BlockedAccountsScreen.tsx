import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { useBlockedDuos, useUnblockDuo } from "@/src/features/safety/useSafety";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function BlockedAccountsScreen() {
  const { user } = useAuth();
  const query = useBlockedDuos(user?.id);
  const mutation = useUnblockDuo(user?.id);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (query.isPending) return <LoadingView label="Loading blocked accounts…" />;
  if (query.error) return <DuoStateErrorScreen error={query.error} onRetry={query.refetch} />;
  const blockedDuos = query.data ?? [];

  const unblock = async (blockGroupId: string) => {
    setError(null);
    try {
      await mutation.mutateAsync(blockGroupId);
      setConfirmingId(null);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Blocked Accounts" subtitle="Blocks are grouped by the opponent duo action that created them." />
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>FUTURE MATCHING</Text>
        <Text style={styles.copy}>Blocked accounts cannot be matched with any duo containing your account. Unblocking both accounts permits future eligibility but never restores an ended match or conversation.</Text>
      </View>
      {blockedDuos.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>NO BLOCKED ACCOUNTS</Text>
          <Text style={styles.copy}>Safety blocks you create will appear here.</Text>
        </View>
      )}
      {blockedDuos.map((group) => (
        <View key={group.blockGroupId} style={styles.group}>
          <Text style={styles.groupTitle}>{group.blockedDuoName}</Text>
          <Text style={styles.members}>{group.members.map((member) => member.displayName).join(" + ")}</Text>
          <Text style={styles.date}>Blocked {new Date(group.blockedAt).toLocaleDateString()}</Text>
          {confirmingId !== group.blockGroupId && (
            <LobbyButton label="UNBLOCK BOTH ACCOUNTS" onPress={() => setConfirmingId(group.blockGroupId)} />
          )}
          {confirmingId === group.blockGroupId && (
            <View style={styles.confirm}>
              <Text style={styles.copy}>Allow future matchmaking with either of these accounts? The old match and chat remain closed.</Text>
              <View style={styles.actions}>
                <LobbyButton label="CONFIRM UNBLOCK" disabled={mutation.isPending} onPress={() => void unblock(group.blockGroupId)} />
                <LobbyButton label="KEEP BLOCKED" disabled={mutation.isPending} onPress={() => setConfirmingId(null)} />
              </View>
            </View>
          )}
        </View>
      ))}
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <LobbyButton label="BACK TO ACCOUNT" disabled={mutation.isPending} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  notice: { gap: 7, borderWidth: 1, borderColor: lobbyColors.cyan, borderRadius: 12, backgroundColor: "#081E36", padding: 14 },
  noticeTitle: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1.3 },
  copy: { color: lobbyColors.text, lineHeight: 20 },
  empty: { gap: 7, alignItems: "center", borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 24 },
  emptyTitle: { color: lobbyColors.muted, fontWeight: "900", letterSpacing: 1.3 },
  group: { gap: 9, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 14 },
  groupTitle: { color: lobbyColors.text, fontSize: 18, fontWeight: "900" },
  members: { color: lobbyColors.danger, fontWeight: "800" },
  date: { color: lobbyColors.muted, fontSize: 12 },
  confirm: { gap: 10 },
  actions: { flexDirection: "row", gap: 10 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
