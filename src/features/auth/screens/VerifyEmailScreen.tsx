import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function VerifyEmailScreen() {
  const parameters = useLocalSearchParams<{ email?: string | string[] }>();
  let email = parameters.email;
  if (Array.isArray(email)) email = email[0];
  const { resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  let recipient = "";
  if (email) recipient = ` to ${email}`;

  const resend = async () => {
    if (!email) return;
    setMessage(null);
    setIsResending(true);
    try {
      await resendVerification(email);
      setMessage("A new verification email was sent.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const openEmail = async () => {
    setMessage(null);
    try {
      await Linking.openURL("mailto:");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Verify your email</AppText>
      <AppText>
        We sent a confirmation link{recipient}. Open it on this device
        to finish creating your account.
      </AppText>
      <View style={styles.actions}>
        <AppButton label="Open email app" onPress={openEmail} />
        <AppButton
          label="Resend verification email"
          loading={isResending}
          disabled={!email}
          onPress={resend}
        />
        <AppButton label="Return to sign in" onPress={() => router.replace("/sign-in")} />
      </View>
      {!email && <AppText>Return to sign up to enter your email again.</AppText>}
      {message && <AppText accessibilityLiveRegion="polite">{message}</AppText>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  actions: { gap: 8 },
});
