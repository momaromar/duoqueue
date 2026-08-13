import { router } from "expo-router";
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
      <AppText accessibilityRole="header">Onboarding complete.</AppText>
      <AppText>Signed in as {userLabel}.</AppText>
      <AppText>
        Your shared Duo Profile has all six contributed answers. The main product experience
        remains a later milestone.
      </AppText>
      {signOutError && <AppText accessibilityLiveRegion="polite">{signOutError}</AppText>}
      <AppButton label="View Duo Profile" onPress={() => router.push("/duo-profile-preview")} />
      <AppButton label="Edit my answers" onPress={() => router.push("/duo/edit-contributions")} />
      <AppButton label="Sign out" onPress={submitSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 } });
