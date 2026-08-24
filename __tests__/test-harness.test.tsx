import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { normalizeInvitationCode } from "@/src/features/duos/schemas";

describe("test harness", () => {
  it("renders React Native components and resolves the project alias", async () => {
    await render(<Text>{normalizeInvitationCode("ab12-cd34-ef")}</Text>);

    expect(screen.getByText("AB12CD34EF")).toBeTruthy();
  });
});
