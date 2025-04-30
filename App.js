import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import TabNavigator from './navigation/TabNavigator';
import RootNavigator from './navigation/RootNavigator';

import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Ojuju_400Regular, Ojuju_700Bold } from '@expo-google-fonts/ojuju';
import { Text } from 'react-native';
import Theme from './assets/theme'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    Ojuju_400Regular,
    Ojuju_700Bold,
  });
  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <RootNavigator/>
    </NavigationContainer>
  );
};

export default App;
