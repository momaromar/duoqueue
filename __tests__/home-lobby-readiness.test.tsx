import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = jest.requireActual("react-native") as typeof import("react-native");
  return function MockIonicon(props: Record<string, unknown>) {
    return <Text {...props}>person-circle</Text>;
  };
});

jest.mock("@/src/features/duo-management/duoManagementService", () => ({
  updateActiveDuoBasics: jest.fn(),
}));

import {
  dimIcon,
  DuoMemberReadiness,
  orderedReadinessMembers,
} from "@/src/features/main-menu/components/DuoMemberReadiness";
import { LobbyDuoControls } from "@/src/features/main-menu/components/LobbyDuoControls";
import { updateActiveDuoBasics } from "@/src/features/duo-management/duoManagementService";
import { getQueuePresentation } from "@/src/features/main-menu/lobbyReadiness";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

const memberA = {
  userId: "40000000-0000-4000-8000-000000000021",
  displayName: "Avery With A Name That Wraps",
  colorKey: "member_a" as const,
  submittedAt: "2026-09-02T12:00:00.000Z",
  imagePath: null,
  imageUrl: null,
};

const memberB = {
  userId: "40000000-0000-4000-8000-000000000022",
  displayName: "Blair",
  colorKey: "member_b" as const,
  submittedAt: null,
  imagePath: null,
  imageUrl: null,
};

afterEach(async () => {
  await cleanup();
  jest.clearAllMocks();
});

async function renderDuoControls(onOpenPreferences = jest.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const view = await render(
    <QueryClientProvider client={queryClient}>
      <LobbyDuoControls
        duo={{
          id: "40000000-0000-4000-8000-000000000031",
          name: "Neon North",
          city: "Toronto",
          description: "Arcade regulars",
        }}
        userId={memberA.userId}
        onOpenPreferences={onOpenPreferences}
      />
    </QueryClientProvider>,
  );
  return { view, onOpenPreferences };
}

describe("home lobby readiness", () => {
  it("orders members by stable color and presents accessible ready states", async () => {
    expect(orderedReadinessMembers([memberB, memberA]).map((member) => member.colorKey)).toEqual([
      "member_a",
      "member_b",
    ]);

    const view = await render(<DuoMemberReadiness members={[memberB, memberA]} />);
    expect(view.getByLabelText("Avery With A Name That Wraps ready!")).toBeTruthy();
    expect(view.getByLabelText("Blair not ready, still onboarding!")).toBeTruthy();

    const readyText = view.getByText("Avery With A Name That Wraps ready!");
    const waitingText = view.getByText("Blair not ready, still onboarding!");
    expect(StyleSheet.flatten(readyText.props.style).color).toBe(lobbyColors.memberA);
    expect(StyleSheet.flatten(waitingText.props.style).color).toBe(lobbyColors.danger);

    expect(view.getByTestId("readiness-icon-member_a").props.color).toBe(lobbyColors.memberA);
    expect(view.getByTestId("readiness-icon-member_b").props.color).toBe(dimIcon);
  });

  it("locks queue presentation until both members are ready", () => {
    expect(getQueuePresentation("idle", false)).toEqual({
      label: "WAITING FOR DUO",
      detail: "PARTNER STILL ONBOARDING",
      disabled: true,
    });
    expect(getQueuePresentation("idle", true).label).toBe("QUEUE");
    expect(getQueuePresentation("waiting", true).label).toBe("RESUME");
    expect(getQueuePresentation("matched", true).label).toBe("MATCH FOUND");
  });

  it("opens the Duo dashboard from the square preferences control", async () => {
    const { view, onOpenPreferences } = await renderDuoControls();
    expect(view.queryByText("DUO CHATS")).toBeNull();
    expect(StyleSheet.flatten(view.getByText("Neon North").props.style).fontSize).toBe(22);
    await fireEvent.press(view.getByLabelText("Open Duo preferences"));
    expect(onOpenPreferences).toHaveBeenCalledTimes(1);
  });

  it("edits, validates, trims, and saves the Duo name inline", async () => {
    jest.mocked(updateActiveDuoBasics).mockResolvedValueOnce(undefined);
    const { view } = await renderDuoControls();

    await fireEvent.press(view.getByLabelText("Edit Duo name: Neon North"));
    const input = view.getByLabelText("Duo name");
    expect(input.props.value).toBe("Neon North");

    await fireEvent.changeText(input, " ");
    await fireEvent.press(view.getByLabelText("SAVE"));
    expect(await view.findByText("Duo name must be at least 2 characters.")).toBeTruthy();
    expect(updateActiveDuoBasics).not.toHaveBeenCalled();

    await fireEvent.changeText(input, "  Pixel Pair  ");
    await fireEvent.press(view.getByLabelText("SAVE"));
    await waitFor(() => expect(jest.mocked(updateActiveDuoBasics).mock.calls[0]?.[0]).toEqual({
      duoName: "Pixel Pair",
      city: "Toronto",
      description: "Arcade regulars",
    }));
    await waitFor(() => expect(view.queryByLabelText("Duo name")).toBeNull());
  });

  it("cancels without saving and keeps failed saves recoverable", async () => {
    const { view } = await renderDuoControls();
    await fireEvent.press(view.getByLabelText("Edit Duo name: Neon North"));
    await fireEvent.changeText(view.getByLabelText("Duo name"), "Changed Name");
    await fireEvent.press(view.getByLabelText("CANCEL"));
    expect(updateActiveDuoBasics).not.toHaveBeenCalled();
    expect(view.getByLabelText("Edit Duo name: Neon North")).toBeTruthy();

    jest.mocked(updateActiveDuoBasics).mockRejectedValueOnce(new Error("Network unavailable"));
    await fireEvent.press(view.getByLabelText("Edit Duo name: Neon North"));
    await fireEvent.changeText(view.getByLabelText("Duo name"), "Changed Name");
    await fireEvent.press(view.getByLabelText("SAVE"));
    expect(await view.findByText("Network unavailable")).toBeTruthy();
    expect(view.getByLabelText("Duo name")).toBeTruthy();
  });
});
