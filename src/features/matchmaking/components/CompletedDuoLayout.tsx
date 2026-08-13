import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { useMockMatchmakingStore } from "@/src/features/matchmaking/mockMatchmakingStore";

export function CompletedDuoLayout() {
  const { configurationError, isAuthenticated, isInitializing, isPasswordRecovery, user } =
    useAuth();
  const resetForDuo = useMockMatchmakingStore((state) => state.resetForDuo);
  let duoUserId: string | undefined;
  if (!isInitializing && isAuthenticated && !isPasswordRecovery) duoUserId = user?.id;
  const duoQuery = useCurrentDuoState(duoUserId);
  let eligibleDuoId: string | undefined;
  if (duoQuery.data?.duo?.profileComplete) eligibleDuoId = duoQuery.data.duo.id;

  useEffect(() => {
    if (!duoQuery.isPending) resetForDuo(eligibleDuoId);
  }, [duoQuery.isPending, eligibleDuoId, resetForDuo]);

  if (configurationError) return <ConfigurationRequiredScreen />;
  if (isInitializing) return <LoadingView label="Restoring session…" />;
  if (isPasswordRecovery) return <Redirect href="/update-password" />;
  if (!isAuthenticated) return <Redirect href="/welcome" />;
  if (duoQuery.isPending) return <LoadingView label="Checking onboarding…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (!duoQuery.data.duo?.profileComplete) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
