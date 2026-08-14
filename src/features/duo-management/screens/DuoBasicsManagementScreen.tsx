import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ManagementInput } from "@/src/features/duo-management/components/ManagementInput";
import { updateActiveDuoBasics } from "@/src/features/duo-management/duoManagementService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  editDuoSchema,
  type CurrentDuoState,
  type EditDuoValues,
} from "@/src/features/duos/schemas";
import { currentDuoStateKey, useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function DuoBasicsManagementScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);

  if (duoQuery.isPending) return <LoadingView label="Loading duo basicsâ€¦" />;
  if (duoQuery.error) return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  if (!duoQuery.data.duo) return <Redirect href="/duo-choice" />;
  if (duoQuery.data.duo.status !== "active") return <Redirect href="/waiting-for-friend" />;

  return <DuoBasicsForm duo={duoQuery.data.duo} />;
}

type ActiveDuo = NonNullable<CurrentDuoState["duo"]>;

function DuoBasicsForm({ duo }: { duo: ActiveDuo }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const form = useForm<EditDuoValues>({
    resolver: zodResolver(editDuoSchema),
    defaultValues: { duoName: duo.name, city: duo.city, description: duo.description ?? "" },
  });
  const mutation = useMutation({ mutationFn: updateActiveDuoBasics });

  const submit = async (values: EditDuoValues) => {
    setActionError(null);
    try {
      await mutation.mutateAsync(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ["duo-profile", "current", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["duo-management"] }),
      ]);
      router.back();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Duo Basics" subtitle="Both members share these details." />
      <Controller control={form.control} name="duoName" render={({ field, fieldState }) => (
        <ManagementInput label="Duo name" value={field.value} maxLength={50} autoCapitalize="words" onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={form.control} name="city" render={({ field, fieldState }) => (
        <ManagementInput label="City or broad region" value={field.value} maxLength={80} autoCapitalize="words" onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={form.control} name="description" render={({ field, fieldState }) => (
        <ManagementInput label="Description (optional)" value={field.value} maxLength={240} multiline onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )} />
      <Text style={styles.note}>Changing the region updates future queue entries. An existing ticket keeps its original region snapshot.</Text>
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
      <LobbyButton label="SAVE CHANGES" disabled={mutation.isPending} onPress={form.handleSubmit(submit)} />
      <LobbyButton label="CANCEL" disabled={mutation.isPending} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  note: { color: lobbyColors.muted, lineHeight: 20 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
