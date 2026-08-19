import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { PasswordInput } from "@/src/components/common/PasswordInput";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { AuthScreenHeader } from "@/src/features/auth/screens/AuthScreenHeader";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { signInSchema, type SignInValues } from "@/src/schemas/auth";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function SignInScreen() {
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = async (values: SignInValues) => {
    setSubmitError(null);
    try {
      await signIn(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AuthScreenHeader
        title="Welcome back"
        description="Sign in to keep building your circle."
      />
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
              returnKeyType="next"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              autoComplete="current-password"
              returnKeyType="done"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={error?.message}
              onSubmitEditing={handleSubmit(submit)}
            />
          )}
        />
        <AppButton label="Forgot password?" onPress={() => router.push("/forgot-password")} />
        {submitError && <AppText accessibilityLiveRegion="polite">{submitError}</AppText>}
        <AppButton label="Sign in" loading={isSubmitting} onPress={handleSubmit(submit)} />
        <AppButton
          label="New here? Create an account"
          onPress={() => router.replace("/sign-up")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  form: { gap: 12, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 16, backgroundColor: lobbyColors.surface, padding: 18 },
});
