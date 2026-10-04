import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  Stack,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  TransactionListItem,
  type TransactionWithCategory,
} from "@/components/TransactionListItem";
import { SummaryCard } from "@/components/SummaryCard";
import {
  getDailySummary,
  getTransactionsByDate,
  ensureDailyBalance,
  updateDailyBalance,
} from "@/db/database";
import { formatDateId, parseDateId, formatDateFull } from "@/lib/date";
import {
  formatCurrencyInput,
  parseCurrency,
  formatCurrencyWithSign,
} from "@/lib/format";
import { useTheme } from "@/hooks/use-theme";
import {
  Spacing,
  MaxContentWidth,
  GradientColors,
  BorderRadius,
  GlassColors,
  Shadow3D,
} from "@/constants/theme";

export default function DailyDetailScreen() {
  const theme = useTheme();
  const { date: dateParam } = useLocalSearchParams<{ date: string }>();
  const dateId = dateParam ?? formatDateId();

  const [loading, setLoading] = useState(true);
  const [balanceInput, setBalanceInput] = useState("");
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    [],
  );
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [endingBalance, setEndingBalance] = useState(0);

  const balanceScale = useSharedValue(1);

  const balanceCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: balanceScale.value }],
  }));

  const triggerBalanceAnimation = () => {
    "worklet";
    // eslint-disable-next-line react-hooks/immutability
    balanceScale.value = withSequence(
      withSpring(0.95, { stiffness: 300, damping: 20 }),
      withSpring(1, { stiffness: 400, damping: 10 }),
    );
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await ensureDailyBalance(dateId);
      const summary = await getDailySummary(dateId);
      setBalanceInput(formatCurrencyInput(summary.starting_balance));
      setTotalIncome(summary.total_income);
      setTotalExpense(summary.total_expense);
      setEndingBalance(summary.ending_balance);
      const txDate = dateId + "T00:00:00.000";
      const txs = await getTransactionsByDate(txDate);
      setTransactions(txs);
    } catch (e) {
      console.error("[daily] Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }, [dateId]);

  const handleSaveBalance = useCallback(async () => {
    const numericValue = parseCurrency(balanceInput);
    if (!isNaN(numericValue)) {
      await updateDailyBalance(dateId, numericValue);
      triggerBalanceAnimation();
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceInput, dateId, loadData]);

  const handleAddTransaction = () => {
    router.push({
      pathname: "/add-transaction",
      params: { date: dateId },
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const formattedDate = formatDateFull(parseDateId(dateId));

  return (
    <>
      <Stack.Screen
        options={{
          title: formattedDate,
          headerBackTitle: "Ngày",
        }}
      />
      <LinearGradient
        colors={GradientColors.space}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { maxWidth: MaxContentWidth },
          ]}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
        >
          {/* Starting Balance - 3D Glass Gradient Card */}
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            style={styles.balanceWrapper}
          >
            <Animated.View style={[balanceCardStyle, Shadow3D.medium]}>
              <BlurView
                intensity={25}
                tint="default"
                style={styles.balanceGlassContainer}
              >
                <LinearGradient
                  colors={[GradientColors.primary, GradientColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.balanceGradientCard}
                >
                  <ThemedText type="small" style={styles.balanceLabel}>
                    Số dư đầu ngày
                  </ThemedText>
                  <View style={styles.balanceRow}>
                    <TextInput
                      style={styles.balanceInput}
                      value={formatCurrencyInput(
                        parseCurrency(balanceInput) || 0,
                      )}
                      onChangeText={(val) =>
                        setBalanceInput(formatCurrencyInput(parseCurrency(val)))
                      }
                      keyboardType="numeric"
                      placeholder="0 ₫"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                  </View>
                  <Pressable
                    onPress={handleSaveBalance}
                    style={styles.saveBalanceButton}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    <ThemedText style={styles.saveBalanceText}>Lưu</ThemedText>
                  </Pressable>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </Animated.View>

          {/* Summary Cards - Floating Glass Section */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.summaryGlassWrapper}
          >
            <BlurView
              intensity={20}
              tint="default"
              style={styles.summaryGlassContainer}
            >
              <View style={[styles.summaryRow, { gap: Spacing.two }]}>
                <SummaryCard
                  title="Khoản Thu"
                  value={formatCurrencyWithSign(totalIncome)}
                  valueColor="#30D158"
                />
                <SummaryCard
                  title="Khoản Chi"
                  value={formatCurrencyWithSign(totalExpense)}
                  valueColor="#FF3B30"
                />
                <SummaryCard
                  title="Số dư cuối ngày"
                  value={formatCurrencyWithSign(endingBalance)}
                  valueColor={endingBalance >= 0 ? "#30D158" : "#FF3B30"}
                />
              </View>
            </BlurView>
          </Animated.View>

          {/* Transactions */}
          <View style={styles.section}>
            <Animated.Text
              entering={FadeInDown.delay(300)}
              style={[styles.sectionTitle, { color: theme.text }]}
            >
              Giao dịch
            </Animated.Text>
            {transactions.length === 0 ? (
              <ThemedView
                type="backgroundElement"
                style={styles.emptyTransactions}
              >
                <BlurView
                  intensity={10}
                  tint="default"
                  style={styles.emptyBlur}
                >
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={{ textAlign: "center" }}
                  >
                    Chưa có giao dịch hôm nay.
                  </ThemedText>
                </BlurView>
              </ThemedView>
            ) : (
              <View style={{ overflow: "hidden" }}>
                {transactions.map((tx, index) => (
                  <Animated.View
                    key={tx.id}
                    entering={FadeInDown.delay(350 + index * 50).springify()}
                  >
                    <TransactionListItem transaction={tx} />
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* FAB - Glassmorphism */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.addButtonContainer}
        >
          <BlurView intensity={30} tint="default" style={styles.addButtonBlur}>
            <LinearGradient
              colors={[GradientColors.primary, GradientColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Pressable
                style={styles.addButton}
                onPress={handleAddTransaction}
              >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText style={styles.addButtonText}>
                  Thêm giao dịch
                </ThemedText>
              </Pressable>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: Spacing.three,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },
  balanceWrapper: {
    marginBottom: Spacing.three,
  },
  balanceGlassContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GlassColors.borderStrong,
  },
  summaryGlassWrapper: {
    marginBottom: Spacing.three,
  },
  summaryGlassContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    padding: Spacing.half,
    borderWidth: 1,
    borderColor: GlassColors.border,
  },
  balanceGradientCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    overflow: "hidden",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.two,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  balanceInput: {
    fontSize: 28,
    fontWeight: "700",
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.md,
    backgroundColor: "transparent",
    flex: 1,
    color: "#FFFFFF",
  },
  saveBalanceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
    marginTop: Spacing.two,
  },
  saveBalanceText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  emptyTransactions: {
    padding: Spacing.three,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    minHeight: 120,
    overflow: "hidden",
  },
  emptyBlur: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: Spacing.three,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addButtonBlur: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  addButtonGradient: {
    borderRadius: BorderRadius.full,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    backgroundColor: "transparent",
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.three + Spacing.half,
    borderRadius: BorderRadius.full,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
