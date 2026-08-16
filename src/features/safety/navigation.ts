import type { Href } from "expo-router";

import type { SafetySubjectType } from "@/src/features/safety/schemas";

export function reportHref(subjectType: SafetySubjectType, subjectId: string) {
  return {
    pathname: "/safety/report",
    params: { subjectType, subjectId },
  } as unknown as Href;
}
