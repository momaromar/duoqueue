import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { PasswordInput } from "@/src/components/common/PasswordInput";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";
import { updatePasswordSchema, type UpdatePasswordValues } from "@/src/schemas/auth";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function UpdatePasswordScreen() {
  const {
    configurationError,
    isAuthenticated,
    isInitializing,
    isPasswordRecovery,
    updatePassword,
  } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isInitializing || isPasswordRecovery) return;
    if (isAuthenticated) {
      router.replace("/(app)");
    } else {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isInitializing, isPasswordRecovery]);

  const submit = async ({ password }: UpdatePasswordValues) => {
    setSubmitError(null);
    try {
      await updatePassword(password);
      router.replace("/(app)");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  if (isInitializing) {
    return <LoadingView label="Loading recovery session…" />;
  }

  if (configurationError) {
    return <ConfigurationRequiredScreen />;
  }

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Choose a new password</AppText>
      <AppText>Enter and confirm the password you want to use.</AppText>
      <View style={styles.form}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <PasswordInput
              label="New password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <PasswordInput
              label="Confirm new password"
              placeholder="Enter it again"
              autoComplete="new-password"
              returnKeyType="done"
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
          label="Update password"
          loading={isSubmitting}
          disabled={!isPasswordRecovery}
          onPress={handleSubmit(submit)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  form: { gap: 12 },
});
