import { Redirect } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { useDuoProfileState } from "@/src/features/duo-profile/useDuoProfileState";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { useCurrentDuoState } from "@/src/features/duos/useCurrentDuoState";

type MatchmakingDuoGateProps = {
  children: (profile: DuoProfileStateWithImages) => React.ReactNode;
};

export function MatchmakingDuoGate({ children }: MatchmakingDuoGateProps) {
  const { user } = useAuth();
  const duoQuery = useCurrentDuoState(user?.id);
  const profileQuery = useDuoProfileState(user?.id);

  if (duoQuery.isPending || profileQuery.isPending) {
    return <LoadingView label="Checking queue readiness…" />;
  }
  if (duoQuery.error) {
    return <DuoStateErrorScreen error={duoQuery.error} onRetry={duoQuery.refetch} />;
  }
  if (profileQuery.error) {
    return <DuoStateErrorScreen error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }

  const duo = duoQuery.data.duo;
  const profile = profileQuery.data;
  const isEligible = duo?.status === "active"
    && duo.members.length === 2
    && duo.profileComplete
    && profile.duo.profileComplete;
  if (!isEligible) return <Redirect href="/" />;

  return children(profile);
}
