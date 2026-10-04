import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  router,
  Stack,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { AddCategoryModal } from "@/components/AddCategoryModal";
import {
  addTransaction,
  getCategoriesByType,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/db/database";
import { formatDateId, parseDateId, formatDateDisplay } from "@/lib/date";
import { formatCurrencyInput, parseCurrency } from "@/lib/format";
import { useTheme } from "@/hooks/use-theme";
import {
  Spacing,
  MaxContentWidth,
  GradientColors,
  GlassColors,
  BorderRadius,
  Shadow3D,
} from "@/constants/theme";
import type { Category } from "@/db/types";

export default function AddTransactionScreen() {
  const theme = useTheme();
  const { date: dateParam, id: txId } = useLocalSearchParams<{
    date: string;
    id: string;
  }>();
  const navigation = useNavigation();

  const dateId = dateParam ?? formatDateId();
  const isEditMode = !!txId;

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState(false);

  const amountValue = parseCurrency(amount);
  const canSave =
    !isNaN(amountValue) &&
    amountValue > 0 &&
    selectedCategory !== null &&
    !isSaving;

  // Load transaction data when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const tx = await getTransactionById(txId!);
        if (tx) {
          setAmount(formatCurrencyInput(tx.amount));
          setType(tx.type);
          setNote(tx.note);
          // Load categories first, then set selected
          const cats = await getCategoriesByType(tx.type);
          setCategories(cats);
          const cat = cats.find((c) => c.id === tx.category_id);
          setSelectedCategory(cat ?? cats[0] ?? null);
        }
      } catch (e) {
        console.error("[add-tx] Failed to load transaction:", e);
      }
    })();
  }, [txId, isEditMode]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategoriesByType(type);
        setCategories(cats);
        if (cats.length > 0) {
          const stillValid = cats.find((c) => c.id === selectedCategory?.id);
          setSelectedCategory(stillValid ?? cats[0]);
        } else {
          setSelectedCategory(null);
        }
      } catch (e) {
        console.error("[add-tx] Failed to load categories:", e);
      }
    })();
  }, [type, selectedCategory]);

  const handleSave = useCallback(async () => {
    if (!canSave || selectedCategory === null) return;
    setIsSaving(true);
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const isoDate =
        dateId + "T" + hours + ":" + minutes + ":" + seconds + ".000";
      if (isEditMode && txId) {
        await updateTransaction(txId, {
          amount: amountValue,
          note: note.trim(),
          type,
          date: isoDate,
          category_id: selectedCategory.id,
        });
      } else {
        await addTransaction({
          amount: amountValue,
          note: note.trim(),
          type,
          date: isoDate,
          category_id: selectedCategory.id,
        });
      }
      router.back();
    } catch (e) {
      console.error("[add-tx] Failed to save transaction:", e);
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    amountValue,
    selectedCategory,
    note,
    type,
    dateId,
    txId,
    isEditMode,
  ]);

  const handleDelete = useCallback(() => {
    if (!txId) return;
    Alert.alert("Xóa giao dịch?", "Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(txId);
            router.back();
          } catch (e) {
            console.error("[add-tx] Failed to delete transaction:", e);
          }
        },
      },
    ]);
  }, [txId]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleCategoryAdded = useCallback(() => {
    getCategoriesByType(type).then((cats) => {
      setCategories(cats);
      setSelectedCategory(cats[cats.length - 1]);
    });
  }, [type]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? "Sửa giao dịch" : "Thêm giao dịch",
      headerLeft: () => (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {isEditMode && (
            <Pressable onPress={handleDelete} style={{ marginRight: 8 }}>
              <Ionicons name="trash" size={20} color="#FF3366" />
            </Pressable>
          )}
          <Pressable onPress={handleCancel} style={{ marginRight: 16 }}>
            <Ionicons name="close" size={22} color={theme.text} />
          </Pressable>
        </View>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={{ marginRight: 8 }}
        >
          <Ionicons
            name="checkmark"
            size={22}
            color={canSave ? theme.text : theme.textSecondary}
          />
        </Pressable>
      ),
    });
  }, [
    navigation,
    canSave,
    theme,
    handleSave,
    handleCancel,
    handleDelete,
    isEditMode,
    isSaving,
    dateId,
  ]);
  return (
    <>
      <Stack.Screen options={{ headerTitle: "" }} />
      <LinearGradient
        colors={GradientColors.space}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.select({ ios: "padding", android: "height" })}
          keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { maxWidth: MaxContentWidth, alignSelf: "center", width: "100%" },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Type Toggle - Glowing Active States */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <BlurView
                intensity={15}
                tint="default"
                style={styles.typeToggleContainer}
              >
                <View style={styles.typeToggle}>
                  <Pressable
                    onPress={() => setType("income")}
                    style={({ pressed }) => [
                      styles.typeButton,
                      styles.typeButtonLeft,
                      type === "income"
                        ? styles.typeButtonSelectedIncome
                        : [
                            styles.typeButtonUnselected,
                            { borderColor: GlassColors.border },
                          ],
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    {type === "income" && (
                      <LinearGradient
                        colors={[GradientColors.success, "#1A6F30"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.typeButtonGradient}
                      />
                    )}
                    <ThemedText
                      style={{
                        color: type === "income" ? "#fff" : theme.text,
                        fontWeight: "600",
                      }}
                    >
                      Khoản Thu
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setType("expense")}
                    style={({ pressed }) => [
                      styles.typeButton,
                      styles.typeButtonRight,
                      type === "expense"
                        ? styles.typeButtonSelectedExpense
                        : [
                            styles.typeButtonUnselected,
                            { borderColor: GlassColors.border },
                          ],
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    {type === "expense" && (
                      <LinearGradient
                        colors={[GradientColors.danger, "#8B1A1A"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.typeButtonGradient}
                      />
                    )}
                    <ThemedText
                      style={{
                        color: type === "expense" ? "#fff" : theme.text,
                        fontWeight: "600",
                      }}
                    >
                      Khoản Chi
                    </ThemedText>
                  </Pressable>
                </View>
              </BlurView>
            </Animated.View>

            {/* Amount Input */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary">
                  Số tiền
                </ThemedText>
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      color: theme.text,
                      borderBottomColor: GlassColors.border,
                    },
                  ]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </Animated.View>
            {/* Category Picker - Horizontal Pills + Add Button */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <View style={styles.section}>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={{ marginBottom: Spacing.two }}
                >
                  Danh mục
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryPicker}
                >
                  {categories.map((cat) => {
                    const isSelected = selectedCategory?.id === cat.id;
                    return (
                      <Animated.View
                        key={cat.id}
                        entering={FadeInDown.delay(350)}
                      >
                        <Pressable
                          onPress={() => setSelectedCategory(cat)}
                          style={[
                            styles.categoryPill,
                            {
                              backgroundColor: isSelected
                                ? cat.color_hex
                                : GlassColors.background,
                              borderColor: isSelected
                                ? "#fff"
                                : GlassColors.border,
                            },
                            isSelected && {
                              shadowColor: cat.color_hex,
                              shadowOpacity: 0.5,
                              shadowRadius: 12,
                              elevation: 8,
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.categoryBubbleText,
                              { color: isSelected ? "#fff" : theme.text },
                            ]}
                          >
                            {cat.name}
                          </ThemedText>
                        </Pressable>
                      </Animated.View>
                    );
                  })}

                  {/* Add Category Button */}
                  <Animated.View entering={FadeInDown.delay(400)}>
                    <Pressable
                      onPress={() => setIsAddCategoryModalVisible(true)}
                      style={({ pressed }) => [
                        styles.addCategoryButton,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <BlurView
                        intensity={15}
                        tint="default"
                        style={styles.addCategoryBlur}
                      >
                        <LinearGradient
                          colors={[
                            GradientColors.primary,
                            GradientColors.secondary,
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.addCategoryGradient}
                        >
                          <Ionicons name="add" size={18} color="white" />
                          <ThemedText
                            style={{
                              color: "#fff",
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            + Thêm danh mục
                          </ThemedText>
                        </LinearGradient>
                      </BlurView>
                    </Pressable>
                  </Animated.View>
                </ScrollView>
              </View>
            </Animated.View>

            {/* Note Input */}
            <Animated.View entering={FadeInDown.delay(450).springify()}>
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary">
                  Ghi chú
                </ThemedText>
                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      color: theme.text,
                      borderColor: GlassColors.border,
                    },
                  ]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Thêm ghi chú (tùy chọn)"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </Animated.View>

            {/* Date Display */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary">
                  Ngày
                </ThemedText>
                <ThemedText type="default" style={{ marginTop: Spacing.two }}>
                  {formatDateDisplay(parseDateId(dateId))}
                </ThemedText>
              </View>
            </Animated.View>

            {/* Delete Button (Edit Mode Only) */}
            {isEditMode && (
              <Animated.View entering={FadeInDown.delay(600).springify()}>
                <Pressable
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.deleteButtonContainer,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <BlurView
                    intensity={20}
                    tint="default"
                    style={styles.deleteButtonBlur}
                  >
                    <LinearGradient
                      colors={["#FF3366", "#9B1B2B"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.deleteButtonGradient}
                    >
                      <Ionicons name="trash" size={18} color="white" />
                      <ThemedText
                        style={{
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Xóa giao dịch
                      </ThemedText>
                    </LinearGradient>
                  </BlurView>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>

          {/* Dynamic Category Creation Modal */}
          <AddCategoryModal
            visible={isAddCategoryModalVisible}
            onClose={() => setIsAddCategoryModalVisible(false)}
            type={type}
            onCategoryAdded={handleCategoryAdded}
          />
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  typeToggleContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GlassColors.border,
    ...Shadow3D.medium,
  },
  typeToggle: {
    flexDirection: "row",
  },
  typeButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  typeButtonLeft: {
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  typeButtonRight: {
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  typeButtonSelectedIncome: {
    backgroundColor: GradientColors.success,
  },
  typeButtonSelectedExpense: {
    backgroundColor: GradientColors.danger,
  },
  typeButtonUnselected: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  typeButtonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    opacity: 0.8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "600",
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  categoryPicker: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
    alignItems: "center",
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    backgroundColor: GlassColors.background,
    overflow: "hidden",
    ...Shadow3D.small,
  },
  categoryBubbleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addCategoryButton: {
    borderRadius: BorderRadius.full,
  },
  addCategoryBlur: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  addCategoryGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  noteInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    textAlignVertical: "top",
    minHeight: 80,
    backgroundColor: GlassColors.background,
  },
  deleteButtonContainer: {
    marginTop: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  deleteButtonBlur: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  deleteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
  },
});
