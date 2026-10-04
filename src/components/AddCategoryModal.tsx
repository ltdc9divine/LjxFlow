/**
 * AddCategoryModal — Dynamic Category Creation.
 * Opens a glassmorphism modal to create a new category (name + color).
 */

import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { AnimatedButton } from "@/components/AnimatedButton";
import Animated, { FadeInDown } from "react-native-reanimated";
import { addCategory } from "@/db/database";
import {
  CategoryPalette,
  GlassColors,
  GradientColors,
  Spacing,
  BorderRadius,
  MaxContentWidth,
  Shadow3D,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  type: "income" | "expense";
  onCategoryAdded: () => void;
}

export function AddCategoryModal({
  visible,
  onClose,
  type,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(
    type === "income" ? GradientColors.success : "#FF6B6B",
  );
  const [isSaving, setIsSaving] = useState(false);

  const canSave = name.trim().length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await addCategory({ name: name.trim(), color_hex: selectedColor, type });
      onCategoryAdded();
      setName("");
      onClose();
    } catch (e) {
      console.error("[add-category] Failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel = type === "income" ? "Khoản thu" : "Khoản chi";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView
        intensity={45}
        tint="dark"
        style={[
          styles.modalBackdrop,
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
        <View
          style={[
            styles.modalWrapper,
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
          <LinearGradient
            colors={["#050505", "#0a0a0f"]}
            style={styles.modalContainer}
          >
            <View style={styles.modalBorder} />

            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="default" style={styles.modalTitle}>
                  Thêm danh mục mới
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {typeLabel}
                </ThemedText>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.inputSection}>
              <ThemedText type="small" themeColor="textSecondary">
                Tên danh mục
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: "white",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderBottomColor: GradientColors.success + "40",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="VD: Ăn uống, Di chuyển..."
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputSection}>
              <ThemedText type="small" themeColor="textSecondary">
                Màu sắc
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorPicker}
              >
                {CategoryPalette.map((color, index) => {
                  const isSelected = selectedColor === color;
                  const glowColor =
                    type === "income" ? GradientColors.success : "#FF3366";
                  return (
                    <Animated.View
                      key={color}
                      entering={FadeInDown.delay(200 + index * 50)}
                    >
                      <Pressable
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          isSelected && [
                            styles.colorOptionSelected,
                            {
                              shadowColor: color,
                              borderWidth: 2,
                              borderColor: "#FFFFFF",
                            },
                          ],
                          !isSelected && {
                            shadowColor: glowColor,
                            shadowOpacity: 0.3,
                          },
                        ]}
                      />
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.previewSection}>
              <ThemedText type="small" themeColor="textSecondary">
                Xem trước
              </ThemedText>
              <View style={styles.preview}>
                <View
                  style={[
                    styles.previewSwatch,
                    { backgroundColor: selectedColor },
                  ]}
                />
                <ThemedText type="default" style={{ marginLeft: Spacing.two }}>
                  {selectedColor}
                </ThemedText>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <AnimatedButton onPress={onClose} style={styles.cancelButton}>
                <ThemedText themeColor="textSecondary">Hủy</ThemedText>
              </AnimatedButton>
              <AnimatedButton onPress={handleSave} disabled={!canSave}>
                <LinearGradient
                  colors={[GradientColors.primary, GradientColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.saveButtonGradient,
                    { opacity: canSave ? 1 : 0.5 },
                  ]}
                >
                  <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                    {isSaving ? "Đang lưu..." : "Lưu danh mục"}
                  </ThemedText>
                </LinearGradient>
              </AnimatedButton>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalWrapper: {
    width: "90%",
    maxWidth: MaxContentWidth,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadow3D.large,
  },
  modalContainer: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  modalBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: GlassColors.borderStrong,
    pointerEvents: "none",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 18,
  },
  closeButton: {
    padding: Spacing.half,
  },
  inputSection: {
    gap: Spacing.half,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 16,
    height: 44,
  },
  colorPicker: {
    flexDirection: "row",
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
  },
  colorOptionSelected: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  previewSection: {
    gap: Spacing.half,
    marginTop: Spacing.one,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: GlassColors.background,
    borderWidth: 1,
    borderColor: GlassColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
  },
  previewSwatch: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "flex-end",
    marginTop: Spacing.two,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
  },
  saveButtonGradient: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: BorderRadius.full,
  },
});
