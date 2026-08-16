import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  blockOpponentDuo,
  getBlockedDuos,
  getReportableSubject,
  submitSafetyReport,
  unblockDuo,
} from "@/src/features/safety/safetyService";
import type { SafetySubjectType } from "@/src/features/safety/schemas";

export function blockedDuosKey(userId: string | undefined) {
  return ["safety", "blocked-duos", userId] as const;
}

export function useReportableSubject(subjectType: SafetySubjectType | undefined, subjectId: string | undefined) {
  return useQuery({
    queryKey: ["safety", "reportable-subject", subjectType, subjectId],
    queryFn: () => getReportableSubject(subjectType!, subjectId!),
    enabled: Boolean(subjectType && subjectId),
  });
}

export function useSubmitSafetyReport() {
  return useMutation({ mutationFn: submitSafetyReport });
}

export function useBlockOpponentDuo(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockOpponentDuo,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["chat"] });
      void queryClient.invalidateQueries({ queryKey: ["matchmaking", "current", userId] });
      void queryClient.invalidateQueries({ queryKey: blockedDuosKey(userId) });
    },
  });
}

export function useBlockedDuos(userId: string | undefined) {
  return useQuery({
    queryKey: blockedDuosKey(userId),
    queryFn: getBlockedDuos,
    enabled: Boolean(userId),
  });
}

export function useUnblockDuo(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockDuo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blockedDuosKey(userId) });
      void queryClient.invalidateQueries({ queryKey: ["matchmaking", "current", userId] });
    },
  });
}
