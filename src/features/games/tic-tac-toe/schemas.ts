import { z } from "zod";

export const gamePresetKeySchema = z.enum(["classic", "quick", "extended", "large"]);
export const gameStatusSchema = z.enum([
  "pending",
  "active",
  "won",
  "draw",
  "resigned",
  "declined",
  "cancelled",
  "closed",
]);
export const gameMarkSchema = z.enum(["X", "O"]);
export const gameCallerRoleSchema = z.enum([
  "challenger",
  "invited",
  "player_x",
  "player_o",
  "spectator",
]);

export const gameParticipantSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1),
  duoId: z.string().uuid(),
  duoName: z.string().min(1),
});

export const gamePlayerSchema = gameParticipantSchema.extend({
  mark: gameMarkSchema,
  playerOrder: z.union([z.literal(1), z.literal(2)]),
});

export const gameMoveSchema = z.object({
  id: z.string().uuid(),
  moveNumber: z.number().int().positive(),
  row: z.number().int().nonnegative(),
  column: z.number().int().nonnegative(),
  mark: gameMarkSchema,
  userId: z.string().uuid(),
  createdAt: z.string(),
});

export const winningCellSchema = z.object({
  row: z.number().int().nonnegative(),
  column: z.number().int().nonnegative(),
  index: z.number().int().nonnegative(),
});

export const gameSnapshotSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  presetKey: gamePresetKeySchema,
  status: gameStatusSchema,
  stateVersion: z.number().int().nonnegative(),
  challenger: gameParticipantSchema,
  invited: gameParticipantSchema,
  players: z.array(gamePlayerSchema).max(2),
  moves: z.array(gameMoveSchema),
  nextTurnUserId: z.string().uuid().nullable(),
  winnerUserId: z.string().uuid().nullable(),
  winningLine: z.array(winningCellSchema),
  previousGameId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
