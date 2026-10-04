/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#0a0a0f",
    backgroundElement: "#1a1a2e",
    backgroundSelected: "#16213e",
    textSecondary: "#7D8089",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
} as const;

export const GradientColors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  success: "#00FFA3",
  danger: "#FF3366",
  // Premium gradient definitions for immersive backgrounds
  space: ["#050505", "#0a0a0f", "#16213e"] as [string, string, string],
  spaceAlt: ["#050505", "#0a0a0f"] as [string, string],
} as const;

/** Glassmorphism colors — translucent white overlays for the ice effect. */
export const GlassColors = {
  background: "rgba(255, 255, 255, 0.10)",
  backgroundStrong: "rgba(255, 255, 255, 0.18)",
  border: "rgba(255, 255, 255, 0.15)",
  borderStrong: "rgba(255, 255, 255, 0.25)",
  backgroundDark: "rgba(0, 0, 0, 0.25)",
} as const;

/** Preset color palette for dynamic category creation. */
export const CategoryPalette = [
  "#FF6B6B",
  "#4DA6FF",
  "#30D158",
  "#FF9500",
  "#AF52DE",
  "#FF2D55",
  "#00C7BE",
  "#48A999",
  "#A78BFA",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#06B6D4",
  "#8B5CF6",
  "#EF4444",
] as const;

export const Shadow3D = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

export const Elevation = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
