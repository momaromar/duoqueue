import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type LobbyScreenProps = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function LobbyScreen({ children, contentContainerStyle }: LobbyScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: lobbyColors.background },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});
