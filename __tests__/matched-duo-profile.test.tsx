import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import {
  MatchedDuoProfile,
  orderOpponentAnswers,
  orderOpponentMembers,
} from "@/src/features/matchmaking/components/MatchedDuoProfile";
import type { MatchmakingStateWithImages } from "@/src/features/matchmaking/schemas";

type Opponent = NonNullable<MatchmakingStateWithImages["match"]>["opponent"];

const memberA = {
  userId: "40000000-0000-4000-8000-000000000011",
  displayName: "Avery",
  colorKey: "member_a" as const,
  imagePath: "duo/member-a.jpg",
  imageUrl: "https://example.com/member-a.jpg",
};

const memberB = {
  userId: "40000000-0000-4000-8000-000000000012",
  displayName: "Blair",
  colorKey: "member_b" as const,
  imagePath: "duo/member-b.jpg",
  imageUrl: "https://example.com/member-b.jpg",
};

function createOpponent(members: Opponent["members"] = [memberB, memberA]): Opponent {
  const answers = Array.from({ length: 6 }, (_, index) => {
    const sortOrder = 6 - index;
    const member = sortOrder <= 3 ? memberA : memberB;
    return {
      promptId: sortOrder,
      sortOrder,
      promptText: `Question ${sortOrder}`,
      responseText: `Answer ${sortOrder}`,
      userId: member.userId,
      displayName: member.displayName,
      colorKey: member.colorKey,
    };
  });
  return {
    id: "40000000-0000-4000-8000-000000000020",
    name: "Neon Neighbours",
    city: "Toronto, Ontario",
    description: "Late-night food and arcade regulars.",
    members,
    answers,
  };
}

afterEach(async () => cleanup());

describe("matched Duo Profile", () => {
  it("orders members and answers by their stable canonical keys", () => {
    const opponent = createOpponent();
    expect(orderOpponentMembers(opponent.members).map((member) => member.displayName)).toEqual([
      "Avery",
      "Blair",
    ]);
    expect(orderOpponentAnswers(opponent.answers).map((answer) => answer.sortOrder)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("renders city, description, two labeled images, and six ordered answers", async () => {
    const view = await render(<MatchedDuoProfile opponent={createOpponent()} />);
    expect(view.getByText("Toronto, Ontario")).toBeTruthy();
    expect(view.getByText("Late-night food and arcade regulars.")).toBeTruthy();
    expect(view.getByLabelText("Avery's Duo Profile image")).toBeTruthy();
    expect(view.getByLabelText("Blair's Duo Profile image")).toBeTruthy();
    const questions = view.getAllByText(/^Question/).map((node) => node.props.children);
    expect(questions).toEqual([
      "Question 1",
      "Question 2",
      "Question 3",
      "Question 4",
      "Question 5",
      "Question 6",
    ]);
    expect(view.queryAllByText(/PROMPT \d OF 6/)).toHaveLength(0);
    expect(view.queryAllByText(/Answered by|member_a|member_b/)).toHaveLength(0);
    const memberASignatures = view.getAllByText(" — Avery");
    const memberBSignatures = view.getAllByText(" — Blair");
    expect(memberASignatures).toHaveLength(3);
    expect(memberBSignatures).toHaveLength(3);
    expect(StyleSheet.flatten(memberASignatures[0].props.style).color).toBe(lobbyColors.memberA);
    expect(StyleSheet.flatten(memberBSignatures[0].props.style).color).toBe(lobbyColors.memberB);
  });

  it("shows one image without a placeholder and omits the image section when both are absent", async () => {
    const oneImageOpponent = createOpponent([{ ...memberB, imagePath: null, imageUrl: null }, memberA]);
    const oneImageView = await render(<MatchedDuoProfile opponent={oneImageOpponent} />);
    expect(oneImageView.getByLabelText("Avery's Duo Profile image")).toBeTruthy();
    expect(oneImageView.queryByLabelText("Blair's Duo Profile image")).toBeNull();
    await cleanup();

    const noImageOpponent = createOpponent([
      { ...memberB, imagePath: null, imageUrl: null },
      { ...memberA, imagePath: null, imageUrl: null },
    ]);
    const noImageView = await render(<MatchedDuoProfile opponent={noImageOpponent} />);
    expect(noImageView.queryByLabelText("Matched duo images")).toBeNull();
  });

  it("renders matching menu and chat navigation actions", async () => {
    const openMenu = jest.fn();
    const openChat = jest.fn();
    const view = await render(
      <LobbyHeader
        showBack
        title="Neon Neighbours"
        subtitle="Avery / Blair"
        onBack={openMenu}
        rightActionLabel="CHAT →"
        rightActionAccessibilityLabel="Open matched duo chat"
        onRightAction={openChat}
      />,
    );
    expect(view.getByText("Neon Neighbours")).toBeTruthy();
    expect(view.getByText("Avery / Blair")).toBeTruthy();
    await fireEvent.press(view.getByLabelText("Back to main menu"));
    await fireEvent.press(view.getByLabelText("Open matched duo chat"));
    expect(openMenu).toHaveBeenCalledTimes(1);
    expect(openChat).toHaveBeenCalledTimes(1);
  });
});
