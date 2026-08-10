import { Redirect } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";

export default function Index() {
  const { configurationError, isAuthenticated, isInitializing, isPasswordRecovery, user } =
    useAuth();
  let duoUserId: string | undefined;
  if (!isInitializing && !isPasswordRecovery) duoUserId = user?.id;
  const duoQuery = useCurrentDuoState(duoUserId);
  let destination:
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
    if (duoQuery.data.duo) destination = "/waiting-for-friend";
    if (!duoQuery.data.duo) destination = "/duo-choice";
  }

  return <Redirect href={destination} />;
}
