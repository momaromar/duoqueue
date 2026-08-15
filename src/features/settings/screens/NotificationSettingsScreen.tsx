import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { useAuth } from "@/src/features/auth/AuthContext";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import type { NotificationPreferenceKey, NotificationPreferences } from "@/src/features/settings/schemas";
import { useNotificationPreferences, useSaveNotificationPreferences } from "@/src/features/settings/useNotificationPreferences";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

const options: { key: NotificationPreferenceKey; label: string; description: string }[] = [
  { key: "duoInvitations", label: "Duo invitations", description: "Account and duo invitation updates." },
  { key: "queueStatus", label: "Queue status", description: "Changes to your duo's matchmaking ticket." },
  { key: "matches", label: "Matches", description: "When your duo finds another duo." },
  { key: "messages", label: "Messages", description: "New messages in your active group conversation." },
  { key: "productUpdates", label: "Product updates", description: "Occasional DuoQueue product news." },
];

export function NotificationSettingsScreen() {
  const { user } = useAuth();
  const query = useNotificationPreferences(user?.id);
  if (query.isPending) return <LoadingView label="Loading notification settings…" />;
  if (query.error) return <DuoStateErrorScreen error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <LoadingView label="Loading notification settings…" />;
  return <NotificationPreferencesForm initial={query.data} userId={user?.id} />;
}

function NotificationPreferencesForm({ initial, userId }: { initial: NotificationPreferences; userId: string | undefined }) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const mutation = useSaveNotificationPreferences(userId);

  const setPreference = (key: NotificationPreferenceKey, value: boolean) => {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaved(false);
    setActionError(null);
    try {
      const next = await mutation.mutateAsync(values);
      setValues(next);
      setSaved(true);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Notifications" subtitle="Choose which account events may notify you later." />
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>PREFERENCES ONLY</Text>
        <Text style={styles.copy}>These choices are saved to your account. DuoQueue does not request device permission or deliver push notifications until Phase 14.</Text>
      </View>
      <View style={styles.options}>
        {options.map((option) => {
          let thumbColor: string = lobbyColors.muted;
          if (values[option.key]) thumbColor = lobbyColors.text;
          return <View key={option.key} style={styles.option}>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Switch
              accessibilityLabel={`${option.label} notifications`}
              accessibilityHint={option.description}
              value={values[option.key]}
              disabled={mutation.isPending}
              onValueChange={(value) => setPreference(option.key, value)}
              trackColor={{ false: lobbyColors.border, true: lobbyColors.cyan }}
              thumbColor={thumbColor}
            />
          </View>;
        })}
      </View>
      {saved && <Text accessibilityLiveRegion="polite" style={styles.saved}>Preferences saved.</Text>}
      {actionError && <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>}
      <LobbyButton label="SAVE PREFERENCES" detail="APPLY THESE CHOICES" disabled={mutation.isPending} onPress={() => void save()} />
      <LobbyButton label="BACK TO ACCOUNT" disabled={mutation.isPending} onPress={() => router.back()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  notice: { gap: 7, borderWidth: 1, borderColor: lobbyColors.cyan, borderRadius: 12, backgroundColor: "#081E36", padding: 14 },
  noticeTitle: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1.4 },
  copy: { color: lobbyColors.text, lineHeight: 20 },
  options: { gap: 10 },
  option: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 14 },
  optionText: { flex: 1, gap: 4 },
  optionLabel: { color: lobbyColors.text, fontSize: 16, fontWeight: "800" },
  optionDescription: { color: lobbyColors.muted, lineHeight: 19 },
  saved: { color: lobbyColors.green, textAlign: "center" },
  error: { color: lobbyColors.danger, lineHeight: 20 },
});
