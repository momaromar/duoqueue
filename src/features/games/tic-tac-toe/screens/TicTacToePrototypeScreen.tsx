import { useIsFocused } from "@react-navigation/native";
import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { useChatParticipants } from "@/src/features/chat/useChatParticipants";
import { focusGameElement } from "@/src/features/games/tic-tac-toe/accessibility";
import { GameBoard } from "@/src/features/games/tic-tac-toe/components/GameBoard";
import { GameConnectionNotice } from "@/src/features/games/tic-tac-toe/components/GameConnectionNotice";
import { GameResignationConfirmation } from "@/src/features/games/tic-tac-toe/components/GameResignationConfirmation";
import { GameSetupPanel } from "@/src/features/games/tic-tac-toe/components/GameSetupPanel";
import { GameStatusPanel, getGameStatusCopy } from "@/src/features/games/tic-tac-toe/components/GameStatusPanel";
import {
  getGameErrorMessage,
  isGameConversationUnavailableError,
} from "@/src/features/games/tic-tac-toe/gameService";
import type { GameParticipant, GamePresetKey } from "@/src/features/games/tic-tac-toe/types";
import {
  useConversationGame,
  useConversationGameRealtime,
  useGameInvitationActions,
  useGameLifecycleActions,
  useSubmitGameMove,
} from "@/src/features/games/tic-tac-toe/useConversationGame";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";

export function TicTacToeScreen() {
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  let conversationId: string | undefined;
  if (typeof params.conversationId === "string") conversationId = params.conversationId;
  return (
    <MatchmakingDuoGate>
      {(data) => <GameRouteGate {...data} routeConversationId={conversationId} />}
    </MatchmakingDuoGate>
  );
}

function GameRouteGate({
  profile,
  matchmaking,
  refetchMatchmaking,
  routeConversationId,
}: MatchmakingGateData & { routeConversationId?: string }) {
  const { user } = useAuth();
  const match = matchmaking.match;
  if (!match || matchmaking.status !== "matched") return <Redirect href="/(app)/duo-chats" />;
  if (!routeConversationId || routeConversationId !== match.conversationId) {
    return <Redirect href="/(app)/duo-chats" />;
  }
  return (
    <AuthoritativeGame
      profile={profile}
      match={match}
      currentUserId={user?.id}
      refetchMatchmaking={refetchMatchmaking}
    />
  );
}

type AuthoritativeGameProps = {
  profile: MatchmakingGateData["profile"];
  match: NonNullable<MatchmakingGateData["matchmaking"]["match"]>;
  currentUserId?: string;
  refetchMatchmaking: MatchmakingGateData["refetchMatchmaking"];
};

export function shouldShowGameSetup(gameId: string | null, dismissedGameId: string | null) {
  return !gameId || gameId === dismissedGameId;
}

