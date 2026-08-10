import { z } from "zod";

const displayName = z
  .string()
  .trim()
  .min(2, "Display name must be at least 2 characters.")
  .max(40, "Display name must be 40 characters or fewer.");

const duoName = z
  .string()
  .trim()
  .min(2, "Duo name must be at least 2 characters.")
  .max(50, "Duo name must be 50 characters or fewer.");

const city = z
  .string()
  .trim()
  .min(2, "City or region must be at least 2 characters.")
  .max(80, "City or region must be 80 characters or fewer.");

const description = z
  .string()
  .trim()
  .max(240, "Description must be 240 characters or fewer.");

export const createDuoSchema = z.object({
  displayName,
  duoName,
  city,
  description,
});

export const editDuoSchema = z.object({ duoName, city, description });

export function normalizeInvitationCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const invitationCodeSchema = z.object({
  invitationCode: z
    .string()
    .transform(normalizeInvitationCode)
    .pipe(
      z
        .string()
        .length(10, "Enter the complete 10-character invitation code.")
        .regex(/^[A-HJ-NP-Z2-9]+$/, "This invitation code contains invalid characters."),
    ),
});

export const joinDuoSchema = z.object({ displayName });

const profileSchema = z.object({ displayName: z.string() });
const memberSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string(),
  role: z.enum(["creator", "member"]),
  colorKey: z.enum(["member_a", "member_b"]),
  joinedAt: z.string(),
});
const invitationSchema = z.object({
  code: z.string(),
  status: z.enum(["pending", "accepted", "revoked", "expired"]),
  expiresAt: z.string(),
});

export const currentDuoStateSchema = z.object({
  profile: profileSchema.nullable(),
  duo: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      city: z.string(),
      description: z.string().nullable(),
      status: z.enum(["forming", "active"]),
      profileComplete: z.boolean(),
      createdBy: z.string().uuid(),
      isCreator: z.boolean(),
      members: z.array(memberSchema),
      invitation: invitationSchema.nullable(),
    })
    .nullable(),
});

export const invitationPreviewSchema = z.object({
  code: z.string(),
  duoId: z.string().uuid(),
  duoName: z.string(),
  city: z.string(),
  description: z.string().nullable(),
  inviterDisplayName: z.string(),
  expiresAt: z.string(),
});

export type CreateDuoValues = z.infer<typeof createDuoSchema>;
export type EditDuoValues = z.infer<typeof editDuoSchema>;
export type InvitationCodeValues = z.infer<typeof invitationCodeSchema>;
export type JoinDuoValues = z.infer<typeof joinDuoSchema>;
export type CurrentDuoState = z.infer<typeof currentDuoStateSchema>;
export type InvitationPreview = z.infer<typeof invitationPreviewSchema>;
