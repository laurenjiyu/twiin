import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";
import theme from "../theme";
import { uploadVote } from "../db";

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

const ChallengeCard = ({
  difficulty,
  challengeInfo,
  currSelectedId,
  voteForChallenge,
}) => {

    const handleVote = async () => {
  if (challengeInfo && challengeInfo.id && currentUserId) {
    try {
      const { voteIndex, error } = await uploadVote(challengeInfo.id, currentUserId);
      if (error) {
        console.error("Error voting for challenge:", error);
      } else {
        console.log("Voted for challenge ID:", voteIndex);
        voteForChallenge(voteIndex); // Update parent state if needed
      }
    } catch (err) {
      console.error("Unexpected error during vote:", err);
    }
  }
};


  const isSelected = currSelectedId === (challengeInfo?.id || null);

  return (
    <View
      style={[
        styles.challengeCard,
        { backgroundColor: difficultyColors[difficulty] },
      ]}
    >
      <View style={styles.challengeContent}>
        <View style={styles.challengeSectionTop}>
          <Text style={styles.cardLabel}>{difficulty}</Text>
          <Text style={styles.pointsLabel}>
            +{challengeInfo?.point_value || 100}
          </Text>
        </View>

        <View style={styles.challengeSectionMiddle}>
          <Text style={styles.challengeText}>
            {challengeInfo ? challengeInfo.full_desc : "No challenge"}
          </Text>
        </View>

        <View style={styles.challengeSectionBottom}>
          <CustomButton
            backgroundColor={isSelected ? buttonColors[difficulty] : "red"}
            onPress={handleVote}
            disabled={isSelected}
          >
            {isSelected ? "CHALLENGE SELECTED" : "VOTE FOR CHALLENGE"}
          </CustomButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  challengeCard: {
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#000",
    elevation: 5,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  challengeContent: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  challengeSectionTop: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  challengeSectionMiddle: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    maxHeight: 150, // Optional: keep the content from growing too tall
  },
  challengeText: {
    fontSize: 20,
    textAlign: "center",
    color: "black",
    fontFamily: theme.text.body,
    flexWrap: "wrap",
    lineHeight: 24,
  },
  challengeSectionBottom: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cardLabel: {
    fontSize: 30,
    fontFamily: theme.text.heading,
    fontWeight: "bold",
    color: "black",
  },
  pointsLabel: {
    fontSize: 14,
    color: "black",
  },
});

export default ChallengeCard;
