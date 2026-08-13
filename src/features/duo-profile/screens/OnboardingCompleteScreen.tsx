import { Redirect, router } from "expo-router";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";

export function OnboardingCompleteScreen() {
  const { user } = useAuth();
  const profileQuery = useDuoProfileState(user?.id);

  if (profileQuery.isPending) return <LoadingView label="Checking Duo Profile…" />;
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }
  if (!profileQuery.data.duo.profileComplete) {
    return <Redirect href="/duo-profile-preview" />;
  }

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Your Duo Profile is complete</AppText>
      <AppText>
        All six answers are combined in canonical order and attributed to the member who
        answered them. Your optional images are included separately.
      </AppText>
      <AppButton label="Enter DuoQueue" onPress={() => router.replace("/(app)")} />
      <AppButton label="Review profile" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16, justifyContent: "center" } });
