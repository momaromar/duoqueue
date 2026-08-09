import { useState } from "react";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function AuthenticatedHomeScreen() {
  const { signOut, user } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  let userLabel = "an authenticated user";
  if (user?.email) userLabel = user.email;

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
      <AppText>PROTECTED ROUTE</AppText>
      <AppText accessibilityRole="header">You’re in.</AppText>
      <AppText>Signed in as {userLabel}.</AppText>
      <AppText>
        You’ve entered the authenticated portion of DuoQueue. Onboarding will be built in a
        future milestone.
      </AppText>
      {signOutError && <AppText accessibilityLiveRegion="polite">{signOutError}</AppText>}
      <AppButton label="Sign out" onPress={submitSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
});
