import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ContributionFields } from "@/src/features/duo-profile/components/ContributionFields";
import { saveContributions } from "@/src/features/duo-profile/duoProfileService";
import {
  submittedContributionFormSchema,
  type ContributionFormValues,
  type DuoProfileState,
} from "@/src/features/duo-profile/schemas";
import {
  duoProfileStateKey,
  useDuoProfileState,
} from "@/src/features/duo-profile/useDuoProfileState";
import { currentDuoStateKey } from "@/src/features/duos/useCurrentDuoState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

function defaults(state: DuoProfileState): ContributionFormValues {
  return {
    answers: state.assignedPrompts.map((prompt) => {
      const saved = state.ownAnswers.find((answer) => answer.promptId === prompt.id);
      let responseText = "";
      if (saved) responseText = saved.responseText;
      return { promptId: prompt.id, responseText };
    }),
  };
}

export function EditContributionsScreen() {
  const { user } = useAuth();
  const profileQuery = useDuoProfileState(user?.id);

  if (profileQuery.isPending) return <LoadingView label="Loading your answers…" />;
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }
  if (!profileQuery.data.currentMember.submittedAt) {
    return <Redirect href="/duo-contributions" />;
  }

  return <EditForm state={profileQuery.data} />;
}

function EditForm({ state }: { state: DuoProfileState }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const form = useForm<ContributionFormValues>({ defaultValues: defaults(state) });
  const mutation = useMutation({ mutationFn: (values: ContributionFormValues) =>
    saveContributions(values, true) });

  const save = async () => {
    setActionError(null);
    form.clearErrors();
    const result = submittedContributionFormSchema.safeParse(form.getValues());
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const index = issue.path[1];
        if (typeof index === "number") {
          form.setError(`answers.${index}.responseText`, { message: issue.message });
        }
      });
      return;
    }
    try {
      await mutation.mutateAsync(result.data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: duoProfileStateKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) }),
      ]);
      router.replace("/duo-profile-preview");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Edit your answers</AppText>
      <AppText>You can change only the three prompts assigned to your member color.</AppText>
      <ContributionFields control={form.control} prompts={state.assignedPrompts} />
      {actionError && <AppText accessibilityLiveRegion="polite">{actionError}</AppText>}
      <AppButton label="Save changes" loading={mutation.isPending} onPress={() => void save()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 } });
