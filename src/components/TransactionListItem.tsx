/**
 * TransactionListItem component for the Daily Detail Screen.
 * Displays a single transaction with a floating 3D glassmorphism card:
 * - Category color dot with glow
 * - Category name and optional note
 * - Amount (VND formatting)
 */

import { Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { GradientColors, Shadow3D, Spacing } from "@/constants/theme";

export interface TransactionWithCategory {
  id: string;
  amount: number;
  note: string;
  type: "income" | "expense";
  date: string;
  category_id: string;
  category_name: string;
  category_color: string;
}

interface TransactionListItemProps {
  transaction: TransactionWithCategory;
}

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const theme = useTheme();
  const isIncome = transaction.type === "income";

  const amountText = `+${isIncome ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString("vi-VN")} ₫`;
  const amountColor = isIncome ? GradientColors.success : GradientColors.danger;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    "worklet";
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(0.92, { stiffness: 300, damping: 15 });
  };

  const handlePressOut = () => {
    "worklet";
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { stiffness: 300, damping: 15 });
  };

  const handlePress = () => {
    router.push({
      pathname: "/add-transaction",
      params: { id: transaction.id, date: transaction.date.split("T")[0] },
    });
  };

  return (
    <Animated.View style={[animatedStyle, Shadow3D.small]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <BlurView
          intensity={30}
          tint="dark"
          style={[
            styles.blurContainer,
            {
              borderTopColor: "rgba(255,255,255,0.25)",
              borderLeftColor: "rgba(255,255,255,0.08)",
              borderBottomColor: "rgba(0,0,0,0.8)",
              borderRightColor: "rgba(0,0,0,0.4)",
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.03)", "rgba(0,0,0,0.1)"]}
            style={styles.gradientOverlay}
          />
          <View
            style={[
              styles.row,
              {
                borderBottomColor: theme.backgroundElement,
              },
            ]}
          >
            <View style={styles.leftContent}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: transaction.category_color },
                  {
                    shadowColor: isIncome ? "#00FFA3" : "#FF3366",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 4,
                  },
                ]}
              />
              <View>
                <ThemedText type="default" style={styles.categoryName}>
                  {transaction.category_name}
                </ThemedText>
                {transaction.note ? (
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.note}
                  >
                    {transaction.note}
                  </ThemedText>
                ) : null}
              </View>
            </View>
            <ThemedText style={[styles.amount, { color: amountColor }]}>
              {amountText}
            </ThemedText>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: Spacing.one,
    borderWidth: 1,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderBottomWidth: 1.5,
    borderRightWidth: 1,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.two,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  note: {
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
