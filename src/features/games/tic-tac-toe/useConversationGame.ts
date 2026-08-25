import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { chatMessagesKey, chatSummaryKey } from "@/src/features/chat/useChat";
import {
  acceptGameInvitation,
  cancelGameInvitation,
  createGameInvitation,
  declineGameInvitation,
  getConversationGame,
  submitGameMove,
  subscribeToConversationGame,
} from "@/src/features/games/tic-tac-toe/gameService";
import type { ConversationGame } from "@/src/features/games/tic-tac-toe/schemas";
import type { GameMark, GamePresetKey } from "@/src/features/games/tic-tac-toe/types";

export function conversationGameKey(userId: string | undefined, conversationId: string | undefined) {
  return ["games", "tic-tac-toe", userId, conversationId] as const;
}

export function replaceConversationGameCache(
  queryClient: QueryClient,
  userId: string | undefined,
  conversationId: string | undefined,
  result: ConversationGame,
) {
  queryClient.setQueryData(conversationGameKey(userId, conversationId), result);
}

async function invalidateRelatedQueries(
  queryClient: QueryClient,
  userId: string | undefined,
  conversationId: string | undefined,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: conversationGameKey(userId, conversationId) }),
    queryClient.invalidateQueries({ queryKey: chatMessagesKey(userId, conversationId) }),
    queryClient.invalidateQueries({ queryKey: chatSummaryKey(userId, conversationId) }),
  ]);
}

export function useConversationGame(
  userId: string | undefined,
  conversationId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: conversationGameKey(userId, conversationId),
    queryFn: () => getConversationGame(conversationId!),
    enabled: Boolean(userId && conversationId) && enabled,
  });
}

export function useConversationGameRealtime(
  userId: string | undefined,
  conversationId: string | undefined,
  gameId: string | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !userId || !conversationId) return;
    const refresh = () => {
      if (refreshTimer.current) return;
      refreshTimer.current = setTimeout(() => {
        refreshTimer.current = null;
        void queryClient.invalidateQueries({ queryKey: conversationGameKey(userId, conversationId) });
      }, 40);
    };
    const unsubscribe = subscribeToConversationGame(conversationId, gameId, refresh);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [conversationId, enabled, gameId, queryClient, userId]);
}

type CreateInvitationVariables = {
  presetKey: GamePresetKey;
  invitedUserId: string;
};

type TransitionVariables = {
  gameId: string;
  expectedStateVersion: number;
};

export function useGameInvitationActions(
  userId: string | undefined,
  conversationId: string | undefined,
) {
  const queryClient = useQueryClient();
  const onSuccess = async (result: ConversationGame) => {
    replaceConversationGameCache(queryClient, userId, conversationId, result);
    await invalidateRelatedQueries(queryClient, userId, conversationId);
  };
  const onError = () => {
    void queryClient.invalidateQueries({ queryKey: conversationGameKey(userId, conversationId) });
  };

  const create = useMutation({
    mutationFn: ({ presetKey, invitedUserId }: CreateInvitationVariables) => createGameInvitation(
      conversationId!,
      Crypto.randomUUID(),
      presetKey,
      invitedUserId,
    ),
    onSuccess,
    onError,
  });
  const accept = useMutation({
    mutationFn: ({ gameId, expectedStateVersion }: TransitionVariables) => acceptGameInvitation(gameId, expectedStateVersion),
    onSuccess,
    onError,
  });
  const decline = useMutation({
    mutationFn: ({ gameId, expectedStateVersion }: TransitionVariables) => declineGameInvitation(gameId, expectedStateVersion),
    onSuccess,
    onError,
  });
  const cancel = useMutation({
    mutationFn: ({ gameId, expectedStateVersion }: TransitionVariables) => cancelGameInvitation(gameId, expectedStateVersion),
    onSuccess,
    onError,
  });

  return { create, accept, decline, cancel };
}

type SubmitMoveVariables = {
  id: string;
  gameId: string;
  expectedStateVersion: number;
  row: number;
  column: number;
  mark: GameMark;
};

export function useSubmitGameMove(
  userId: string | undefined,
  conversationId: string | undefined,
) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: SubmitMoveVariables) => submitGameMove(
      variables.gameId,
      variables.id,
      variables.expectedStateVersion,
      variables.row,
      variables.column,
    ),
    onSuccess: async (result) => {
      replaceConversationGameCache(queryClient, userId, conversationId, result);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Accepted gameplay must not fail because haptics are unavailable.
      }
      await invalidateRelatedQueries(queryClient, userId, conversationId);
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: conversationGameKey(userId, conversationId) });
    },
  });

  const submit = (
    gameId: string,
    expectedStateVersion: number,
    row: number,
    column: number,
    mark: GameMark,
  ) => {
    if (mutation.isPending) return;
    mutation.mutate({
      id: Crypto.randomUUID(),
      gameId,
      expectedStateVersion,
      row,
      column,
      mark,
    });
  };

  let optimisticMove: { row: number; column: number; mark: GameMark } | null = null;
  if (mutation.isPending && mutation.variables) {
    optimisticMove = {
      row: mutation.variables.row,
      column: mutation.variables.column,
      mark: mutation.variables.mark,
    };
  }

  return { ...mutation, submit, optimisticMove };
}
