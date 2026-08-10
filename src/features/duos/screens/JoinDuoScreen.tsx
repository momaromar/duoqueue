import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { getInvitationPreview, joinDuo } from "@/src/features/duos/duoService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  invitationCodeSchema,
  joinDuoSchema,
  type InvitationCodeValues,
  type JoinDuoValues,
} from "@/src/features/duos/schemas";
import {
  currentDuoStateKey,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function JoinDuoScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);

  if (duoQuery.isPending) return <LoadingView label="Loading duo setup…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (duoQuery.data.duo) return <Redirect href="/waiting-for-friend" />;

  return <JoinDuoForm initialDisplayName={duoQuery.data.profile?.displayName ?? ""} />;
}

function JoinDuoForm({ initialDisplayName }: { initialDisplayName: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const codeForm = useForm<InvitationCodeValues>({
    resolver: zodResolver(invitationCodeSchema),
    defaultValues: { invitationCode: "" },
  });
  const joinForm = useForm<JoinDuoValues>({
    resolver: zodResolver(joinDuoSchema),
    defaultValues: { displayName: initialDisplayName },
  });
  const lookupMutation = useMutation({ mutationFn: getInvitationPreview });
  const joinMutation = useMutation({
    mutationFn: ({ code, displayName }: { code: string; displayName: string }) =>
      joinDuo(code, displayName),
  });

  const lookup = async ({ invitationCode }: InvitationCodeValues) => {
    setLookupError(null);
    try {
      await lookupMutation.mutateAsync(invitationCode);
    } catch (error) {
      setLookupError(getErrorMessage(error));
    }
  };

  const confirmJoin = async ({ displayName }: JoinDuoValues) => {
    const preview = lookupMutation.data;
    if (!preview) return;

    setJoinError(null);
    try {
      await joinMutation.mutateAsync({ code: preview.code, displayName });
      await queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) });
      router.replace("/waiting-for-friend");
    } catch (error) {
      setJoinError(getErrorMessage(error));
    }
  };

  const decline = () => {
    lookupMutation.reset();
    setLookupError(null);
    setJoinError(null);
    codeForm.reset();
  };

  if (lookupMutation.data) {
    const preview = lookupMutation.data;
    return (
      <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
        <AppText accessibilityRole="header">Review invitation</AppText>
        <AppText>{preview.inviterDisplayName} invited you to join:</AppText>
        <AppText>Duo: {preview.duoName}</AppText>
        <AppText>City or region: {preview.city}</AppText>
        {preview.description && <AppText>Description: {preview.description}</AppText>}
        <AppText>Invitation expires: {new Date(preview.expiresAt).toLocaleString()}</AppText>
        <View style={styles.form}>
          <Controller
            control={joinForm.control}
            name="displayName"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <AppInput
                label="Your display name"
                placeholder="Sam"
                autoCapitalize="words"
                maxLength={40}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />
          {joinError && <AppText accessibilityLiveRegion="polite">{joinError}</AppText>}
          <AppButton
            label="Join this duo"
            loading={joinMutation.isPending}
            onPress={joinForm.handleSubmit(confirmJoin)}
          />
          <AppButton label="Decline" disabled={joinMutation.isPending} onPress={decline} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Join a duo</AppText>
      <AppText>Enter the invitation code your friend shared with you.</AppText>
      <View style={styles.form}>
        <Controller
          control={codeForm.control}
          name="invitationCode"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AppInput
              label="Invitation code"
              placeholder="ABCDE-FGHIJ"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={11}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={error?.message}
            />
          )}
        />
        {lookupError && <AppText accessibilityLiveRegion="polite">{lookupError}</AppText>}
        <AppButton
          label="Review invitation"
          loading={lookupMutation.isPending}
          onPress={codeForm.handleSubmit(lookup)}
        />
        <AppButton label="Back" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 }, form: { gap: 12 } });
