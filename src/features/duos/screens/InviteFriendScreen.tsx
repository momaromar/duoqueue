import * as Clipboard from "expo-clipboard";
import { Redirect, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Share, StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { LoadingView } from "@/src/components/common/LoadingView";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import {
  cancelInvitation,
  regenerateInvitation,
} from "@/src/features/duos/duoService";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  currentDuoStateKey,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

function displayInvitationCode(code: string) {
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

export function InviteFriendScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const duoQuery = useCurrentDuoState(user?.id);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const cancelMutation = useMutation({ mutationFn: cancelInvitation });
  const regenerateMutation = useMutation({ mutationFn: regenerateInvitation });

  if (duoQuery.isPending) return <LoadingView label="Loading invitation…" />;
  if (duoQuery.isFetching && !duoQuery.data?.duo) {
    return <LoadingView label="Loading invitation…" />;
  }
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (!duoQuery.data.duo) return <Redirect href="/duo-choice" />;
  if (duoQuery.data.duo.status !== "forming" || !duoQuery.data.duo.isCreator) {
    return <Redirect href="/waiting-for-friend" />;
  }

  const duo = duoQuery.data.duo;
  const invitation = duo.invitation;
  let usableCode: string | null = null;
  if (invitation?.status === "pending") usableCode = invitation.code;

  const refreshState = async () => {
    await queryClient.invalidateQueries({ queryKey: currentDuoStateKey(user?.id) });
  };

  const copyCode = async () => {
    if (!usableCode) return;
    setActionError(null);
    const copied = await Clipboard.setStringAsync(displayInvitationCode(usableCode));
    if (copied) setActionMessage("Invitation code copied.");
    if (!copied) setActionError("The invitation code could not be copied.");
  };

  const shareCode = async () => {
    if (!usableCode) return;
    setActionError(null);
    try {
      await Share.share({
        message: `Join my DuoQueue duo ${duo.name} with code ${displayInvitationCode(usableCode)}.`,
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const cancelCode = async () => {
    setActionError(null);
    setActionMessage(null);
    try {
      await cancelMutation.mutateAsync();
      await refreshState();
      setActionMessage("Invitation cancelled.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const regenerateCode = async () => {
    setActionError(null);
    setActionMessage(null);
    try {
      await regenerateMutation.mutateAsync();
      await refreshState();
      setActionMessage("A new invitation code was created.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Invite your friend</AppText>
      <AppText>Duo: {duo.name}</AppText>
      {usableCode && (
        <>
          <AppText>Invitation code</AppText>
          <AppText selectable>{displayInvitationCode(usableCode)}</AppText>
          <AppText>Expires: {new Date(invitation!.expiresAt).toLocaleString()}</AppText>
          <AppButton label="Copy code" onPress={copyCode} />
          <AppButton label="Share invitation" onPress={shareCode} />
          <AppButton
            label="Cancel invitation"
            loading={cancelMutation.isPending}
            onPress={cancelCode}
          />
        </>
      )}
      {!usableCode && (
        <>
          <AppText>There is no active invitation code.</AppText>
          <AppButton
            label="Create a new invitation"
            loading={regenerateMutation.isPending}
            onPress={regenerateCode}
          />
        </>
      )}
      {actionMessage && (
        <AppText accessibilityLiveRegion="polite">{actionMessage}</AppText>
      )}
      {actionError && <AppText accessibilityLiveRegion="polite">{actionError}</AppText>}
      <AppButton label="Waiting for friend" onPress={() => router.replace("/waiting-for-friend")} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 } });
