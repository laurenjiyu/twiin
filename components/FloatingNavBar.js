import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // easy way to get icons
import TabIcon from './TabIcon'; // import the TabIcon component

const FloatingNavBar = ({ state, descriptors, navigation }) => {
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

        // basic press action
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
            {/* This will render icons */}
            <TabIcon
                name={label === 'Home' ? 'home-outline' : 'trophy-outline'}
                focused={isFocused}
            />

          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'black',
    borderRadius: 30,
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    elevation: 10, // android shadow
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
});

export default FloatingNavBar;
