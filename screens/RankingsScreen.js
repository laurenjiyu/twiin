import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RankingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Leaderboard Rankings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RankingsScreen;
