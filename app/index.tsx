import { Redirect } from "expo-router";

import { useAuth } from "@/src/features/auth/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();
  let destination: "/(app)" | "/welcome" = "/welcome";

  if (isAuthenticated) {
    destination = "/(app)";
  }

  return <Redirect href={destination} />;
}
