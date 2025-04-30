import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import TabNavigator from './navigation/TabNavigator';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Text } from 'react-native';

const App = () => {
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <TabNavigator />
      ) : (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
    </NavigationContainer>
  );
};

export default App;
