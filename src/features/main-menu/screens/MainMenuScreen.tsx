import { Image } from "expo-image";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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

function memberAccent(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return lobbyColors.memberA;
  return lobbyColors.memberB;
}

function initialFor(displayName: string) {
  const initial = displayName.trim().charAt(0).toUpperCase();
  if (initial) return initial;
  return "?";
}

export function MainMenuScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const profileQuery = useDuoProfileState(user?.id);
  const refetchDuo = duoQuery.refetch;
  const refetchProfile = profileQuery.refetch;
  const [queueMessage, setQueueMessage] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    if (user?.id) {
      void refetchDuo();
      void refetchProfile();
    }
  }, [refetchDuo, refetchProfile, user?.id]));

  if (duoQuery.isPending || profileQuery.isPending) {
    return <LoadingView label="Entering lobby…" />;
  }
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }

  const duo = duoQuery.data.duo;
  const profile = profileQuery.data;
  if (!duo?.profileComplete || !profile.duo.profileComplete) return <Redirect href="/" />;

  const isReady = duo.status === "active"
    && duo.members.length === 2
    && duo.profileComplete;
  let readinessLabel = "CHECK REQUIRED";
  if (isReady) readinessLabel = "READY TO QUEUE";

  const showQueueNotice = () => {
    setQueueMessage(
      "Matchmaking arrives in Phase 7. Your duo has not entered a queue and no ticket was created.",
    );
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
          label="QUEUE"
          detail="FIND ANOTHER DUO"
          accessibilityHint="Explains when matchmaking becomes available"
          onPress={showQueueNotice}
        />
        {queueMessage && (
          <Text accessibilityLiveRegion="polite" style={styles.queueMessage}>{queueMessage}</Text>
        )}
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
  queueMessage: {
    maxWidth: 440,
    color: lobbyColors.text,
    textAlign: "center",
    lineHeight: 20,
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 8,
    backgroundColor: lobbyColors.surface,
    padding: 10,
  },
  menu: { flexDirection: "row", gap: 10 },
});
