/**
 * DayListItem component for the Home Screen.
 *
 * Displays a single day in the calendar/list view with:
 * - Date display (Today, Yesterday, or formatted date)
 * - Net cash flow (green for positive, red for negative, gray for no transactions)
 */

import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";

export interface DayData {
  date: Date;
  dateId: string;
  displayText: string;
  netFlow: number;
  hasTransactions: boolean;
}

interface DayListItemProps {
  day: DayData;
  onPress: () => void;
}

export function DayListItem({ day, onPress }: DayListItemProps) {
  const theme = useTheme();
  const isPositive = day.netFlow > 0;
  const isToday = day.displayText === "Hôm nay";

  const flowColor = day.hasTransactions
    ? isPositive
      ? "#30D158"
      : "#FF3B30"
    : theme.textSecondary;

  const formattedAmount = day.hasTransactions
    ? `${isPositive ? "+" : "-"}${formatCurrency(Math.abs(day.netFlow))}`
    : "—";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.leftContent}>
        <ThemedText
          type="default"
          style={[styles.dateText, isToday && { fontWeight: "700" }]}
        >
          {day.displayText}
        </ThemedText>
      </View>
      <View style={styles.rightContent}>
        <ThemedText style={{ color: flowColor, fontWeight: "600" }}>
          {formattedAmount}
        </ThemedText>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.textSecondary}
          style={{ marginLeft: Spacing.one }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  leftContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    lineHeight: 24,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
