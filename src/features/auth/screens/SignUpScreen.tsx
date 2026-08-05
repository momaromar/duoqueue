import { Ionicons } from "@expo/vector-icons";
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
import { colors, radii, spacing } from "@/src/theme/tokens";

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
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value ? <Ionicons name="checkmark" size={18} color={colors.white} /> : null}
                </View>
                <AppText style={styles.agreementText}>
                  I agree to the Terms and Privacy Policy placeholders.
                </AppText>
              </Pressable>
              {error ? <AppText color="error" variant="caption">{error.message}</AppText> : null}
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
          variant="text"
          onPress={() => router.replace("/sign-in")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  form: { gap: spacing.md },
  agreementGroup: { gap: spacing.xs },
  agreementRow: { flexDirection: "row", alignItems: "center", minHeight: 48, gap: spacing.sm },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  agreementText: { flex: 1 },
});
