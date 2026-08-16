import { z } from "zod";

export const safetySubjectTypeSchema = z.enum(["user", "duo", "conversation", "message"]);
export const reportReasonSchema = z.enum([
  "harassment",
  "hate",
  "sexual_content",
  "threats_or_violence",
  "spam_or_scam",
  "underage_concern",
  "privacy_violation",
  "other",
]);

const safetyMemberSchema = z.object({ userId: z.string().uuid(), displayName: z.string() });

export const reportableSubjectSchema = z.object({
  subjectType: safetySubjectTypeSchema,
  subjectId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  matchId: z.string().uuid(),
  ownDuoId: z.string().uuid(),
  opponentDuoId: z.string().uuid(),
  opponentDuoName: z.string(),
  opponentMembers: z.array(safetyMemberSchema).length(2),
  conversationId: z.string().uuid(),
  message: z.object({
    senderUserId: z.string().uuid(),
    senderDisplayName: z.string(),
    body: z.string(),
    createdAt: z.string(),
  }).nullable(),
});

export const reportSubmissionSchema = z.object({
  reportId: z.string().uuid(),
  submittedAt: z.string(),
  matchId: z.string().uuid(),
  opponentDuoId: z.string().uuid(),
  opponentDuoName: z.string(),
});

export const blockResultSchema = z.object({
  blockGroupId: z.string().uuid(),
  matchEnded: z.literal(true),
  blockedDuoName: z.string().optional(),
});

export const blockedDuosSchema = z.array(z.object({
  blockGroupId: z.string().uuid(),
  blockedDuoId: z.string().uuid(),
  blockedDuoName: z.string(),
  members: z.array(safetyMemberSchema).length(2),
  blockedAt: z.string(),
}));

export const unblockResultSchema = z.object({
  blockGroupId: z.string().uuid(),
  blockedDuoName: z.string(),
  unblocked: z.literal(true),
});

export type SafetySubjectType = z.infer<typeof safetySubjectTypeSchema>;
export type ReportReason = z.infer<typeof reportReasonSchema>;
export type ReportableSubject = z.infer<typeof reportableSubjectSchema>;
export type ReportSubmission = z.infer<typeof reportSubmissionSchema>;
export type BlockedDuo = z.infer<typeof blockedDuosSchema>[number];

export type SubmitReportValues = {
  reportId: string;
  subjectType: SafetySubjectType;
  subjectId: string;
  reason: ReportReason;
  details: string;
};
