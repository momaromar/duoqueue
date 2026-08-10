import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { DuoBasicsFields } from "@/src/features/duos/components/DuoBasicsFields";
import { createDuo } from "@/src/features/duos/duoService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  createDuoSchema,
  type CreateDuoValues,
  type EditDuoValues,
} from "@/src/features/duos/schemas";
import {
  currentDuoStateKey,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function CreateDuoScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);

  if (duoQuery.isPending) return <LoadingView label="Loading duo setup…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (duoQuery.data.duo) return <Redirect href="/waiting-for-friend" />;

  return <CreateDuoForm initialDisplayName={duoQuery.data.profile?.displayName ?? ""} />;
}

function CreateDuoForm({ initialDisplayName }: { initialDisplayName: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<CreateDuoValues>({
    resolver: zodResolver(createDuoSchema),
    defaultValues: {
      displayName: initialDisplayName,
      duoName: "",
      city: "",
      description: "",
    },
  });
  const mutation = useMutation({ mutationFn: createDuo });

  const submit = async (values: CreateDuoValues) => {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(values);
      void queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) });
      router.replace("/duo/invite");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Create your duo</AppText>
      <AppText>
        Your display name identifies your contributions and your duo invitation. Your
        email is never shown.
      </AppText>
      <View style={styles.form}>
        <Controller
          control={form.control}
          name="displayName"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AppInput
              label="Your display name"
              placeholder="Alex"
              autoCapitalize="words"
              maxLength={40}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={error?.message}
            />
          )}
        />
        <DuoBasicsFields control={form.control as unknown as Control<EditDuoValues>} />
        {submitError && <AppText accessibilityLiveRegion="polite">{submitError}</AppText>}
        <AppButton
          label="Create duo"
          loading={mutation.isPending}
          onPress={form.handleSubmit(submit)}
        />
        <AppButton label="Back" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 }, form: { gap: 12 } });
