import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/features/auth/AuthContext";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchmakingDuoGate,
  type MatchmakingGateData,
} from "@/src/features/matchmaking/components/MatchmakingDuoGate";
import { MatchmakingSummary } from "@/src/features/matchmaking/components/MatchmakingSummary";
import {
  cancelMatchmakingTicket,
  tryMatchDuo,
} from "@/src/features/matchmaking/matchmakingService";
import { matchmakingStateKey } from "@/src/features/matchmaking/useMatchmakingState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

const MATCH_RETRY_MS = 5000;

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function QueueWaitingScreen() {
  return (
    <MatchmakingDuoGate>
      {(data) => <WaitingContent {...data} />}
    </MatchmakingDuoGate>
  );
}

function WaitingContent({ profile, matchmaking, refetchMatchmaking }: MatchmakingGateData) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ticket = matchmaking.ticket;
  const [remainingMs, setRemainingMs] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const lastMatchAttemptAt = useRef(0);
  const cancellationStarted = useRef(false);
  const matchAttemptInFlight = useRef(false);
  const tryMutation = useMutation({ mutationFn: tryMatchDuo });
  const cancelMutation = useMutation({ mutationFn: cancelMatchmakingTicket });
  const serverOffsetMs = useMemo(
    () => Date.parse(matchmaking.serverNow) - Date.now(),
    [matchmaking.serverNow],
  );
  const tryMatch = tryMutation.mutateAsync;
  const ticketRef = useRef(ticket);
  const serverOffsetRef = useRef(serverOffsetMs);
  const tryMatchRef = useRef(tryMatch);
  ticketRef.current = ticket;
  serverOffsetRef.current = serverOffsetMs;
  tryMatchRef.current = tryMatch;

  const applyState = useCallback((nextState: Awaited<ReturnType<typeof tryMatchDuo>>) => {
    queryClient.setQueryData(matchmakingStateKey(user?.id), nextState);
  }, [queryClient, user?.id]);

  const refreshCountdown = useCallback(() => {
    const currentTicket = ticketRef.current;
    if (!currentTicket) return;
    const estimatedServerNow = Date.now() + serverOffsetRef.current;
    setRemainingMs(Math.max(0, Date.parse(currentTicket.eligibleAt) - estimatedServerNow));
  }, []);

  const attemptMatchIfEligible = useCallback(async (force = false) => {
    const currentTicket = ticketRef.current;
    if (!currentTicket || matchAttemptInFlight.current || cancellationStarted.current) return;
    const estimatedServerNow = Date.now() + serverOffsetRef.current;
    if (estimatedServerNow < Date.parse(currentTicket.eligibleAt)) return;
    if (!force && Date.now() - lastMatchAttemptAt.current < MATCH_RETRY_MS) return;
    lastMatchAttemptAt.current = Date.now();
    matchAttemptInFlight.current = true;
    try {
      const nextState = await tryMatchRef.current();
      if (!cancellationStarted.current) {
        applyState(nextState);
        setActionError(null);
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      matchAttemptInFlight.current = false;
    }
  }, [applyState]);

  useEffect(() => {
    refreshCountdown();
    const interval = setInterval(() => {
      refreshCountdown();
      void attemptMatchIfEligible();
    }, 1000);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refetchMatchmaking();
        void attemptMatchIfEligible(true);
      }
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [attemptMatchIfEligible, refetchMatchmaking, refreshCountdown]);

  useFocusEffect(useCallback(() => {
    void refetchMatchmaking();
    refreshCountdown();
    void attemptMatchIfEligible(true);
  }, [attemptMatchIfEligible, refetchMatchmaking, refreshCountdown]));

  if (matchmaking.status === "matched") return <Redirect href="/matchmaking/matched" />;
  if (
    matchmaking.status === "idle"
    || matchmaking.status === "cancelled"
    || matchmaking.status === "expired"
    || matchmaking.status === "failed"
    || !ticket
  ) {
    return <Redirect href="/matchmaking/queue" />;
  }

  const cancel = async () => {
    cancellationStarted.current = true;
    setActionError(null);
    try {
      const nextState = await cancelMutation.mutateAsync();
      queryClient.setQueryData(matchmakingStateKey(user?.id), nextState);
      if (nextState.status === "matched") {
        router.replace("/matchmaking/matched");
      } else {
        router.replace("/(app)");
      }
    } catch (error) {
      cancellationStarted.current = false;
      setActionError(getErrorMessage(error));
    }
  };

  let timerLabel = "ELIGIBLE IN";
  if (remainingMs === 0) timerLabel = "FINDING A MATCH";

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader title="Searching for a Duo" subtitle="Both members share this Supabase ticket." />
      <MatchmakingSummary profile={profile} />
      <View style={styles.timerPanel} accessibilityLiveRegion="polite">
        <Text style={styles.timerLabel}>{timerLabel}</Text>
        <Text style={styles.timer}>{formatCountdown(remainingMs)}</Text>
        <Text style={styles.timerDetail}>Queued by {ticket.createdByDisplayName}</Text>
      </View>
      <Text style={styles.explanation}>
        Matching uses the server timestamp and the oldest eligible duo in your normalized region.
        This ticket expires 30 minutes after it was created.
      </Text>
      {!ticket.canCancel && (
        <Text style={styles.partnerNotice}>
          Only {ticket.createdByDisplayName}, who started this queue, can cancel it.
        </Text>
      )}
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
      <LobbyButton
        label="REFRESH STATUS"
        disabled={cancelMutation.isPending}
        onPress={() => {
          void refetchMatchmaking();
          void attemptMatchIfEligible(true);
        }}
      />
      {ticket.canCancel && (
        <LobbyButton
          label="CANCEL QUEUE"
          disabled={cancelMutation.isPending}
          onPress={() => void cancel()}
        />
      )}
      <LobbyButton label="BACK TO LOBBY" onPress={() => router.replace("/(app)")} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  timerPanel: {
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: lobbyColors.cyan,
    borderRadius: 16,
    backgroundColor: "#081E36",
    padding: 24,
  },
  timerLabel: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 2 },
  timer: { color: lobbyColors.text, fontSize: 56, fontWeight: "900", letterSpacing: 4 },
  timerDetail: { color: lobbyColors.muted, textAlign: "center" },
  explanation: { color: lobbyColors.muted, lineHeight: 21, textAlign: "center" },
  partnerNotice: { color: lobbyColors.magenta, lineHeight: 20, textAlign: "center" },
  error: { color: lobbyColors.danger, lineHeight: 20, textAlign: "center" },
});
