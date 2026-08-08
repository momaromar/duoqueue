import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppText } from "@/src/components/common/AppText";

type AuthScreenHeaderProps = { title: string; description: string };

export function AuthScreenHeader({ title, description }: AuthScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <AppButton label="Back" onPress={() => router.back()} />
      <AppText accessibilityRole="header">{title}</AppText>
      <AppText>{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
});
