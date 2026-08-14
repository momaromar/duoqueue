import { z } from "zod";

const optionalAge = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), "Enter a whole number.")
  .refine((value) => value === "" || (Number(value) >= 18 && Number(value) <= 120), {
    message: "Age must be between 18 and 120.",
  });

function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const queuePreferencesFormSchema = z
  .object({
    region: z.string().trim().min(2, "Region must be at least 2 characters.").max(80),
    minimumAge: optionalAge,
    maximumAge: optionalAge,
    activities: z.string().max(420, "Activities are too long."),
    availability: z.string().max(620, "Availability is too long."),
  })
  .superRefine((values, context) => {
    if (values.minimumAge && values.maximumAge && Number(values.minimumAge) > Number(values.maximumAge)) {
      context.addIssue({
        code: "custom",
        path: ["maximumAge"],
        message: "Maximum age must be at least the minimum age.",
      });
    }
    const activities = splitList(values.activities);
    if (activities.length > 10 || activities.some((item) => item.length > 40)) {
      context.addIssue({
        code: "custom",
        path: ["activities"],
        message: "Use at most 10 activities, each 40 characters or fewer.",
      });
    }
    const availability = splitList(values.availability);
    if (availability.length > 10 || availability.some((item) => item.length > 60)) {
      context.addIssue({
        code: "custom",
        path: ["availability"],
        message: "Use at most 10 availability entries, each 60 characters or fewer.",
      });
    }
  });

export const queuePreferencesStateSchema = z.object({
  duoId: z.string().uuid(),
  region: z.string(),
  minimumAge: z.number().int().nullable(),
  maximumAge: z.number().int().nullable(),
  activities: z.array(z.string()),
  availability: z.array(z.string()),
  regionIsActiveFilter: z.boolean(),
});

export const disbandResultSchema = z.object({ imagePaths: z.array(z.string()) });
export const pendingCleanupSchema = z.array(z.string());

export type QueuePreferencesFormValues = z.infer<typeof queuePreferencesFormSchema>;
export type QueuePreferencesState = z.infer<typeof queuePreferencesStateSchema>;

export function listFromText(value: string) {
  return splitList(value);
}
