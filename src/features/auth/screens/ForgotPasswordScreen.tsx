import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { AuthScreenHeader } from "@/src/features/auth/screens/AuthScreenHeader";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/src/schemas/auth";
import { colors, radii, spacing } from "@/src/theme/tokens";

export function ForgotPasswordScreen() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = async ({ email }: ForgotPasswordValues) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    setSubmittedEmail(email);
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AuthScreenHeader
        title="Reset your password"
        description="Enter your email and we’ll simulate sending reset instructions."
      />

      {submittedEmail ? (
        <View style={styles.confirmation} accessibilityLiveRegion="polite">
          <AppText variant="subtitle" color="success">Check your inbox</AppText>
          <AppText color="textMuted">
            Mock reset instructions were sent to {submittedEmail}. No real email was sent.
          </AppText>
          <AppButton label="Back to sign in" onPress={() => router.replace("/sign-in")} />
          <AppButton
            label="Try another email"
            variant="text"
            onPress={() => setSubmittedEmail(null)}
          />
        </View>
      ) : (
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
          <AppButton
            label="Send reset instructions"
            loading={isSubmitting}
            onPress={handleSubmit(submit)}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  form: { gap: spacing.md },
  confirmation: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
});
