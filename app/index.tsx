import { Redirect } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";

export default function Index() {
  const { configurationError, isAuthenticated, isInitializing, isPasswordRecovery, user } =
    useAuth();
  let duoUserId: string | undefined;
  if (!isInitializing && !isPasswordRecovery) duoUserId = user?.id;
  const duoQuery = useCurrentDuoState(duoUserId);
  let activeDuoUserId: string | undefined;
  if (duoQuery.data?.duo?.status === "active") activeDuoUserId = user?.id;
  const profileQuery = useDuoProfileState(activeDuoUserId);
  let destination:
    | "/(app)"
    | "/duo-contributions"
    | "/duo-choice"
    | "/update-password"
    | "/waiting-for-friend"
    | "/welcome" = "/welcome";

  if (configurationError) {
    return <ConfigurationRequiredScreen />;
  }

  if (isInitializing) {
    return <LoadingView label="Restoring session…" />;
  }

  if (isPasswordRecovery) {
    destination = "/update-password";
  } else if (isAuthenticated) {
    if (duoQuery.isPending) return <LoadingView label="Loading duo…" />;
    if (duoQuery.error) {
      return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
    }
    const duo = duoQuery.data.duo;
    if (!duo) destination = "/duo-choice";
    if (duo?.status === "forming") destination = "/waiting-for-friend";
    if (duo?.status === "active") {
      if (profileQuery.isPending) return <LoadingView label="Loading Duo Profile…" />;
      if (profileQuery.error) {
        return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
      }
      if (!profileQuery.data.currentMember.submittedAt) destination = "/duo-contributions";
      if (profileQuery.data.currentMember.submittedAt) destination = "/(app)";
    }
  }

  return <Redirect href={destination} />;
}
