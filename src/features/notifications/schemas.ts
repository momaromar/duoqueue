import { z } from "zod";

export const pushRegistrationSchema = z.object({
  installationId: z.string().uuid(),
  enabled: z.boolean(),
  updatedAt: z.string(),
});

export const pushNotificationDataSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("duo_invitation_accepted") }),
  z.object({
    type: z.enum(["queue_eligible", "queue_expired"]),
    ticketId: z.string().uuid(),
  }),
  z.object({ type: z.literal("match_found"), matchId: z.string().uuid() }),
  z.object({
    type: z.literal("new_message"),
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
  }),
]);

export type PushNotificationData = z.infer<typeof pushNotificationDataSchema>;

export type PushRegistrationState =
  | { status: "registered"; detail: string }
  | { status: "disabled"; detail: string }
  | { status: "denied"; detail: string }
  | { status: "unsupported"; detail: string }
  | { status: "unconfigured"; detail: string };
