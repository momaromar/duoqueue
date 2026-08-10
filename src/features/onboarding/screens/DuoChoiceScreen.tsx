import { useState } from "react";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function DuoChoiceScreen() {
  const { signOut } = useAuth();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const submitSignOut = async () => {
    setSignOutError(null);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(getErrorMessage(error));
    }
  };

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Set up your duo</AppText>
      <AppText>
        DuoQueue is built for two friends meeting another pair together. You and your
        friend will share one Duo Profile instead of creating public individual profiles.
      </AppText>
      <AppText>Choose how you plan to form your duo.</AppText>
      <AppButton
        label="Create a duo"
        onPress={() =>
          setActionMessage("Creating a duo will be available in the next phase.")
        }
      />
      <AppButton
        label="Join with invitation"
        onPress={() =>
          setActionMessage("Joining with an invitation will be available in the next phase.")
        }
      />
      {actionMessage && (
        <AppText accessibilityLiveRegion="polite">{actionMessage}</AppText>
      )}
      {signOutError && (
        <AppText accessibilityLiveRegion="polite">{signOutError}</AppText>
      )}
      <AppButton label="Sign out" onPress={submitSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
});
