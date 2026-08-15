import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/features/auth/AuthContext";
import { ManagementInput } from "@/src/features/duo-management/components/ManagementInput";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { changePasswordWithNonceSchema, type ChangePasswordWithNonceValues } from "@/src/schemas/auth";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function ChangePasswordScreen() {
  const { requestPasswordReauthentication, updatePasswordWithNonce, user } = useAuth();
  const [codeSent, setCodeSent] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const form = useForm<ChangePasswordWithNonceValues>({
    resolver: zodResolver(changePasswordWithNonceSchema),
    defaultValues: { nonce: "", password: "", confirmPassword: "" },
  });

  const requestCode = async () => {
    setIsRequesting(true);
    setActionError(null);
    setStatus(null);
    try {
      await requestPasswordReauthentication();
      setCodeSent(true);
      setStatus(`A verification code was sent to ${user?.email ?? "your email"}.`);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsRequesting(false);
    }
  };

  const submit = async (values: ChangePasswordWithNonceValues) => {
    setIsUpdating(true);
    setActionError(null);
    setStatus(null);
    try {
      await updatePasswordWithNonce(values.password, values.nonce.trim());
      setIsComplete(true);
      form.reset();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isComplete) {
    return (
      <LobbyScreen contentContainerStyle={styles.screen}>
        <LobbyHeader title="Password Updated" subtitle="Your account password has been changed." />
        <View style={styles.successPanel}>
          <Text style={styles.successTitle}>CHANGE COMPLETE</Text>
          <Text style={styles.copy}>You remain signed in on this device. Use the new password the next time you sign in.</Text>
        </View>
        <LobbyButton label="RETURN TO ACCOUNT" onPress={() => router.replace("/(app)/account")} />
      </LobbyScreen>
    );
  }

  const busy = isRequesting || isUpdating;
  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Change Password" subtitle="Confirm this sensitive change through your verified email." />
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>EMAIL VERIFICATION REQUIRED</Text>
        <Text style={styles.copy}>Request a six-digit code, then enter it with a new password of at least eight characters. Codes can expire or be rate-limited.</Text>
      </View>
      {!codeSent && (
        <LobbyButton label="SEND VERIFICATION CODE" detail={user?.email ?? "AUTHENTICATED EMAIL"} disabled={busy} onPress={() => void requestCode()} />
      )}
      {codeSent && (
        <>
          <Controller control={form.control} name="nonce" render={({ field, fieldState }) => (
            <ManagementInput label="Six-digit verification code" value={field.value} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />
          <Controller control={form.control} name="password" render={({ field, fieldState }) => (
            <ManagementInput label="New password" value={field.value} secureTextEntry autoCapitalize="none" autoComplete="new-password" onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />
          <Controller control={form.control} name="confirmPassword" render={({ field, fieldState }) => (
            <ManagementInput label="Confirm new password" value={field.value} secureTextEntry autoCapitalize="none" autoComplete="new-password" onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />
          <LobbyButton label="UPDATE PASSWORD" disabled={busy} onPress={form.handleSubmit(submit)} />
          <LobbyButton label="SEND ANOTHER CODE" detail="REQUEST A NEW NONCE" disabled={busy} onPress={() => void requestCode()} />
        </>
      )}
      {status && <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text>}
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
      <LobbyButton label="BACK TO ACCOUNT" disabled={busy} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  notice: { gap: 7, borderWidth: 1, borderColor: lobbyColors.magenta, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 14 },
  noticeTitle: { color: lobbyColors.magenta, fontWeight: "900", letterSpacing: 1.3 },
  copy: { color: lobbyColors.text, lineHeight: 20 },
  successPanel: { gap: 7, borderWidth: 1, borderColor: lobbyColors.green, borderRadius: 12, backgroundColor: "#09241E", padding: 16 },
  successTitle: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 1.4 },
  status: { color: lobbyColors.green, lineHeight: 20 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
