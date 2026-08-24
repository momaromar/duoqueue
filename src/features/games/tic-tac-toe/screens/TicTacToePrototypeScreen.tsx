import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/features/auth/AuthContext";
import { useChatParticipants } from "@/src/features/chat/useChatParticipants";
import { GameBoard } from "@/src/features/games/tic-tac-toe/components/GameBoard";
import { GameSetupPanel } from "@/src/features/games/tic-tac-toe/components/GameSetupPanel";
import { GameStatusPanel, getGameStatusCopy } from "@/src/features/games/tic-tac-toe/components/GameStatusPanel";
import {
  FIXTURE_SCENARIOS,
  acceptLocalInvitation,
  createFixtureState,
  createLocalInvitation,
  submitLocalMove,
  type FixtureScenario,
} from "@/src/features/games/tic-tac-toe/fixtures";
import type { GameParticipant, GamePlayer, GamePresetKey, GameSnapshot } from "@/src/features/games/tic-tac-toe/types";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";

export function TicTacToePrototypeScreen() {
  if (!__DEV__) return <Redirect href="/(app)/duo-chats" />;
  return <DevelopmentGameRoute />;
}

function DevelopmentGameRoute() {
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  let conversationId: string | undefined;
  if (typeof params.conversationId === "string") conversationId = params.conversationId;
  return (
    <MatchmakingDuoGate>
      {(data) => <GameRouteGate {...data} routeConversationId={conversationId} />}
    </MatchmakingDuoGate>
  );
}

function GameRouteGate({ profile, matchmaking, routeConversationId }: MatchmakingGateData & { routeConversationId?: string }) {
  const { user } = useAuth();
  const match = matchmaking.match;
  if (!match || matchmaking.status !== "matched") return <Redirect href="/(app)/duo-chats" />;
  if (!routeConversationId || routeConversationId !== match.conversationId) {
    return <Redirect href="/(app)/duo-chats" />;
  }
  return <AuthorizedPrototype profile={profile} match={match} currentUserId={user?.id} />;
}

type AuthorizedPrototypeProps = {
  profile: MatchmakingGateData["profile"];
  match: NonNullable<MatchmakingGateData["matchmaking"]["match"]>;
  currentUserId?: string;
};

