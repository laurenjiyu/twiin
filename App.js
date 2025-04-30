import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import TabNavigator from './navigation/TabNavigator';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
