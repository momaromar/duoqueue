import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { PasswordInput } from "@/src/components/common/PasswordInput";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { AuthScreenHeader } from "@/src/features/auth/screens/AuthScreenHeader";
import { signInSchema, type SignInValues } from "@/src/schemas/auth";
import { spacing } from "@/src/theme/tokens";

export function SignInScreen() {
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AuthScreenHeader
        title="Welcome back"
        description="Sign in to keep building your circle. Any valid details work in this mock."
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
              onSubmitEditing={handleSubmit(signIn)}
            />
          )}
        />
        <AppButton
          label="Forgot password?"
          variant="text"
          onPress={() => router.push("/forgot-password")}
          style={styles.forgotButton}
        />
        <AppButton label="Sign in" loading={isSubmitting} onPress={handleSubmit(signIn)} />
        <AppButton
          label="New here? Create an account"
          variant="text"
          onPress={() => router.replace("/sign-up")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  form: { gap: spacing.md },
  forgotButton: { alignSelf: "flex-end", marginTop: -spacing.sm },
});