function AuthorizedPrototype({ profile, match, currentUserId }: AuthorizedPrototypeProps) {
  const { participants: chatParticipants, currentParticipant } = useChatParticipants(currentUserId, profile, match);
  const participants: GameParticipant[] = useMemo(() => chatParticipants.map((participant) => ({ ...participant })), [chatParticipants]);
  const [selectedPreset, setSelectedPreset] = useState<GamePresetKey>("classic");
  const [selectedOpponentId, setSelectedOpponentId] = useState(match.opponent.members[0]?.userId ?? "");
  const [fixtureScenario, setFixtureScenario] = useState<FixtureScenario>("setup");
  const [localSnapshot, setLocalSnapshot] = useState<GameSnapshot | null>(null);
  const [localSession, setLocalSession] = useState(false);
  const [previousPlayers, setPreviousPlayers] = useState<GamePlayer[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const fixture = useMemo(
    () => createFixtureState(fixtureScenario, match.conversationId, selectedPreset, participants),
    [fixtureScenario, match.conversationId, participants, selectedPreset],
  );
  let snapshot = fixture.snapshot;
  let viewerUserId = fixture.viewerUserId;
  let optimisticMove = fixture.optimisticMove;
  let unavailable = fixture.unavailable;
  if (localSession) {
    snapshot = localSnapshot;
    viewerUserId = currentUserId ?? participants[0].userId;
    optimisticMove = null;
    unavailable = false;
  }

  useEffect(() => {
    if (!snapshot) return;
    const copy = getGameStatusCopy(snapshot, viewerUserId, localSession);
    AccessibilityInfo.announceForAccessibility(`${copy.title}. ${copy.detail}`);
  }, [localSession, snapshot, viewerUserId]);

  if (!currentUserId || !currentParticipant || participants.length !== 4) {
    return <Redirect href="/(app)/duo-chats" />;
  }

  const opponents = participants.filter((participant) => participant.userId !== currentUserId);
  const startInvitation = () => {
    const challenger = participants.find((participant) => participant.userId === currentUserId);
    const invited = participants.find((participant) => participant.userId === selectedOpponentId);
    if (!challenger || !invited) {
      setActionError("Choose another conversation member first.");
      return;
    }
    setActionError(null);
    setPreviousPlayers([]);
    setLocalSnapshot(createLocalInvitation(match.conversationId, selectedPreset, challenger, invited));
    setLocalSession(true);
  };

  const acceptInvitation = () => {
    if (!localSnapshot) return;
    let accepted = acceptLocalInvitation(localSnapshot);
    if (localSnapshot.previousGameId && previousPlayers.length === 2) {
      const previousX = previousPlayers.find((player) => player.mark === "X");
      const previousO = previousPlayers.find((player) => player.mark === "O");
      if (previousX && previousO) accepted = acceptLocalInvitation(localSnapshot, previousO, previousX);
    }
    setLocalSnapshot(accepted);
  };

  const changePendingStatus = (status: "declined" | "cancelled") => {
    if (!localSnapshot) return;
    setLocalSnapshot({
      ...localSnapshot,
      status,
      stateVersion: localSnapshot.stateVersion + 1,
      updatedAt: new Date().toISOString(),
    });
  };

  const playMove = (row: number, column: number) => {
    if (!localSnapshot) return;
    try {
      setActionError(null);
      setLocalSnapshot(submitLocalMove(localSnapshot, row, column));
    } catch (error) {
      let message = "That local move could not be played.";
      if (error instanceof Error) message = error.message;
      setActionError(message);
    }
  };

  const resign = () => {
    if (!localSnapshot?.nextTurnUserId) return;
    const winner = localSnapshot.players.find((player) => player.userId !== localSnapshot.nextTurnUserId);
    setLocalSnapshot({
      ...localSnapshot,
      status: "resigned",
      nextTurnUserId: null,
      winnerUserId: winner?.userId ?? null,
      stateVersion: localSnapshot.stateVersion + 1,
      updatedAt: new Date().toISOString(),
    });
  };

  const requestRematch = () => {
    if (!localSnapshot || localSnapshot.players.length !== 2) return;
    const requester = localSnapshot.players.find((player) => player.userId === currentUserId) ?? localSnapshot.players[0];
    const invited = localSnapshot.players.find((player) => player.userId !== requester.userId);
    if (!invited) return;
    setPreviousPlayers(localSnapshot.players);
    setLocalSnapshot(createLocalInvitation(
      match.conversationId,
      localSnapshot.presetKey,
      requester,
      invited,
      localSnapshot.id,
    ));
  };

  const returnToSetup = () => {
    setLocalSession(false);
    setLocalSnapshot(null);
    setPreviousPlayers([]);
    setFixtureScenario("setup");
    setActionError(null);
  };

  const selectFixture = (scenario: FixtureScenario) => {
    setLocalSession(false);
    setLocalSnapshot(null);
    setFixtureScenario(scenario);
    setActionError(null);
  };

  let canAccept = false;
  let canDecline = false;
  let canCancel = false;
  let canResign = false;
  let canRematch = false;
  let canReturn = false;
  if (localSession && snapshot?.status === "pending") {
    canAccept = true;
    canDecline = true;
    canCancel = true;
  }
  if (localSession && snapshot?.status === "active") canResign = true;
  if (localSession && snapshot?.status === "active") canReturn = true;
  if (localSession && snapshot && ["won", "draw", "resigned"].includes(snapshot.status)) canRematch = true;
  if (localSession && snapshot && ["won", "draw", "resigned", "declined", "cancelled", "closed"].includes(snapshot.status)) canReturn = true;
  let acceptAction: (() => void) | undefined;
  let declineAction: (() => void) | undefined;
  let cancelAction: (() => void) | undefined;
  let resignAction: (() => void) | undefined;
  let rematchAction: (() => void) | undefined;
  let returnAction: (() => void) | undefined;
  let moveAction: ((row: number, column: number) => void) | undefined;
  if (canAccept) acceptAction = acceptInvitation;
  if (canDecline) declineAction = () => changePendingStatus("declined");
  if (canCancel) cancelAction = () => changePendingStatus("cancelled");
  if (canResign) resignAction = resign;
  if (canRematch) rematchAction = requestRematch;
  if (canReturn) returnAction = returnToSetup;
  if (localSession) moveAction = playMove;

  return (
    <LobbyScreen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to conversation"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>← CHAT</Text>
        </Pressable>
        <View style={styles.headingGroup}>
          <Text accessibilityRole="header" style={styles.heading}>TIC-TAC-TOE</Text>
          <Text style={styles.subheading}>{profile.duo.name} × {match.opponent.name}</Text>
        </View>
      </View>

      <View style={styles.previewBanner} accessibilityLiveRegion="polite">
        <Text style={styles.previewTitle}>DEVELOPMENT PREVIEW — LOCAL ONLY</Text>
        <Text style={styles.previewText}>This screen creates no Supabase records. Its state resets when you leave.</Text>
      </View>

      <View style={styles.fixturePanel}>
        <Text style={styles.sectionLabel}>FIXTURE STATE</Text>
        <View style={styles.choiceGrid}>
          {FIXTURE_SCENARIOS.map((scenario) => {
            const selected = !localSession && fixtureScenario === scenario.key;
            return (
              <Pressable
                key={scenario.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => selectFixture(scenario.key)}
                style={({ pressed }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{scenario.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {!snapshot && !unavailable && (
        <GameSetupPanel
          selectedPreset={selectedPreset}
          selectedOpponentId={selectedOpponentId}
          opponents={opponents}
          onSelectPreset={setSelectedPreset}
          onSelectOpponent={setSelectedOpponentId}
          onCreateInvitation={startInvitation}
        />
      )}

      {unavailable && (
        <View style={styles.setupPanel} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.panelTitle}>Game unavailable</Text>
          <Text style={styles.panelText}>This fixture represents a missing, inactive, or inaccessible conversation game.</Text>
        </View>
      )}

      {snapshot && (
        <>
          <GameStatusPanel
            snapshot={snapshot}
            viewerUserId={viewerUserId}
            localHotSeat={localSession}
            onAccept={acceptAction}
            onDecline={declineAction}
            onCancel={cancelAction}
            onResign={resignAction}
            onRematch={rematchAction}
            onReturnToSetup={returnAction}
          />
          {snapshot.players.length === 2 && (
            <GameBoard
              snapshot={snapshot}
              viewerUserId={viewerUserId}
              optimisticMove={optimisticMove}
              allowHotSeat={localSession}
              onMove={moveAction}
            />
          )}
        </>
      )}
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, maxWidth: 760 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: { minHeight: 44, justifyContent: "center" },
  backText: { color: lobbyColors.cyan, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  headingGroup: { flex: 1 },
  heading: { color: lobbyColors.text, fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  subheading: { color: lobbyColors.muted, marginTop: 2 },
  previewBanner: {
    gap: 5,
    borderWidth: 1,
    borderColor: lobbyColors.magenta,
    borderRadius: 10,
    backgroundColor: "#291638",
    padding: 14,
  },
  previewTitle: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  previewText: { color: lobbyColors.text, fontSize: 13, lineHeight: 19 },
  fixturePanel: { gap: 8 },
  setupPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surface,
    padding: 16,
  },
  panelTitle: { color: lobbyColors.text, fontSize: 22, fontWeight: "900" },
  panelText: { color: lobbyColors.muted, fontSize: 14, lineHeight: 20 },
  sectionLabel: { color: lobbyColors.green, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.border,
    borderRadius: 8,
    backgroundColor: lobbyColors.surfaceRaised,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  choiceSelected: { borderColor: lobbyColors.cyan, backgroundColor: "#10304A" },
  choiceText: { color: lobbyColors.muted, fontSize: 11, fontWeight: "800" },
  choiceTextSelected: { color: lobbyColors.cyan },
  choiceDetail: { color: lobbyColors.muted, fontSize: 9, marginTop: 2 },
  error: { color: lobbyColors.danger, fontWeight: "700" },
  pressed: { opacity: 0.62 },
});
