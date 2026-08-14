import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ManagementInput } from "@/src/features/duo-management/components/ManagementInput";
import { updateQueuePreferences } from "@/src/features/duo-management/duoManagementService";
import {
  queuePreferencesFormSchema,
  type QueuePreferencesFormValues,
  type QueuePreferencesState,
} from "@/src/features/duo-management/schemas";
import { queuePreferencesKey, useQueuePreferences } from "@/src/features/duo-management/useQueuePreferences";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { currentDuoStateKey, useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function QueuePreferencesScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const preferencesQuery = useQueuePreferences(user?.id);

  if (duoQuery.isPending || preferencesQuery.isPending) return <LoadingView label="Loading queue preferencesâ€¦" />;
  const error = duoQuery.error ?? preferencesQuery.error;
  if (error) return <DuoStateErrorScreen error={error} onRetry={() => void preferencesQuery.refetch()} />;
  const duoState = duoQuery.data;
  const preferences = preferencesQuery.data;
  if (!duoState || !preferences) return <LoadingView label="Loading queue preferencesâ€¦" />;
  if (!duoState.duo) return <Redirect href="/duo-choice" />;
  if (duoState.duo.status !== "active") return <Redirect href="/waiting-for-friend" />;

  return <QueuePreferencesForm initial={preferences} />;
}

function QueuePreferencesForm({ initial }: { initial: QueuePreferencesState }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const form = useForm<QueuePreferencesFormValues>({
    resolver: zodResolver(queuePreferencesFormSchema),
    defaultValues: {
      region: initial.region,
      minimumAge: initial.minimumAge?.toString() ?? "",
      maximumAge: initial.maximumAge?.toString() ?? "",
      activities: initial.activities.join(", "),
      availability: initial.availability.join("\n"),
    },
  });
  const mutation = useMutation({ mutationFn: updateQueuePreferences });

  const submit = async (values: QueuePreferencesFormValues) => {
    setActionError(null);
    setSaved(false);
    try {
      const next = await mutation.mutateAsync(values);
      queryClient.setQueryData(queuePreferencesKey(user?.id), next);
      await queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) });
      setSaved(true);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Queue Preferences" subtitle="Shared settings for future queue entries." />
      <View style={styles.activeNotice}>
        <Text style={styles.activeTitle}>ACTIVE MATCHING RULE</Text>
        <Text style={styles.copy}>Only normalized region affects Phase 9 matchmaking. Age, activity, and availability preferences are stored but are not applied until compatibility rules are expanded.</Text>
      </View>
      <Controller control={form.control} name="region" render={({ field, fieldState }) => (
        <ManagementInput label="City or broad region" value={field.value} maxLength={80} autoCapitalize="words" onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )} />
      <View style={styles.ageRow}>
        <View style={styles.ageField}><Controller control={form.control} name="minimumAge" render={({ field, fieldState }) => (
          <ManagementInput label="Minimum age (optional)" value={field.value} keyboardType="number-pad" maxLength={3} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
        )} /></View>
        <View style={styles.ageField}><Controller control={form.control} name="maximumAge" render={({ field, fieldState }) => (
          <ManagementInput label="Maximum age (optional)" value={field.value} keyboardType="number-pad" maxLength={3} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
        )} /></View>
      </View>
      <Controller control={form.control} name="activities" render={({ field, fieldState }) => (
        <ManagementInput label="Preferred activities (optional, comma-separated)" value={field.value} multiline onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={form.control} name="availability" render={({ field, fieldState }) => (
        <ManagementInput label="Availability (optional, one entry per line)" value={field.value} multiline onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )} />
      {saved && <Text accessibilityLiveRegion="polite" style={styles.saved}>Preferences saved.</Text>}
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
      <LobbyButton label="SAVE PREFERENCES" disabled={mutation.isPending} onPress={form.handleSubmit(submit)} />
      <LobbyButton label="BACK" disabled={mutation.isPending} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  activeNotice: { gap: 7, borderWidth: 1, borderColor: lobbyColors.cyan, borderRadius: 12, backgroundColor: "#081E36", padding: 14 },
  activeTitle: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1.4 },
  copy: { color: lobbyColors.text, lineHeight: 20 },
  ageRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  ageField: { flex: 1, minWidth: 180 },
  saved: { color: lobbyColors.green, textAlign: "center" },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
