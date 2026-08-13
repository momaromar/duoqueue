import { Image } from "expo-image";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import type { MemberColorKey } from "@/src/features/duo-profile/schemas";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import type { MatchmakingPresentationStatus } from "@/src/features/matchmaking/schemas";
import {
  useMatchmakingRealtime,
  useMatchmakingState,
} from "@/src/features/matchmaking/useMatchmakingState";

function memberAccent(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return lobbyColors.memberA;
  return lobbyColors.memberB;
}

function initialFor(displayName: string) {
  const initial = displayName.trim().charAt(0).toUpperCase();
  if (initial) return initial;
  return "?";
}

function queueLabel(status: MatchmakingPresentationStatus) {
  if (status === "waiting" || status === "eligible" || status === "matching") return "RESUME";
  if (status === "matched") return "MATCH FOUND";
  return "QUEUE";
}

function queueDetail(status: MatchmakingPresentationStatus) {
  if (status === "waiting" || status === "eligible" || status === "matching") return "RETURN TO SEARCH";
  if (status === "matched") return "VIEW YOUR MATCH";
  return "FIND ANOTHER DUO";
}

export function MainMenuScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const profileQuery = useDuoProfileState(user?.id);
  const matchmakingQuery = useMatchmakingState(user?.id);
  const refetchDuo = duoQuery.refetch;
  const refetchProfile = profileQuery.refetch;
  const refetchMatchmaking = matchmakingQuery.refetch;
  const matchmakingDuoId = matchmakingQuery.data?.duo?.id;
  useMatchmakingRealtime(matchmakingDuoId, user?.id);

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
  if (!duo?.profileComplete || !profile.duo.profileComplete) return <Redirect href="/" />;

  const isReady = duo.status === "active"
    && duo.members.length === 2
    && duo.profileComplete;
  let readinessLabel = "CHECK REQUIRED";
  if (isReady) readinessLabel = "READY TO QUEUE";
  if (matchmaking.status === "waiting" || matchmaking.status === "eligible" || matchmaking.status === "matching") {
    readinessLabel = "SEARCH IN PROGRESS";
  }
  if (matchmaking.status === "matched") readinessLabel = "MATCH FOUND";

  const openQueue = () => {
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
      <LobbyHeader
        title={profile.duo.name}
        subtitle={`${profile.duo.city} · Both players connected`}
      />

      <View style={styles.members} accessibilityLabel="Duo members">
        {profile.members.map((member) => (
          <View
            key={member.userId}
            style={[styles.memberCard, { borderColor: memberAccent(member.colorKey) }]}
          >
            {member.imageUrl && (
              <Image
                source={member.imageUrl}
                accessibilityLabel={`${member.displayName}'s Duo Profile image`}
                style={styles.memberImage}
                contentFit="cover"
              />
            )}
            {!member.imageUrl && (
              <View style={[styles.imageFallback, { borderColor: memberAccent(member.colorKey) }]}>
                <Text style={styles.initial}>{initialFor(member.displayName)}</Text>
              </View>
            )}
            <View style={styles.memberText}>
              <Text style={styles.memberName}>{member.displayName}</Text>
              <Text style={[styles.memberKey, { color: memberAccent(member.colorKey) }]}>
                {member.colorKey.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.readiness} accessibilityLabel={`Queue status: ${readinessLabel}`}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.readinessTitle}>{readinessLabel}</Text>
        </View>
        <Text style={styles.readinessDetail}>2 / 2 MEMBERS · PROFILE COMPLETE</Text>
      </View>

      <View style={styles.queueArea}>
        <LobbyButton
          variant="queue"
          label={queueLabel(matchmaking.status)}
          detail={queueDetail(matchmaking.status)}
          accessibilityHint="Opens the shared Supabase matchmaking flow"
          onPress={openQueue}
        />
      </View>

      <View style={styles.menu} accessibilityLabel="Lobby menu">
        <LobbyButton
          label="DUO"
          detail="PROFILE & ANSWERS"
          onPress={() => router.push("/duo-profile-preview")}
        />
        <LobbyButton
          label="DUO CHATS"
          detail="CONVERSATIONS"
          onPress={() => router.push("/(app)/duo-chats")}
        />
        <LobbyButton
          label="ACCOUNT"
          detail="SESSION & SIGN OUT"
          onPress={() => router.push("/(app)/account")}
        />
      </View>
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  members: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  memberCard: {
    flex: 1,
    minWidth: 145,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: lobbyColors.surface,
    padding: 10,
  },
  memberImage: { width: 52, height: 52, borderRadius: 8 },
  imageFallback: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: lobbyColors.surfaceRaised,
  },
  initial: { color: lobbyColors.text, fontSize: 22, fontWeight: "900" },
  memberText: { flex: 1, gap: 3 },
  memberName: { color: lobbyColors.text, fontWeight: "800" },
  memberKey: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  readiness: {
    gap: 5,
    borderWidth: 1,
    borderColor: lobbyColors.green,
    borderRadius: 10,
    backgroundColor: "#09241E",
    padding: 12,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: lobbyColors.green },
  readinessTitle: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 1.8 },
  readinessDetail: { color: lobbyColors.muted, fontSize: 12, letterSpacing: 0.8 },
  queueArea: { alignItems: "center", gap: 12, paddingVertical: 4 },
  menu: { flexDirection: "row", gap: 10 },
});
