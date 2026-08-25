import type { Component } from "react";
import { AccessibilityInfo, findNodeHandle, Platform } from "react-native";

export function focusGameElement(target: unknown) {
  if (!target) return;
  if (Platform.OS === "web") {
    const webTarget = target as { focus?: () => void };
    if (typeof webTarget.focus === "function") {
      webTarget.focus();
      return;
    }
  }
  const handle = findNodeHandle(target as Component);
  if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
}
