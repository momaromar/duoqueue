import { cleanup, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = jest.requireActual("react-native") as typeof import("react-native");
  return function MockIonicon(props: Record<string, unknown>) {
    return <Text {...props}>person-circle</Text>;
  };
});

import {
  dimIcon,
  DuoMemberReadiness,
  orderedReadinessMembers,
} from "@/src/features/main-menu/components/DuoMemberReadiness";
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

afterEach(async () => cleanup());

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
});
