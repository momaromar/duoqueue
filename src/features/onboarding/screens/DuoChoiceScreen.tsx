import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { cleanupPendingDisbandImages } from "@/src/features/duo-management/duoManagementService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function DuoChoiceScreen() {
  const { signOut, user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) void cleanupPendingDisbandImages();
  }, [user?.id]);

  const submitSignOut = async () => {
    setSignOutError(null);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(getErrorMessage(error));
    }
  };

  if (duoQuery.isPending) return <LoadingView label="Loading duo setup…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (duoQuery.data.duo) return <Redirect href="/waiting-for-friend" />;

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Set up your duo</AppText>
      <AppText>
        DuoQueue is built for two friends meeting another pair together. You and your
        friend will share one Duo Profile instead of creating public individual profiles.
      </AppText>
      <AppText>Choose how you plan to form your duo.</AppText>
      <AppButton label="Create a duo" onPress={() => router.push("/create-duo")} />
      <AppButton label="Join with invitation" onPress={() => router.push("/join-duo")} />
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
