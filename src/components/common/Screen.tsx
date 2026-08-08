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
      {screenContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: 16,
  },
});
