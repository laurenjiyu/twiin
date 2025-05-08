import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { uploadVote } from '../db';  // Example path, update to actual location
import CustomButton from './CustomButton';

const difficultyColors = {
    EASY: "#C0F5E4", // Light green background
    MEDIUM: "#FFBF91", // Light orange background
    HARD: "#FDB4BD", // Light red background
  };
  
  const buttonColors = {
    EASY: "#D3FF8C",
    MEDIUM: "#FF9650",
    HARD: "#FF8A8A",
  };
  

const ChallengeCard = ({ difficulty, challengeIndex, onVote, voteButtonColor, voteButtonDisabled }) => {
  const [selected, setSelected] = useState(false);

  const handleVote = async () => {
    try {
      // Invoke the uploadVote function with the provided difficulty and challenge
      await uploadVote(difficulty, challenge);
      // Mark this challenge as selected (voted)
      setSelected(true);
      // Trigger the onVote callback to inform parent component (if provided)
      if (onVote) {
        onVote(difficulty, challenge);
      }
    } catch (error) {
      console.error('Error voting on challenge:', error);
      // Handle errors (you might show an alert or toast in a real app)
    }
  };

  return (
    <View style={[styles.card, backgroundColor=buttonColors[difficulty]]}>
      {/* Challenge title or name */}
      <Text style={styles.challengeTitle}>{challenge.title}</Text>

      {/* Vote button */}
      <CustomButton
        style={[
          styles.voteButton,
          // If a custom vote button color is provided via props, apply it
          voteButtonColor ? { backgroundColor: voteButtonColor } : null
        ]}
        onPress={handleVote}
        backgroundColor={difficultyColors[difficulty]} 
        disabled={selected || voteButtonDisabled}
      >
        VOTE FOR CHALLENGE
      </CustomButton>
    </View>
  );
};

// Styles for the challenge card and its elements
const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    // Elevation for Android, shadow for iOS
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  voteButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#2196F3' // default color (can be overridden via props)
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  }
});

export default ChallengeCard;
