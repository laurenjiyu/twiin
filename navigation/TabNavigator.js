import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RankingsScreen from '../screens/RankingsScreen';
import FloatingNavBar from '../components/FloatingNavBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator tabBar={(props) => <FloatingNavBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rankings" component={RankingsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
