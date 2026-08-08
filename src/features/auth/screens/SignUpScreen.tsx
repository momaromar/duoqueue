import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { PasswordInput } from "@/src/components/common/PasswordInput";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { AuthScreenHeader } from "@/src/features/auth/screens/AuthScreenHeader";
import { signUpSchema, type SignUpValues } from "@/src/schemas/auth";

export function SignUpScreen() {
  const { signUp } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AuthScreenHeader
        title="Create your account"
        description="Start with your account. You’ll connect with your friend in a later milestone."
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
              label="Confirm password"
              placeholder="Enter it again"
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
          name="agreedToTerms"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View style={styles.agreementGroup}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="Agree to the Terms and Privacy Policy placeholders"
                accessibilityState={{ checked: value }}
                onPress={() => onChange(!value)}
                style={styles.agreementRow}
              >
                <View style={styles.checkbox}>
                  <AppText>{value ? "✓" : ""}</AppText>
                </View>
                <AppText style={styles.agreementText}>
                  I agree to the Terms and Privacy Policy placeholders.
                </AppText>
              </Pressable>
              {error ? (
                <AppText accessibilityLiveRegion="polite">{error.message}</AppText>
              ) : null}
            </View>
          )}
        />
        <AppButton
          label="Create account"
          loading={isSubmitting}
          onPress={handleSubmit(signUp)}
        />
        <AppButton
          label="Already have an account? Sign in"
          onPress={() => router.replace("/sign-in")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  form: { gap: 12 },
  agreementGroup: { gap: 4 },
  agreementRow: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: 8 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  agreementText: { flex: 1 },
});
