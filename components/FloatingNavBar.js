import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabIcon from "./TabIcon";

const FloatingNavBar = ({ state, descriptors, navigation }) => {
  const getIconName = (label) => {
    switch (label) {
      case "Home":
        return "home-outline";
      case "Rankings":
        return "trophy-outline";
      case "Profile":
        return "person-outline";
      default:
        return "home-outline";
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabButton}
          >
            <TabIcon name={getIconName(label)} focused={isFocused} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 80,
    right: 80,
    flexDirection: "row",
    backgroundColor: "black",
    borderRadius: 30,
    height: 50,
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 100,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
});

export default FloatingNavBar;
