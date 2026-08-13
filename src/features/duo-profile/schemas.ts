import { z } from "zod";

export const memberColorKeySchema = z.enum(["member_a", "member_b"]);

const promptSchema = z.object({
  id: z.number().int().positive(),
  key: z.string(),
  text: z.string(),
  sortOrder: z.number().int().min(1).max(6),
});

const memberSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string(),
  colorKey: memberColorKeySchema,
  submittedAt: z.string().nullable(),
  imagePath: z.string().nullable(),
});

const ownAnswerSchema = z.object({
  promptId: z.number().int().positive(),
  responseText: z.string(),
});

const combinedAnswerSchema = z.object({
  promptId: z.number().int().positive(),
  promptKey: z.string(),
  promptText: z.string(),
  sortOrder: z.number().int().min(1).max(6),
  responseText: z.string(),
  userId: z.string().uuid(),
  displayName: z.string(),
  colorKey: memberColorKeySchema,
});

export const duoProfileStateSchema = z.object({
  duo: z.object({
    id: z.string().uuid(),
    name: z.string(),
    city: z.string(),
    description: z.string().nullable(),
    status: z.enum(["forming", "active"]),
    profileComplete: z.boolean(),
  }),
  currentMember: memberSchema,
  assignedPrompts: z.array(promptSchema).length(3),
  ownAnswers: z.array(ownAnswerSchema),
  members: z.array(memberSchema).min(1).max(2),
  combinedAnswers: z.array(combinedAnswerSchema),
});

export const draftContributionFormSchema = z.object({
  answers: z.array(z.object({
    promptId: z.number().int().positive(),
    responseText: z.string().trim().max(500, "Answers must be 500 characters or fewer."),
  })).length(3),
});

export const submittedContributionFormSchema = z.object({
  answers: z.array(z.object({
    promptId: z.number().int().positive(),
    responseText: z
      .string()
      .trim()
      .min(10, "Answer with at least 10 characters.")
      .max(500, "Answers must be 500 characters or fewer."),
  })).length(3),
});

export const imageRegistrationSchema = z.object({
  previousPath: z.string().nullable(),
  newPath: z.string().nullable(),
});

export type DuoProfileState = z.infer<typeof duoProfileStateSchema>;
export type ContributionFormValues = z.infer<typeof draftContributionFormSchema>;
export type MemberColorKey = z.infer<typeof memberColorKeySchema>;

export type DuoProfileStateWithImages = DuoProfileState & {
  members: (DuoProfileState["members"][number] & { imageUrl: string | null })[];
};
