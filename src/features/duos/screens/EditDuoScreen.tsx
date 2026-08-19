import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { DuoBasicsFields } from "@/src/features/duos/components/DuoBasicsFields";
import { updateFormingDuo } from "@/src/features/duos/duoService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  editDuoSchema,
  type CurrentDuoState,
  type EditDuoValues,
} from "@/src/features/duos/schemas";
import {
  currentDuoStateKey,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function EditDuoScreen() {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);

  if (duoQuery.isPending) return <LoadingView label="Loading duo…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (!duoQuery.data.duo) return <Redirect href="/duo-choice" />;
  if (duoQuery.data.duo.status !== "forming" || !duoQuery.data.duo.isCreator) {
    return <Redirect href="/waiting-for-friend" />;
  }

  return <EditDuoForm duo={duoQuery.data.duo} />;
}

type EditableDuo = NonNullable<CurrentDuoState["duo"]>;

function EditDuoForm({ duo }: { duo: EditableDuo }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<EditDuoValues>({
    resolver: zodResolver(editDuoSchema),
    defaultValues: {
      duoName: duo.name,
      city: duo.city,
      description: duo.description ?? "",
    },
  });
  const mutation = useMutation({ mutationFn: updateFormingDuo });

  const submit = async (values: EditDuoValues) => {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(values);
      await queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) });
      router.replace("/waiting-for-friend");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Edit duo basics</AppText>
      <View style={styles.form}>
        <DuoBasicsFields control={form.control} />
        {submitError && <AppText accessibilityLiveRegion="polite">{submitError}</AppText>}
        <AppButton
          label="Save changes"
          loading={mutation.isPending}
          onPress={form.handleSubmit(submit)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 }, form: { gap: 12 } });
