import { Redirect, router, useFocusEffect, type Href } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  useCurrentDuoRealtime,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { DuoMemberReadiness } from "@/src/features/main-menu/components/DuoMemberReadiness";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { getQueuePresentation } from "@/src/features/main-menu/lobbyReadiness";
import {
  useMatchmakingRealtime,
  useMatchmakingState,
} from "@/src/features/matchmaking/useMatchmakingState";

export function MainMenuScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const profileQuery = useDuoProfileState(user?.id);
  const matchmakingQuery = useMatchmakingState(user?.id);
  const refetchDuo = duoQuery.refetch;
  const refetchProfile = profileQuery.refetch;
  const refetchMatchmaking = matchmakingQuery.refetch;
  useCurrentDuoRealtime(duoQuery.data?.duo?.id, user?.id);
  useMatchmakingRealtime(
    matchmakingQuery.data?.duo?.id,
    user?.id,
    matchmakingQuery.data?.match?.id,
  );

  useFocusEffect(useCallback(() => {
    if (user?.id) {
      void refetchDuo();
      void refetchProfile();
      void refetchMatchmaking();
    }
  }, [refetchDuo, refetchMatchmaking, refetchProfile, user?.id]));

  if (duoQuery.isPending || profileQuery.isPending || matchmakingQuery.isPending) {
    return <LoadingView label="Entering lobby…" />;
  }
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }
  if (matchmakingQuery.error) {
    return <DuoStateErrorScreen error={matchmakingQuery.error} onRetry={matchmakingQuery.refetch} />;
  }

  const duo = duoQuery.data.duo;
  const profile = profileQuery.data;
  const matchmaking = matchmakingQuery.data;
  if (duo?.status !== "active" || !profile.currentMember.submittedAt) {
    return <Redirect href="/" />;
  }

  const isReady = duo.members.length === 2
    && profile.members.length === 2
    && profile.members.every((member) => Boolean(member.submittedAt))
    && duo.profileComplete
    && profile.duo.profileComplete;
  const queue = getQueuePresentation(matchmaking.status, isReady);
  let queueAccessibilityHint = "Opens the shared Supabase matchmaking flow";
  if (queue.disabled) {
    queueAccessibilityHint = "Matchmaking unlocks when both duo members finish onboarding";
  }

  const openQueue = () => {
    if (!isReady) return;
    if (matchmaking.status === "waiting" || matchmaking.status === "eligible" || matchmaking.status === "matching") {
      router.push("/matchmaking/waiting");
      return;
    }
    if (matchmaking.status === "matched") {
      router.push("/matchmaking/matched");
      return;
    }
    router.push("/matchmaking/queue");
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <View style={styles.accountAction}>
        <LobbyButton
          label={profile.currentMember.displayName}
          accessibilityLabel={`Account: ${profile.currentMember.displayName}`}
          accessibilityHint="Opens your account"
          style={styles.accountButton}
          onPress={() => router.push("/(app)/account")}
        />
      </View>

      <View style={styles.queueArea}>
        <LobbyButton
          variant="queue"
          label={queue.label}
          detail={queue.detail}
          disabled={queue.disabled}
          accessibilityHint={queueAccessibilityHint}
          onPress={openQueue}
        />
      </View>

      <View style={styles.menu} accessibilityLabel="Lobby menu">
        <LobbyButton
          label="DUO"
          detail="MANAGE YOUR DUO"
          onPress={() => router.push("/duo" as Href)}
        />
        <LobbyButton
          label="DUO CHATS"
          detail="CONVERSATIONS"
          onPress={() => router.push("/(app)/duo-chats")}
        />
      </View>

      <DuoMemberReadiness members={profile.members} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  accountAction: { alignItems: "flex-end" },
  accountButton: {
    flex: 0,
    maxWidth: "100%",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  queueArea: { alignItems: "center", gap: 12, paddingVertical: 4 },
  menu: { flexDirection: "row", gap: 10 },
});
