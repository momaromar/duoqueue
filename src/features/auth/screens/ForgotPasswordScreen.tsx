import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { AuthScreenHeader } from "@/src/features/auth/screens/AuthScreenHeader";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/src/schemas/auth";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = async ({ email }: ForgotPasswordValues) => {
    setSubmitError(null);
    try {
      await requestPasswordReset(email);
      setSubmittedEmail(email);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const form = (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AppInput
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="send"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={error?.message}
            onSubmitEditing={handleSubmit(submit)}
          />
        )}
      />
      {submitError && <AppText accessibilityLiveRegion="polite">{submitError}</AppText>}
      <AppButton
        label="Send reset instructions"
        loading={isSubmitting}
        onPress={handleSubmit(submit)}
      />
    </View>
  );

  let content = form;
  if (submittedEmail) {
    content = (
      <View style={styles.confirmation} accessibilityLiveRegion="polite">
        <AppText accessibilityRole="header">Check your inbox</AppText>
        <AppText>Password reset instructions were sent to {submittedEmail}.</AppText>
        <AppButton label="Back to sign in" onPress={() => router.replace("/sign-in")} />
        <AppButton label="Try another email" onPress={() => setSubmittedEmail(null)} />
      </View>
    );
  }

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AuthScreenHeader
        title="Reset your password"
        description="Enter your email and we’ll send password reset instructions."
      />
      {content}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  form: { gap: 12, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 16, backgroundColor: lobbyColors.surface, padding: 18 },
  confirmation: { gap: 12, borderWidth: 1, borderColor: lobbyColors.green, borderRadius: 16, backgroundColor: lobbyColors.surface, padding: 18 },
});
