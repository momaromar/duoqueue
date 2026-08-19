import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import {
  chooseAndUploadProfileImage,
  removeProfileImage,
} from "@/src/features/duo-profile/duoProfileService";
import type { MemberColorKey } from "@/src/features/duo-profile/schemas";
import {
  duoProfileStateKey,
  useDuoProfileState,
} from "@/src/features/duo-profile/useDuoProfileState";
import { currentDuoStateKey } from "@/src/features/duos/useCurrentDuoState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

function colorStyle(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return styles.memberA;
  return styles.memberB;
}

function submissionLabel(submittedAt: string | null) {
  if (submittedAt) return "Submitted";
  return "Still answering";
}

function imageButtonLabel(imagePath: string | null | undefined) {
  if (imagePath) return "Replace my image";
  return "Choose my image";
}

export function DuoProfilePreviewScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useDuoProfileState(user?.id);
  const refetchProfile = profileQuery.refetch;
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const imageMutation = useMutation({
    mutationFn: async () => {
      if (!profileQuery.data) throw new Error("The Duo Profile is not loaded.");
      return chooseAndUploadProfileImage(
        profileQuery.data.duo.id,
        profileQuery.data.currentMember.userId,
      );
    },
  });
  const removeMutation = useMutation({ mutationFn: removeProfileImage });

  useFocusEffect(useCallback(() => {
    if (user?.id) void refetchProfile();
  }, [refetchProfile, user?.id]));

  if (profileQuery.isPending) return <LoadingView label="Loading Duo Profile…" />;
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }

  const state = profileQuery.data;
  const currentImage = state.members.find(
    (member) => member.userId === state.currentMember.userId,
  );

  const refreshProfile = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: duoProfileStateKey(user?.id) }),
      queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) }),
    ]);
  };

  const chooseImage = async () => {
    setActionError(null);
    setMessage(null);
    try {
      const changed = await imageMutation.mutateAsync();
      if (!changed) return;
      await refreshProfile();
      setMessage("Your image was updated.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const removeImage = async () => {
    setActionError(null);
    setMessage(null);
    try {
      await removeMutation.mutateAsync();
      await refreshProfile();
      setMessage("Your image was removed.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">{state.duo.name}</AppText>
      <AppText>{state.duo.city}</AppText>
      {state.duo.description && <AppText>{state.duo.description}</AppText>}

      <View style={styles.section}>
        <AppText accessibilityRole="header">Member progress</AppText>
        {state.members.map((member) => (
          <View key={member.userId} style={[styles.memberCard, colorStyle(member.colorKey)]}>
            <AppText>{member.displayName} · {member.colorKey}</AppText>
            <AppText>{submissionLabel(member.submittedAt)}</AppText>
            {member.imageUrl && (
              <Image
                source={member.imageUrl}
                accessibilityLabel={`${member.displayName}'s optional Duo Profile image`}
                style={styles.image}
                contentFit="cover"
              />
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <AppText accessibilityRole="header">Combined answers</AppText>
        {state.combinedAnswers.length === 0 && (
          <AppText>Submitted answers will appear here. Drafts remain private.</AppText>
        )}
        {state.combinedAnswers.map((answer) => (
          <View key={answer.promptId} style={[styles.answerCard, colorStyle(answer.colorKey)]}>
            <AppText>Prompt {answer.sortOrder} of 6</AppText>
            <AppText>{answer.promptText}</AppText>
            <AppText>{answer.responseText}</AppText>
            <AppText>Answered by {answer.displayName} · {answer.colorKey}</AppText>
          </View>
        ))}
      </View>

      {!state.currentMember.submittedAt && (
        <AppButton label="Answer my prompts" onPress={() => router.replace("/duo-contributions")} />
      )}
      {state.currentMember.submittedAt && (
        <AppButton label="Edit my answers" onPress={() => router.push("/duo/edit-contributions")} />
      )}

      <View style={styles.section}>
        <AppText accessibilityRole="header">Your optional image</AppText>
        <AppText>
          Choose an image that represents your side of the duo—it can be anything and does not
          need to show you.
        </AppText>
        <AppButton
          label={imageButtonLabel(currentImage?.imagePath)}
          loading={imageMutation.isPending}
          disabled={removeMutation.isPending}
          onPress={() => void chooseImage()}
        />
        {currentImage?.imagePath && (
          <AppButton
            label="Remove my image"
            loading={removeMutation.isPending}
            disabled={imageMutation.isPending}
            onPress={() => void removeImage()}
          />
        )}
      </View>

      {message && <AppText accessibilityLiveRegion="polite">{message}</AppText>}
      {actionError && <AppText accessibilityLiveRegion="polite">{actionError}</AppText>}
      <AppButton
        label="Refresh progress"
        loading={profileQuery.isFetching}
        onPress={() => void profileQuery.refetch()}
      />
      {state.duo.profileComplete && (
        <AppButton label="Finish onboarding" onPress={() => router.push("/complete")} />
      )}
      {!state.duo.profileComplete && state.currentMember.submittedAt && (
        <AppText>Your answers are submitted. This profile completes when your partner submits.</AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  section: { gap: 10, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 16, backgroundColor: lobbyColors.surface, padding: 16 },
  memberCard: { gap: 6, borderWidth: 1, borderRadius: 12, backgroundColor: lobbyColors.surfaceRaised, padding: 12 },
  answerCard: { gap: 8, borderWidth: 1, borderRadius: 12, backgroundColor: lobbyColors.surfaceRaised, padding: 12 },
  memberA: { borderColor: lobbyColors.memberA },
  memberB: { borderColor: lobbyColors.memberB },
  image: { width: 160, height: 160, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12 },
});
