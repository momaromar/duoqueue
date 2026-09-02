import { Redirect, Stack } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
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
  let profileUserId: string | undefined;
  if (duoQuery.data?.duo?.status === "active") profileUserId = duoUserId;
  const profileQuery = useDuoProfileState(profileUserId);
  useCurrentDuoRealtime(duoQuery.data?.duo?.id, user?.id);
  if (configurationError) return <ConfigurationRequiredScreen />;
  if (isInitializing) return <LoadingView label="Restoring session…" />;
  if (isPasswordRecovery) return <Redirect href="/update-password" />;
  if (!isAuthenticated) return <Redirect href="/welcome" />;
  if (duoQuery.isPending) return <LoadingView label="Checking onboarding…" />;
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (duoQuery.data.duo?.status !== "active") return <Redirect href="/" />;
  if (profileQuery.isPending) return <LoadingView label="Checking your onboarding…" />;
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }
  if (!profileQuery.data.currentMember.submittedAt) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
