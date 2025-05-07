import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import RankingsScreen from "../screens/RankingsScreen";
import FloatingNavBar from "../components/FloatingNavBar";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
<Tab.Navigator tabBar={(props) => <FloatingNavBar {...props} />}>
  <Tab.Screen
    name="Home"
    component={HomeScreen}
    options={{ headerShown: false, tabBarLabel: () => null }}
  />
  <Tab.Screen
    name="Rankings"
    component={RankingsScreen}
    options={{ headerShown: false, tabBarLabel: () => null }}
  />
  <Tab.Screen
    name="Profile"
    component={ProfileScreen}
    options={{ headerShown: false, tabBarLabel: () => null }}
  />
</Tab.Navigator>

  );
};

export default TabNavigator;
