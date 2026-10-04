import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Tabs, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { getDailyCashFlow } from "@/db/database";
import { formatDateId } from "@/lib/date";
import { useTheme } from "@/hooks/use-theme";
import {
  Spacing,
  MaxContentWidth,
  GradientColors,
  GlassColors,
  BorderRadius,
  Shadow3D,
} from "@/constants/theme";

export default function HomeScreen() {
  const theme = useTheme();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [currentDate, setCurrentDate] = useState(formatDateId());

  const loadData = useCallback(async () => {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      const start = formatDateId(startDate);
      const end = formatDateId(endDate);

      const cashFlow = await getDailyCashFlow(start, end);

      const today = formatDateId();
      const marks: Record<string, any> = {
        [today]: { selected: true, selectedColor: GradientColors.primary },
      };

      cashFlow.forEach((cf) => {
        const isPositive = cf.net_flow >= 0;
        marks[cf.date] = {
          ...marks[cf.date],
          dot: {
            color: isPositive ? GradientColors.success : GradientColors.danger,
            width: 8,
            height: 8,
          },
        };
      });

      setMarkedDates(marks);
    } catch (e) {
      console.error("[home] Failed to load calendar data:", e);
    } finally {
    }
  }, []);

  const handleDayPress = (day: { dateString: string }) => {
    router.push({
      pathname: "/daily/[date]",
      params: { date: day.dateString },
    });
  };

  const handleMonthChange = (date: { dateString: string }) => {
    setCurrentDate(date.dateString);
  };

  const handleAddPress = () => {
    router.push({
      pathname: "/add-transaction",
      params: { date: formatDateId() },
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const calendarTheme = {
    calendarBackground: "transparent",
    textSectionTitleColor: theme.textSecondary,
    textSectionTitleFontSize: 12,
    textMonthColor: theme.text,
    textMonthFontSize: 18,
    textMonthFontWeight: "600" as const,
    textDayColor: theme.text,
    textDayFontSize: 16,
    textInactiveColor: theme.textSecondary,
    textInactiveFontSize: 13,
    textActiveColor: GradientColors.primary,
    textActiveFontSize: 13,
    textActiveFontWeight: "600" as const,
    dotColor: GradientColors.success,
    selectedDotColor: GradientColors.primary,
    monthTextColor: theme.text,
    arrowColor: GradientColors.primary,
    dotStyle: {
      width: 8,
      height: 8,
      borderRadius: 4,
      margin: 0,
      shadowColor: "#fff",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 3,
    },
    textDisabledColor: theme.textSecondary,
    textDisabledFontSize: 13,
    textDisabledFontWeight: "400" as const,
  };

  return (
    <>
      <Tabs.Screen
        options={{
          title: "Lưu Chuyển",
          headerTitleAlign: "center",
          headerTitle: () => (
            <LinearGradient
              colors={[GradientColors.primary, GradientColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <ThemedText style={styles.headerTitle}>Lưu Chuyển</ThemedText>
            </LinearGradient>
          ),
          headerRight: () => (
            <View style={styles.headerButtonContainer}>
              <Animated.View entering={FadeInUp.delay(100)}>
                <BlurView
                  intensity={20}
                  tint="default"
                  style={styles.headerBlur}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={theme.text}
                    style={styles.headerButton}
                    onPress={handleAddPress}
                  />
                </BlurView>
              </Animated.View>
            </View>
          ),
        }}
      />
      {/* Premium Space Gradient Background */}
      <LinearGradient
        colors={GradientColors.space}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={styles.container}>
        <Animated.View
          entering={FadeInUp.springify()}
          style={styles.contentWrapper}
        >
          <Calendar
            key={currentDate}
            current={currentDate}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            hideExtraDays={false}
            theme={calendarTheme as any}
            style={styles.calendar}
          />
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentWrapper: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
    paddingTop: Spacing.three,
  },
  calendar: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GlassColors.border,
    backgroundColor: GlassColors.background,
    ...Shadow3D.medium,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerButtonContainer: {
    marginRight: -4,
  },
  headerBlur: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerButton: {
    padding: Spacing.half,
  },
});
