import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { AppText } from "@/src/components/common/AppText";

export type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  rightAccessory?: React.ReactNode;
};

export function AppInput({
  label,
  error,
  rightAccessory,
  style,
  ...props
}: AppInputProps) {
  let errorMessage: React.ReactNode;

  if (error) {
    errorMessage = (
      <AppText accessibilityLiveRegion="polite">{error}</AppText>
    );
  }

  return (
    <View style={styles.group}>
      <AppText>{label}</AppText>
      <View style={styles.inputShell}>
        <TextInput
          accessibilityLabel={props.accessibilityLabel ?? label}
          {...props}
          style={[styles.input, style]}
        />
        {rightAccessory}
      </View>
      {errorMessage}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 4 },
  inputShell: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 8,
  },
});
