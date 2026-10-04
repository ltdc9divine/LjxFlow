/**
 * SummaryCard component for the Daily Detail Screen.
 * Displays a summary statistic in a glassmorphism gradient card with 3D floating effect.
 *
 * Wraps a LinearGradient inside a BlurView for the ice effect,
 * with layered shadows and a subtle white border.
 */

import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Shadow3D, Spacing } from "@/constants/theme";

interface SummaryCardProps {
  title: string;
  value: string;
  valueColor?: string;
}

export function SummaryCard({ title, value, valueColor }: SummaryCardProps) {
  const colors: [string, string] = valueColor
    ? [valueColor + "20", valueColor + "10"]
    : ["#00FFA320", "#00FFA310"];

  return (
    <Animated.View
      style={[
        styles.blurContainer,
        Shadow3D.small,
        {
          borderTopWidth: 1.5,
          borderTopColor: "rgba(255,255,255,0.25)",
          borderLeftWidth: 1,
          borderLeftColor: "rgba(255,255,255,0.08)",
          borderBottomWidth: 1.5,
          borderBottomColor: "rgba(0,0,0,0.8)",
          borderRightWidth: 1,
          borderRightColor: "rgba(0,0,0,0.4)",
        },
      ]}
    >
      <BlurView intensity={45} tint="dark" style={styles.blurInner}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.inner}>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.title}
            >
              {title}
            </ThemedText>
            <ThemedText
              style={[
                styles.value,
                { color: valueColor ?? "#FFFFFF" },
                valueColor && {
                  shadowColor: valueColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                },
              ]}
            >
              {value}
            </ThemedText>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  blurInner: {
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: "center",
    minHeight: 80,
    overflow: "hidden",
  },
  inner: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 12,
    marginBottom: Spacing.half,
    color: "#A0A0A0",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "monospace",
  },
});
