import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";

export function AuthCallbackScreen() {
  const {
    authLinkError,
    clearAuthLinkError,
    configurationError,
    isAuthenticated,
    isInitializing,
    isPasswordRecovery,
    isProcessingAuthLink,
  } = useAuth();

  useEffect(() => {
    if (isInitializing || isProcessingAuthLink || authLinkError) return;

    if (isPasswordRecovery) {
      router.replace("/update-password");
    } else if (isAuthenticated) {
      router.replace("/");
    }
  }, [
    authLinkError,
    isAuthenticated,
    isInitializing,
    isPasswordRecovery,
    isProcessingAuthLink,
  ]);

  if (configurationError) {
    return <ConfigurationRequiredScreen />;
  }

  if (isInitializing || isProcessingAuthLink) {
    return <LoadingView label="Finishing authentication…" />;
  }

  if (authLinkError) {
    return (
      <Screen contentContainerStyle={styles.screen}>
        <AppText accessibilityRole="header">Authentication link failed</AppText>
        <AppText accessibilityLiveRegion="polite">{authLinkError}</AppText>
        <AppButton
          label="Return to sign in"
          onPress={() => {
            clearAuthLinkError();
            router.replace("/sign-in");
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">No authentication session found</AppText>
      <AppText>The link may be incomplete, expired, or already used.</AppText>
      <AppButton label="Return to sign in" onPress={() => router.replace("/sign-in")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
});
