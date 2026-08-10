import { Redirect } from "expo-router";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { ConfigurationRequiredScreen } from "@/src/features/auth/screens/ConfigurationRequiredScreen";

export default function AppLayout() {
  const { configurationError, isAuthenticated, isInitializing, isPasswordRecovery } =
    useAuth();

  if (configurationError) {
    return <ConfigurationRequiredScreen />;
  }

  if (isInitializing) {
    return <LoadingView label="Restoring session…" />;
  }

  if (isPasswordRecovery) {
    return <Redirect href="/update-password" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/" />;
}