function AuthoritativeGame({ profile, match, currentUserId, refetchMatchmaking }: AuthoritativeGameProps) {
  const isFocused = useIsFocused();
  const { participants: chatParticipants, currentParticipant } = useChatParticipants(currentUserId, profile, match);
  const participants: GameParticipant[] = useMemo(
    () => chatParticipants.map(({ userId, displayName, duoId, duoName }) => ({ userId, displayName, duoId, duoName })),
    [chatParticipants],
  );
  const [selectedPreset, setSelectedPreset] = useState<GamePresetKey>("classic");
  const [selectedOpponentId, setSelectedOpponentId] = useState(match.opponent.members[0]?.userId ?? "");
  const [dismissedGameId, setDismissedGameId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingResignation, setConfirmingResignation] = useState(false);
  const [focusRequest, setFocusRequest] = useState<"status" | "setup" | null>(null);
  const focusBaseline = useRef("none");
  const statusFocusRef = useRef<Text>(null);
  const setupFocusRef = useRef<Text>(null);
  const errorFocusRef = useRef<View>(null);
  const gameQuery = useConversationGame(currentUserId, match.conversationId);
  const actions = useGameInvitationActions(currentUserId, match.conversationId);
  const lifecycle = useGameLifecycleActions(currentUserId, match.conversationId);
  const move = useSubmitGameMove(currentUserId, match.conversationId);
  const realtime = useConversationGameRealtime(
    currentUserId,
    match.conversationId,
    gameQuery.data?.game?.id,
    isFocused,
  );

  const refetchGame = gameQuery.refetch;
  useFocusEffect(useCallback(() => {
    void refetchGame();
  }, [refetchGame]));

  const gameState = gameQuery.data;
  const snapshot = gameState?.game ?? null;
  const callerRole = gameState?.callerRole ?? null;
  let snapshotKey = "none";
  if (snapshot) snapshotKey = `${snapshot.id}:${snapshot.status}:${snapshot.stateVersion}`;
  const showSetup = shouldShowGameSetup(snapshot?.id ?? null, dismissedGameId);
  const actionPending = actions.create.isPending
    || actions.accept.isPending
    || actions.decline.isPending
    || actions.cancel.isPending
    || lifecycle.resign.isPending
    || lifecycle.rematch.isPending
    || move.isPending
    || realtime.isRecovering
    || gameQuery.isFetching;

  const mutationError = actions.create.error
    ?? actions.accept.error
    ?? actions.decline.error
    ?? actions.cancel.error
    ?? lifecycle.resign.error
    ?? lifecycle.rematch.error
    ?? move.error;
  let visibleError = actionError;
  if (!visibleError && mutationError) visibleError = getGameErrorMessage(mutationError);
  if (!visibleError && gameQuery.error) visibleError = getGameErrorMessage(gameQuery.error);

  const gameAnnouncement = useMemo(() => {
    if (!snapshot || !callerRole) return null;
    const copy = getGameStatusCopy(snapshot, currentUserId ?? "", false, callerRole);
    return `${copy.title}. ${copy.detail}`;
  }, [callerRole, currentUserId, snapshot]);

  useEffect(() => {
    if (gameAnnouncement) AccessibilityInfo.announceForAccessibility(gameAnnouncement);
  }, [gameAnnouncement]);

  useEffect(() => {
    setConfirmingResignation(false);
    if (snapshot?.status === "pending" || snapshot?.status === "active") {
      setDismissedGameId(null);
    }
  }, [snapshot?.id, snapshot?.status]);

  useEffect(() => {
    if (!gameQuery.error || !isGameConversationUnavailableError(gameQuery.error)) return;
    void refetchMatchmaking().finally(() => router.replace("/(app)/duo-chats"));
  }, [gameQuery.error, refetchMatchmaking]);

  useEffect(() => {
    if (!focusRequest) return;
    let target: Text | null = null;
    if (visibleError) {
      const timer = setTimeout(() => focusGameElement(errorFocusRef.current), 0);
      setFocusRequest(null);
      return () => clearTimeout(timer);
    }
    if (focusRequest === "setup" && showSetup) target = setupFocusRef.current;
    if (focusRequest === "status" && snapshotKey !== focusBaseline.current && !actionPending) {
      target = statusFocusRef.current;
    }
    if (!target) return;
    const timer = setTimeout(() => focusGameElement(target), 0);
    setFocusRequest(null);
    return () => clearTimeout(timer);
  }, [actionPending, focusRequest, showSetup, snapshotKey, visibleError]);

  if (!currentUserId || !currentParticipant || participants.length !== 4) {
    return <Redirect href="/(app)/duo-chats" />;
  }
  if (gameQuery.isPending) return <LoadingView label="Loading Tic-Tac-Toe…" />;

  const opponents = participants.filter((participant) => participant.userId !== currentUserId);

  const runAction = (action: () => void) => {
    setActionError(null);
    focusBaseline.current = snapshotKey;
    setFocusRequest("status");
    action();
  };
  let transition: { gameId: string; expectedStateVersion: number } | null = null;
  if (snapshot) transition = { gameId: snapshot.id, expectedStateVersion: snapshot.stateVersion };

  let acceptAction: (() => void) | undefined;
  let declineAction: (() => void) | undefined;
  let cancelAction: (() => void) | undefined;
  if (transition && snapshot?.status === "pending" && callerRole === "invited") {
    acceptAction = () => runAction(() => actions.accept.mutate(transition));
    declineAction = () => runAction(() => actions.decline.mutate(transition));
  }
  if (transition && snapshot?.status === "pending" && callerRole === "challenger") {
    cancelAction = () => runAction(() => actions.cancel.mutate(transition));
  }
  let returnToSetupAction: (() => void) | undefined;
  if (snapshot && snapshot.status !== "pending" && snapshot.status !== "active") {
    returnToSetupAction = () => {
      setFocusRequest("setup");
      setDismissedGameId(snapshot.id);
    };
  }
  const currentPlayer = snapshot?.players.find((player) => player.userId === currentUserId);
  const opponentPlayer = snapshot?.players.find((player) => player.userId !== currentUserId);
  let resignAction: (() => void) | undefined;
  if (transition && snapshot?.status === "active" && currentPlayer) {
    resignAction = () => setConfirmingResignation(true);
  }
  let rematchAction: (() => void) | undefined;
  if (
    transition
    && currentPlayer
    && snapshot
    && ["won", "draw", "resigned"].includes(snapshot.status)
  ) {
    rematchAction = () => runAction(() => lifecycle.rematch.mutate(transition));
  }
  let playMove: ((row: number, column: number) => void) | undefined;
  if (
    snapshot?.status === "active"
    && currentPlayer
    && snapshot.nextTurnUserId === currentUserId
    && !actionPending
  ) {
    playMove = (row, column) => {
      setActionError(null);
      focusBaseline.current = snapshotKey;
      setFocusRequest("status");
      move.reset();
      move.submit(snapshot.id, snapshot.stateVersion, row, column, currentPlayer.mark);
    };
  }

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

      <GameConnectionNotice
        status={realtime.connectionStatus}
        isRecovering={realtime.isRecovering}
        onReconnect={realtime.reconnectAndRefresh}
      />

      {showSetup && (
        <GameSetupPanel
          focusRef={setupFocusRef}
          selectedPreset={selectedPreset}
          selectedOpponentId={selectedOpponentId}
          opponents={opponents}
          onSelectPreset={setSelectedPreset}
          onSelectOpponent={setSelectedOpponentId}
          isCreating={actions.create.isPending}
          actionsDisabled={actionPending}
          onCreateInvitation={() => {
            if (!selectedOpponentId) {
              setActionError("Choose another conversation member first.");
              focusBaseline.current = snapshotKey;
              setFocusRequest("status");
              return;
            }
            runAction(() => actions.create.mutate({ presetKey: selectedPreset, invitedUserId: selectedOpponentId }));
          }}
        />
      )}

      {!showSetup && snapshot && callerRole && (
        <>
          <GameStatusPanel
            focusRef={statusFocusRef}
            snapshot={snapshot}
            viewerUserId={currentUserId}
            callerRole={callerRole}
            localHotSeat={false}
            actionsDisabled={actionPending}
            onAccept={acceptAction}
            onDecline={declineAction}
            onCancel={cancelAction}
            onResign={resignAction}
            onRematch={rematchAction}
            onReturnToSetup={returnToSetupAction}
          />
          {confirmingResignation && transition && opponentPlayer && (
            <GameResignationConfirmation
              opponentName={opponentPlayer.displayName}
              disabled={actionPending}
              onConfirm={() => runAction(() => lifecycle.resign.mutate(transition))}
              onCancel={() => setConfirmingResignation(false)}
            />
          )}
          {snapshot.status === "pending" && callerRole === "spectator" && (
            <Notice text="You can watch this invitation, but only the invited player may respond." />
          )}
          {["active", "won", "draw", "resigned"].includes(snapshot.status) && (
            <GameBoard
              snapshot={snapshot}
              viewerUserId={currentUserId}
              optimisticMove={move.optimisticMove}
              onMove={playMove}
            />
          )}
        </>
      )}

      {visibleError && (
        <View style={styles.errorPanel} accessibilityLiveRegion="polite">
          <Text style={styles.error}>{visibleError}</Text>
          <Pressable
            ref={errorFocusRef}
            accessibilityRole="button"
            accessibilityLabel="Refresh game state"
            onPress={() => {
              setActionError(null);
              actions.create.reset();
              actions.accept.reset();
              actions.decline.reset();
              actions.cancel.reset();
              lifecycle.resign.reset();
              lifecycle.rematch.reset();
              move.reset();
              setConfirmingResignation(false);
              setFocusRequest(null);
              void gameQuery.refetch().then(() => {
                if (showSetup) focusGameElement(setupFocusRef.current);
                else focusGameElement(statusFocusRef.current);
              });
            }}
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>REFRESH</Text>
          </Pressable>
        </View>
      )}
    </LobbyScreen>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <Text style={styles.noticeLabel}>MILESTONE STATUS</Text>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
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
  notice: {
    gap: 5,
    borderWidth: 1,
    borderColor: lobbyColors.magenta,
    borderRadius: 10,
    backgroundColor: "#291638",
    padding: 14,
  },
  noticeLabel: { color: lobbyColors.magenta, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  noticeText: { color: lobbyColors.text, fontSize: 13, lineHeight: 19 },
  errorPanel: { gap: 10, borderWidth: 1, borderColor: lobbyColors.danger, borderRadius: 10, padding: 14 },
  error: { color: lobbyColors.danger, fontWeight: "700" },
  retry: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 12 },
  retryText: { color: lobbyColors.cyan, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  pressed: { opacity: 0.62 },
});
