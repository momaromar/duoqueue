import { useEffect, useMemo } from "react";

import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { useLocalChatStore } from "@/src/features/chat/localChatStore";
import type { ChatParticipant } from "@/src/features/chat/types";
import type { MatchmakingStateWithImages } from "@/src/features/matchmaking/schemas";

type ActiveMatch = NonNullable<MatchmakingStateWithImages["match"]>;

export function useLocalChatSession(
  userId: string | undefined,
  profile: DuoProfileStateWithImages,
  match: ActiveMatch,
) {
  const initialize = useLocalChatStore((state) => state.initialize);
  const participants = useMemo(() => {
    const ownParticipants: ChatParticipant[] = profile.members.map((member) => ({
      userId: member.userId,
      displayName: member.displayName,
      duoId: profile.duo.id,
      duoName: profile.duo.name,
      side: "own",
    }));
    const opponentParticipants: ChatParticipant[] = match.opponent.members.map((member) => ({
      userId: member.userId,
      displayName: member.displayName,
      duoId: match.opponent.id,
      duoName: match.opponent.name,
      side: "opponent",
    }));
    return [...ownParticipants, ...opponentParticipants];
  }, [match.opponent.id, match.opponent.members, match.opponent.name, profile.duo.id, profile.duo.name, profile.members]);
  const currentParticipant = participants.find((participant) => participant.userId === userId);

  useEffect(() => {
    if (!userId) return;
    initialize({
      scope: { userId, duoId: profile.duo.id, conversationId: match.conversationId },
      participants,
      matchedAt: match.matchedAt,
      ownDuoName: profile.duo.name,
      opponentDuoName: match.opponent.name,
    });
  }, [initialize, match.conversationId, match.matchedAt, match.opponent.name, participants, profile.duo.id, profile.duo.name, userId]);

  return { currentParticipant, participants };
}
