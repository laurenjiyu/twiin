import React from "react";
import { Ionicons } from "@expo/vector-icons";
import theme from "../theme";
// TabIcon is just a little reusable icon renderer
const TabIcon = ({ name, focused }) => {
  return (
    <Ionicons
      name={name}
      size={28}
      color={focused ? theme.colors.background : "#555"} // green if active, grayish if not
    />
  );
};

export default TabIcon;
