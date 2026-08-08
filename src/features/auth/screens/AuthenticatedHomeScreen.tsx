import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";

export function AuthenticatedHomeScreen() {
  const { signOut } = useAuth();

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText>PROTECTED ROUTE</AppText>
      <AppText accessibilityRole="header">You’re in.</AppText>
      <AppText>
        You’ve entered the authenticated portion of DuoQueue. Onboarding will be built in a
        future milestone.
      </AppText>
      <AppButton label="Mock sign out" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
});
