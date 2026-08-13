import { create } from "zustand";

import { fixtureDuoProfile } from "@/src/features/matchmaking/fixture";
import type {
  MockMatch,
  MockMatchmakingStatus,
  MockQueueTicket,
} from "@/src/features/matchmaking/types";

export const MOCK_WAIT_DURATION_MS = 5 * 60 * 1000;

type MockMatchmakingState = {
  duoId: string | null;
  status: MockMatchmakingStatus;
  ticket: MockQueueTicket | null;
  match: MockMatch | null;
  startQueue: (duoId: string) => void;
  completeWait: (duoId: string) => void;
  cancelQueue: () => void;
  resetForDuo: (duoId?: string) => void;
};

const emptyState = {
  duoId: null,
  status: "idle" as const,
  ticket: null,
  match: null,
};

export const useMockMatchmakingStore = create<MockMatchmakingState>((set, get) => ({
  ...emptyState,
  startQueue: (duoId) => {
    const state = get();
    if (state.duoId === duoId && state.status !== "idle") return;
    const now = Date.now();
    set({
      duoId,
      status: "waiting",
      ticket: {
        id: `mock-ticket-${duoId}-${now}`,
        duoId,
        status: "waiting",
        queuedAt: now,
        eligibleAt: now + MOCK_WAIT_DURATION_MS,
      },
      match: null,
    });
  },
  completeWait: (duoId) => {
    const state = get();
    if (state.duoId !== duoId || state.status !== "waiting" || !state.ticket) return;
    const matchedAt = Date.now();
    set({
      status: "matched",
      ticket: { ...state.ticket, status: "matched" },
      match: {
        id: `mock-match-${duoId}-${matchedAt}`,
        currentDuoId: duoId,
        matchedAt,
        opponent: fixtureDuoProfile,
      },
    });
  },
  cancelQueue: () => set(emptyState),
  resetForDuo: (duoId) => {
    const state = get();
    if (!duoId || (state.duoId && state.duoId !== duoId)) set(emptyState);
  },
}));

export function statusForDuo(
  state: Pick<MockMatchmakingState, "duoId" | "status">,
  duoId: string | undefined,
) {
  if (!duoId || state.duoId !== duoId) return "idle" as const;
  return state.status;
}
