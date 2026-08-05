import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/src/components/common/AppText";
import { colors, spacing } from "@/src/theme/tokens";

type AuthScreenHeaderProps = { title: string; description: string };

export function AuthScreenHeader({ title, description }: AuthScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" color={colors.text} size={24} />
      </Pressable>
      <AppText variant="title">{title}</AppText>
      <AppText color="textMuted">{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
    marginBottom: spacing.sm,
  },
});
