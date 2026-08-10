import { Redirect } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";

export default function Index() {
  const { configurationError, isAuthenticated, isInitializing, isPasswordRecovery } =
    useAuth();
  let destination: "/duo-choice" | "/update-password" | "/welcome" = "/welcome";

  if (configurationError) {
    return <ConfigurationRequiredScreen />;
  }

  if (isInitializing) {
    return <LoadingView label="Restoring session…" />;
  }

  if (isPasswordRecovery) {
    destination = "/update-password";
  } else if (isAuthenticated) {
    destination = "/duo-choice";
  }

  return <Redirect href={destination} />;
}
