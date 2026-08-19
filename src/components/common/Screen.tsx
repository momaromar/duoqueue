import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  contentContainerStyle,
}: ScreenProps) {
  let content: React.ReactNode = (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  if (scroll) {
    content = (
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  let screenContent = content;

  if (keyboardAware) {
    let keyboardBehavior: "padding" | undefined;

    if (Platform.OS === "ios") {
      keyboardBehavior = "padding";
    }

    screenContent = (
      <KeyboardAvoidingView behavior={keyboardBehavior} style={styles.flex}>
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={[styles.glow, styles.topGlow]} />
      <View pointerEvents="none" style={[styles.glow, styles.bottomGlow]} />
      <View pointerEvents="none" style={styles.accentLine} />
      {screenContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, overflow: "hidden", backgroundColor: lobbyColors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  glow: { position: "absolute", borderRadius: 999 },
  topGlow: {
    width: 320,
    height: 320,
    top: -190,
    right: -130,
    backgroundColor: "#0A3550",
    opacity: 0.72,
  },
  bottomGlow: {
    width: 280,
    height: 280,
    bottom: -180,
    left: -130,
    backgroundColor: "#35123B",
    opacity: 0.58,
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: "12%",
    right: "12%",
    height: 1,
    backgroundColor: lobbyColors.cyan,
    opacity: 0.5,
  },
});
