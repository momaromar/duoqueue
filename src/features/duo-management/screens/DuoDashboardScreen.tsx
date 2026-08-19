import { Image } from "expo-image";
import { Redirect, router, useFocusEffect, type Href } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  useCurrentDuoRealtime,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { useMatchmakingState } from "@/src/features/matchmaking/useMatchmakingState";

export function DuoDashboardScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const profileQuery = useDuoProfileState(user?.id);
  const matchmakingQuery = useMatchmakingState(user?.id);
  const refetchDuo = duoQuery.refetch;
  const refetchProfile = profileQuery.refetch;
  const refetchMatchmaking = matchmakingQuery.refetch;
  const duoId = duoQuery.data?.duo?.id;
  useCurrentDuoRealtime(duoId, user?.id);

  useFocusEffect(useCallback(() => {
    void refetchDuo();
    void refetchProfile();
    void refetchMatchmaking();
  }, [refetchDuo, refetchMatchmaking, refetchProfile]));

  if (duoQuery.isPending || profileQuery.isPending || matchmakingQuery.isPending) {
    return <LoadingView label="Loading duo managementâ€¦" />;
  }
  const error = duoQuery.error ?? profileQuery.error ?? matchmakingQuery.error;
  if (error) return <DuoStateErrorScreen error={error} onRetry={() => void duoQuery.refetch()} />;
  const duoState = duoQuery.data;
  const profile = profileQuery.data;
  const matchmaking = matchmakingQuery.data;
  if (!duoState || !profile || !matchmaking) return <LoadingView label="Loading duo managementâ€¦" />;
  if (!duoState.duo) return <Redirect href="/duo-choice" />;
  if (duoState.duo.status !== "active") return <Redirect href="/waiting-for-friend" />;

  const duo = duoState.duo;
  let queueStatus = "READY";
  if (["waiting", "eligible", "matching"].includes(matchmaking.status)) queueStatus = "SEARCHING";
  if (matchmaking.status === "matched") queueStatus = "MATCHED";
  let profileStatus = "incomplete";
  if (duo.profileComplete) profileStatus = "complete";

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title={duo.name} subtitle="Duo management" />
      <View style={styles.statusPanel}>
        <Text style={styles.statusCode}>{queueStatus}</Text>
        <Text style={styles.detail}>{duo.city} Â· {duo.members.length}/2 members</Text>
        <Text style={styles.detail}>Combined profile {profileStatus}</Text>
      </View>
      <View style={styles.members}>
        {profile.members.map((member) => {
          let submissionStatus = "drafting";
          if (member.submittedAt) submissionStatus = "submitted";
          return (
            <View key={member.userId} style={styles.memberCard}>
              {member.imageUrl && (
              <Image source={member.imageUrl} style={styles.image} contentFit="cover" />
              )}
              {!member.imageUrl && (
                <View style={styles.fallback}><Text style={styles.initial}>{member.displayName.charAt(0)}</Text></View>
              )}
              <View style={styles.memberText}>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.detail}>{member.colorKey} Â· {submissionStatus}</Text>
              </View>
            </View>
          );
        })}
      </View>
      {duo.description && <Text style={styles.description}>{duo.description}</Text>}
      <View style={styles.menu}>
        <LobbyButton label="VIEW PROFILE" detail="ANSWERS & IMAGES" onPress={() => router.push("/duo-profile-preview")} />
        <LobbyButton label="EDIT MY ANSWERS" detail="MY THREE PROMPTS" onPress={() => router.push("/duo/edit-contributions")} />
      </View>
      <View style={styles.menu}>
        <LobbyButton label="DUO BASICS" detail="NAME, REGION, DESCRIPTION" onPress={() => router.push("/duo/edit-basics" as Href)} />
        <LobbyButton label="QUEUE PREFERENCES" detail="REGION & FUTURE FILTERS" onPress={() => router.push("/duo/queue-preferences" as Href)} />
      </View>
      <LobbyButton label="MEMBERS & DISBAND" detail="MEMBERSHIP AND TEST RESET" onPress={() => router.push("/duo/members" as Href)} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  statusPanel: { gap: 5, borderWidth: 1, borderColor: lobbyColors.green, borderRadius: 12, backgroundColor: "#09241E", padding: 14 },
  statusCode: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 2 },
  detail: { color: lobbyColors.muted, lineHeight: 19 },
  members: { gap: 10 },
  memberCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 12 },
  image: { width: 56, height: 56, borderRadius: 12 },
  fallback: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: lobbyColors.surfaceRaised },
  initial: { color: lobbyColors.text, fontSize: 23, fontWeight: "900" },
  memberText: { flex: 1, gap: 3 },
  memberName: { color: lobbyColors.text, fontSize: 17, fontWeight: "800" },
  description: { color: lobbyColors.text, lineHeight: 21 },
  menu: { flexDirection: "row", gap: 10 },
});
