import type { GameCallerRole, GameSnapshot } from "@/src/features/games/tic-tac-toe/types";

export type GameChatActionKind = "join" | "spectate" | "disabled";

export type GameChatActionPresentation = {
  messageId: string;
  kind: GameChatActionKind;
  label: string;
  disabled: boolean;
};

export function getGameChatActionPresentation(
  game: GameSnapshot | null,
  callerRole: GameCallerRole | null,
  isJoining: boolean,
): GameChatActionPresentation | null {
  if (!game?.invitationMessageId) return null;

  if (game.status === "active" && callerRole === "spectator") {
    return {
      messageId: game.invitationMessageId,
      kind: "spectate",
      label: "SPECTATE",
      disabled: false,
    };
  }

  if (game.status !== "pending" || game.invited !== null) return null;

  if (callerRole === "eligible") {
    let label = "JOIN GAME";
    if (isJoining) label = "JOINING...";
    return {
      messageId: game.invitationMessageId,
      kind: "join",
      label,
      disabled: isJoining,
    };
  }

  if (callerRole === "challenger") {
    return {
      messageId: game.invitationMessageId,
      kind: "disabled",
      label: "INVITATION POSTED",
      disabled: true,
    };
  }

  if (callerRole === "spectator") {
    return {
      messageId: game.invitationMessageId,
      kind: "disabled",
      label: "YOUR DUO'S INVITATION",
      disabled: true,
    };
  }

  return null;
}
