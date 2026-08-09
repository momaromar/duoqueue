import { StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/common/AppText";
import { Screen } from "@/src/components/common/Screen";
import { missingPublicEnv } from "@/src/lib/env";

export function ConfigurationRequiredScreen() {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppText accessibilityRole="header">Supabase configuration required</AppText>
      <AppText>
        Create .env.local in the project root and configure these public values:
      </AppText>
      <View>
        {missingPublicEnv.map((name) => (
          <AppText key={name}>{name}</AppText>
        ))}
      </View>
      <AppText>Restart Expo after changing environment variables.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
});
