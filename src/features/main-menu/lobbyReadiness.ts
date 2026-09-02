import type { MatchmakingPresentationStatus } from "@/src/features/matchmaking/schemas";

export type QueuePresentation = {
  label: string;
  detail: string;
  disabled: boolean;
};

export function getQueuePresentation(
  status: MatchmakingPresentationStatus,
  isDuoReady: boolean,
): QueuePresentation {
  if (!isDuoReady) {
    return {
      label: "WAITING FOR DUO",
      detail: "PARTNER STILL ONBOARDING",
      disabled: true,
    };
  }

  if (status === "waiting" || status === "eligible" || status === "matching") {
    return { label: "RESUME", detail: "RETURN TO SEARCH", disabled: false };
  }
  if (status === "matched") {
    return { label: "MATCH FOUND", detail: "VIEW YOUR MATCH", disabled: false };
  }
  return { label: "QUEUE", detail: "FIND ANOTHER DUO", disabled: false };
}
