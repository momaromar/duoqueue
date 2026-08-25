import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";

import { createFixtureState } from "@/src/features/games/tic-tac-toe/fixtures";
import * as gameService from "@/src/features/games/tic-tac-toe/gameService";
import type { ConversationGame } from "@/src/features/games/tic-tac-toe/schemas";
import type { GameParticipant } from "@/src/features/games/tic-tac-toe/types";
import { useSubmitGameMove } from "@/src/features/games/tic-tac-toe/useConversationGame";

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: { Light: "light" },
  impactAsync: jest.fn(async () => undefined),
}));
jest.mock("@/src/lib/supabase", () => ({ supabase: null }));

const conversationId = "40000000-0000-4000-8000-000000000001";
const userId = "40000000-0000-4000-8000-000000000011";
const participants: GameParticipant[] = [
  { userId, displayName: "Avery", duoId: "40000000-0000-4000-8000-000000000021", duoName: "Neon North" },
  { userId: "40000000-0000-4000-8000-000000000012", displayName: "Blair", duoId: "40000000-0000-4000-8000-000000000021", duoName: "Neon North" },
  { userId: "40000000-0000-4000-8000-000000000013", displayName: "Casey", duoId: "40000000-0000-4000-8000-000000000022", duoName: "Pixel Pair" },
  { userId: "40000000-0000-4000-8000-000000000014", displayName: "Devon", duoId: "40000000-0000-4000-8000-000000000022", duoName: "Pixel Pair" },
];

function activeResponse(): ConversationGame {
  const fixture = createFixtureState("active_player_turn", conversationId, "classic", participants);
  if (!fixture.snapshot) throw new Error("Expected an active game.");
  return { game: fixture.snapshot, callerRole: "player_x" };
}

afterEach(async () => {
  jest.restoreAllMocks();
  jest.mocked(Haptics.impactAsync).mockClear();
  await cleanup();
});

describe("authoritative move mutation", () => {
  it("shows one optimistic mark, reconciles success, and haptics only after acceptance", async () => {
    const response = activeResponse();
    let resolveMove: ((value: ConversationGame) => void) | undefined;
    jest.spyOn(gameService, "submitGameMove").mockImplementation(() => new Promise((resolve) => {
      resolveMove = resolve;
    }));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const hook = await renderHook(() => useSubmitGameMove(userId, conversationId), { wrapper });

    await act(() => hook.result.current.submit(response.game!.id, response.game!.stateVersion, 0, 1, "X"));
    await waitFor(() => expect(hook.result.current.optimisticMove).toEqual({ row: 0, column: 1, mark: "X" }));
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    await act(async () => resolveMove?.(response));
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(hook.result.current.optimisticMove).toBeNull();
    await waitFor(() => expect(Haptics.impactAsync).toHaveBeenCalledWith("light"));
    await hook.unmount();
    queryClient.clear();
  });

  it("removes an optimistic mark and skips haptics after rejection", async () => {
    const response = activeResponse();
    jest.spyOn(gameService, "submitGameMove").mockRejectedValue(new Error("GAME_CELL_OCCUPIED"));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const hook = await renderHook(() => useSubmitGameMove(userId, conversationId), { wrapper });

    await act(() => hook.result.current.submit(response.game!.id, response.game!.stateVersion, 0, 1, "X"));
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(hook.result.current.optimisticMove).toBeNull();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    await hook.unmount();
    queryClient.clear();
  });
});
