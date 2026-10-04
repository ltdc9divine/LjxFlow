import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

export function AnimatedButton({
  onPress,
  children,
  style,
  disabled = false,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    "worklet";
    if (disabled) return;
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSequence(
      withSpring(0.95, { stiffness: 400, damping: 15 }),
      withSpring(1, { stiffness: 300, damping: 10 }),
    );
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle, { alignSelf: "stretch" }]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[styles.button, style, disabled && styles.disabled]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
