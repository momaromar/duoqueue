import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ManagementInput } from "@/src/features/duo-management/components/ManagementInput";
import { disbandActiveDuo } from "@/src/features/duo-management/duoManagementService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoRealtime, useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function DuoMembersScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const duoQuery = useCurrentDuoState(user?.id);
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: disbandActiveDuo });
  useCurrentDuoRealtime(duoQuery.data?.duo?.id, user?.id);

  if (duoQuery.isPending) return <LoadingView label="Loading duo membersâ€¦" />;
  if (duoQuery.error) return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  if (!duoQuery.data.duo) return <Redirect href="/duo-choice" />;
  if (duoQuery.data.duo.status !== "active") return <Redirect href="/waiting-for-friend" />;
  const duo = duoQuery.data.duo;
  const confirmed = confirmation.trim() === duo.name;

  const disband = async () => {
    setActionError(null);
    try {
      await mutation.mutateAsync();
      await queryClient.invalidateQueries();
      router.replace("/duo-choice");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Duo Members" subtitle={duo.name} />
      <View style={styles.memberList}>
        {duo.members.map((member) => (
          <View key={member.userId} style={styles.member}>
            <Text style={styles.memberName}>{member.displayName}</Text>
            <Text style={styles.detail}>{member.role} Â· {member.colorKey} Â· accepted</Text>
          </View>
        ))}
      </View>
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>DISBAND DUO</Text>
        <Text style={styles.warningText}>
          This permanently removes {duo.name} for both members. Active queue tickets are cancelled,
          active matches and conversations are closed, and both accounts return to Duo Choice.
        </Text>
        <Text style={styles.warningText}>This cannot be undone.</Text>
      </View>
      {!confirming && <LobbyButton label="DISBAND DUO" onPress={() => setConfirming(true)} />}
      {confirming && (
        <View style={styles.confirmation}>
          <ManagementInput
            label={`Type ${duo.name} to confirm`}
            value={confirmation}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setConfirmation}
          />
          {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
          <LobbyButton
            label="PERMANENTLY DISBAND"
            disabled={!confirmed || mutation.isPending}
            onPress={() => void disband()}
          />
          <LobbyButton
            label="KEEP DUO"
            disabled={mutation.isPending}
            onPress={() => { setConfirming(false); setConfirmation(""); setActionError(null); }}
          />
        </View>
      )}
      <LobbyButton label="BACK" disabled={mutation.isPending} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  memberList: { gap: 10 },
  member: { gap: 4, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 14 },
  memberName: { color: lobbyColors.text, fontSize: 17, fontWeight: "800" },
  detail: { color: lobbyColors.muted },
  warning: { gap: 8, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 12, backgroundColor: "#2A111A", padding: 16 },
  warningTitle: { color: lobbyColors.danger, fontWeight: "900", letterSpacing: 1.6 },
  warningText: { color: lobbyColors.text, lineHeight: 21 },
  confirmation: { gap: 12 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
