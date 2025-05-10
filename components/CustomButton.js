import React, { useRef } from "react";
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import theme from "../theme";

export default function CustomButton({
  onPress,
  backgroundColor = theme.colors.blue,
  fontSize = 16,
  disabled = false,
  children,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const completeAction = () => {
    if (!disabled) onPress();
  };

  const dynamicBackground = disabled ? theme.colors.lightGray : backgroundColor;

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={completeAction}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: dynamicBackground,
            transform: [{ scale: scaleAnim }],
            ...Platform.select({
              ios: styles.shadowIOS,
              android: styles.shadowAndroid,
            }),
          },
        ]}
      >
        <Text style={[styles.buttonText, { fontSize }]}>{children}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    borderWidth: 2,
    borderColor: "black",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontFamily: theme.text.heading,
  },
  shadowIOS: {
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  shadowAndroid: {
    elevation: 6,
  },
});
