import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import theme from "../theme";

export default function Button({
  onPress,
  backgroundColor = "#000",
  fontSize = 16,
  children,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
          ...Platform.select({
            ios: styles.shadowIOS,
            android: styles.shadowAndroid,
          }),
        },
      ]}
    >
      <Text style={[styles.buttonText, { fontSize }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    paddingHorizontal: 10,
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
