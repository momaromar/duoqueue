import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { deleteIncompleteDuo } from "@/src/features/duos/duoService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  currentDuoStateKey,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

export function WaitingForFriendScreen() {
  const { signOut, user } = useAuth();
  const queryClient = useQueryClient();
  const duoQuery = useCurrentDuoState(user?.id);
  const refetchDuo = duoQuery.refetch;
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const deleteMutation = useMutation({ mutationFn: deleteIncompleteDuo });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) void refetchDuo();
    }, [refetchDuo, user?.id]),
  );

  if (duoQuery.isPending) return <LoadingView label="Loading duo…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (!duoQuery.data.duo) return <Redirect href="/duo-choice" />;

  const duo = duoQuery.data.duo;

  const submitDelete = async () => {
    setActionError(null);
    try {
      await deleteMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) });
      router.replace("/duo-choice");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const submitSignOut = async () => {
    setActionError(null);
    try {
      await signOut();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">
        {duo.status === "active" && "Your duo is formed"}
        {duo.status === "forming" && "Waiting for your friend"}
      </AppText>
      <AppText>Duo: {duo.name}</AppText>
      <AppText>City or region: {duo.city}</AppText>
      {duo.description && <AppText>Description: {duo.description}</AppText>}
      <View style={styles.members}>
        <AppText>Members</AppText>
        {duo.members.map((member) => (
          <AppText key={member.userId}>
            {member.displayName} — {member.role} — {member.colorKey}
          </AppText>
        ))}
      </View>
      {duo.status === "active" && (
        <AppText>
          Both members are ready. Shared Duo Profile contributions arrive in Phase 5.
        </AppText>
      )}
      {duo.status === "forming" && (
        <AppText>
          Share the invitation code with one friend, then refresh this screen after they
          join.
        </AppText>
      )}
      {actionError && <AppText accessibilityLiveRegion="polite">{actionError}</AppText>}
      <AppButton
        label="Refresh"
        loading={duoQuery.isFetching}
        onPress={() => void duoQuery.refetch()}
      />
      {duo.status === "forming" && duo.isCreator && (
        <>
          <AppButton label="Invitation controls" onPress={() => router.push("/duo/invite")} />
          <AppButton label="Edit duo basics" onPress={() => router.push("/edit-duo")} />
          {!isConfirmingDelete && (
            <AppButton label="Delete incomplete duo" onPress={() => setIsConfirmingDelete(true)} />
          )}
          {isConfirmingDelete && (
            <View style={styles.confirmation}>
              <AppText>This permanently deletes the incomplete duo and its invitation.</AppText>
              <AppButton
                label="Confirm delete"
                loading={deleteMutation.isPending}
                onPress={submitDelete}
              />
              <AppButton
                label="Keep duo"
                disabled={deleteMutation.isPending}
                onPress={() => setIsConfirmingDelete(false)}
              />
            </View>
          )}
        </>
      )}
      <AppButton label="Sign out" onPress={submitSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  members: { gap: 8 },
  confirmation: { gap: 12 },
});
