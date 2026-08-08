import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AppInput, type AppInputProps } from "@/src/components/common/AppInput";

type PasswordInputProps = Omit<AppInputProps, "rightAccessory" | "secureTextEntry">;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  let accessibilityLabel = "Show password";
  let toggleLabel = "Show";

  if (visible) {
    accessibilityLabel = "Hide password";
    toggleLabel = "Hide";
  }

  return (
    <AppInput
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!visible}
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <Text>{toggleLabel}</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
