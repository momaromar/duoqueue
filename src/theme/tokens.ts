import { Platform } from "react-native";

export const colors = {
  background: "#FFF9F3",
  surface: "#FFFFFF",
  surfaceMuted: "#F4EFE9",
  primary: "#6750A4",
  primaryPressed: "#503B89",
  primarySoft: "#EEE8FF",
  accent: "#F28B66",
  text: "#241F2B",
  textMuted: "#6E6875",
  border: "#DED7E4",
  error: "#B3261E",
  success: "#257A55",
  disabled: "#C9C2CE",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const fontSizes = {
  caption: 12,
  body: 16,
  subtitle: 19,
  title: 30,
  display: 42,
} as const;

export const shadows = Platform.select({
  ios: {
    shadowColor: "#241F2B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  android: { elevation: 3 },
  default: {},
});
