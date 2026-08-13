import { useState } from "react";
import { StyleSheet } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { useAuth } from "@/src/features/auth/AuthContext";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

type DuoStateErrorScreenProps = {
  error: unknown;
  onRetry: () => void;
};

export function DuoStateErrorScreen({ error, onRetry }: DuoStateErrorScreenProps) {
  const { signOut } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const submitSignOut = async () => {
    setSignOutError(null);
    try {
      await signOut();
    } catch (nextError) {
      setSignOutError(getErrorMessage(nextError));
    }
  };

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Could not load your duo</AppText>
      <AppText accessibilityLiveRegion="polite">{getErrorMessage(error)}</AppText>
      <AppText>
        If the required database migration has not been applied yet, run the appropriate
        file from the Supabase migrations folder in the SQL Editor before retrying.
      </AppText>
      {signOutError && (
        <AppText accessibilityLiveRegion="polite">{signOutError}</AppText>
      )}
      <AppButton label="Retry" onPress={onRetry} />
      <AppButton label="Sign out" onPress={submitSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { gap: 16 } });
