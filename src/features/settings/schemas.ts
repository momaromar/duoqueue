import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  duoInvitations: z.boolean(),
  queueStatus: z.boolean(),
  matches: z.boolean(),
  messages: z.boolean(),
  productUpdates: z.boolean(),
  updatedAt: z.string(),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type NotificationPreferenceKey = Exclude<keyof NotificationPreferences, "updatedAt">;
