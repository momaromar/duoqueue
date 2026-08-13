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
  draftContributionFormSchema,
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

function formDefaults(state: DuoProfileState): ContributionFormValues {
  return {
    answers: state.assignedPrompts.map((prompt) => {
      const savedAnswer = state.ownAnswers.find((answer) => answer.promptId === prompt.id);
      let responseText = "";
      if (savedAnswer) responseText = savedAnswer.responseText;
      return { promptId: prompt.id, responseText };
    }),
  };
}

export function DuoContributionsScreen() {
  const { user } = useAuth();
  const profileQuery = useDuoProfileState(user?.id);

  if (profileQuery.isPending) return <LoadingView label="Loading your prompts…" />;
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }
  if (profileQuery.data.duo.status !== "active") return <Redirect href="/waiting-for-friend" />;
  if (profileQuery.data.currentMember.submittedAt) {
    return <Redirect href="/duo-profile-preview" />;
  }

  return <ContributionForm state={profileQuery.data} />;
}

function ContributionForm({ state }: { state: DuoProfileState }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const form = useForm<ContributionFormValues>({ defaultValues: formDefaults(state) });
  const mutation = useMutation({
    mutationFn: ({ values, submit }: { values: ContributionFormValues; submit: boolean }) =>
      saveContributions(values, submit),
  });

  const validate = (submit: boolean) => {
    form.clearErrors();
    const values = form.getValues();
    let result = draftContributionFormSchema.safeParse(values);
    if (submit) result = submittedContributionFormSchema.safeParse(values);
    if (result.success) return result.data;

    result.error.issues.forEach((issue) => {
      const index = issue.path[1];
      if (typeof index === "number") {
        form.setError(`answers.${index}.responseText`, { message: issue.message });
      }
    });
    return null;
  };

  const save = async (submit: boolean) => {
    setMessage(null);
    setActionError(null);
    const values = validate(submit);
    if (!values) return;
    try {
      await mutation.mutateAsync({ values, submit });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: duoProfileStateKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) }),
      ]);
      if (submit) {
        router.replace("/duo-profile-preview");
        return;
      }
      setMessage("Draft saved. Your partner cannot see it until you submit.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Your side of {state.duo.name}</AppText>
      <AppText>
        You are {state.currentMember.displayName} ({state.currentMember.colorKey}). Answer only
        your three assigned prompts. Drafts stay private until you submit.
      </AppText>
      <ContributionFields control={form.control} prompts={state.assignedPrompts} />
      {message && <AppText accessibilityLiveRegion="polite">{message}</AppText>}
      {actionError && <AppText accessibilityLiveRegion="polite">{actionError}</AppText>}
      <AppButton
        label="Save draft"
        loading={mutation.isPending}
        onPress={() => void save(false)}
      />
      <AppButton
        label="Submit all three answers"
        disabled={mutation.isPending}
        onPress={() => void save(true)}
      />
      <AppText>After submission, you can still edit your own answers.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 } });
