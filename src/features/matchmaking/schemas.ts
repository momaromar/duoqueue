import { z } from "zod";

import { memberColorKeySchema } from "@/src/features/duo-profile/schemas";

export const matchmakingPresentationStatusSchema = z.enum([
  "idle",
  "waiting",
  "eligible",
  "matching",
  "matched",
  "cancelled",
  "expired",
  "failed",
]);

const ticketSchema = z.object({
  id: z.string().uuid(),
  duoId: z.string().uuid(),
  status: z.enum(["waiting", "eligible", "matching", "matched", "cancelled", "expired", "failed"]),
  queuedAt: z.string(),
  eligibleAt: z.string(),
  expiresAt: z.string(),
  matchedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  matchId: z.string().uuid().nullable(),
  createdByUserId: z.string().uuid(),
  createdByDisplayName: z.string(),
  canCancel: z.boolean(),
});

const opponentMemberSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string(),
  colorKey: memberColorKeySchema,
  imagePath: z.string().nullable(),
});

const opponentAnswerSchema = z.object({
  promptId: z.number().int().positive(),
  sortOrder: z.number().int().min(1).max(6),
  promptText: z.string(),
  responseText: z.string(),
  userId: z.string().uuid(),
  displayName: z.string(),
  colorKey: memberColorKeySchema,
});

const matchSchema = z.object({
  id: z.string().uuid(),
  status: z.literal("active"),
  matchedAt: z.string(),
  conversationId: z.string().uuid(),
  opponent: z.object({
    id: z.string().uuid(),
    name: z.string(),
    city: z.string(),
    description: z.string().nullable(),
    members: z.array(opponentMemberSchema).length(2),
    answers: z.array(opponentAnswerSchema).length(6),
  }),
});

export const matchmakingStateSchema = z.object({
  serverNow: z.string(),
  status: matchmakingPresentationStatusSchema,
  readiness: z.object({ canQueue: z.boolean(), reason: z.string() }),
  duo: z.object({
    id: z.string().uuid(),
    name: z.string(),
    city: z.string(),
    profileComplete: z.boolean(),
    memberCount: z.number().int(),
  }).nullable(),
  ticket: ticketSchema.nullable(),
  match: matchSchema.nullable(),
});

export type MatchmakingState = z.infer<typeof matchmakingStateSchema>;
export type MatchmakingPresentationStatus = z.infer<typeof matchmakingPresentationStatusSchema>;
type MatchState = NonNullable<MatchmakingState["match"]>;
type OpponentState = MatchState["opponent"];

export type MatchmakingStateWithImages = Omit<MatchmakingState, "match"> & {
  match: (Omit<MatchState, "opponent"> & {
    opponent: Omit<OpponentState, "members"> & {
      members: (OpponentState["members"][number] & {
        imageUrl: string | null;
      })[];
    };
  }) | null;
};
