import { Redirect, Stack } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import {
  useCurrentDuoRealtime,
  useCurrentDuoState,
} from "@/src/features/duos/useCurrentDuoState";

export function CompletedDuoLayout() {
  const { configurationError, isAuthenticated, isInitializing, isPasswordRecovery, user } =
    useAuth();
  let duoUserId: string | undefined;
  if (!isInitializing && isAuthenticated && !isPasswordRecovery) duoUserId = user?.id;
  const duoQuery = useCurrentDuoState(duoUserId);
  useCurrentDuoRealtime(duoQuery.data?.duo?.id, user?.id);
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
