import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
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
  userInfo,
  twiinInfo,
  difficulty,
  challengeInfo,
  currSelectedId,
  voteForChallenge,
}) => {
  const handleVote = async () => {
    try {
      console.log("Voting for challenge info:", challengeInfo);
      console.log("Current user ID:", userInfo.id);
      const { voteIndex, error } = await uploadVote(
        challengeInfo.id,
        userInfo.id
      );
      if (error) {
        console.error("Error voting for challenge:", error);
      } else {
        console.log("Voted for challenge ID:", voteIndex);
        voteForChallenge(voteIndex); // Update parent state if needed
      }
    } catch (err) {
      console.error("Unexpected error during vote:", err);
    }
  };

  const alreadySelected = currSelectedId === (challengeInfo?.id || null);
  const partnersChoice = twiinInfo.selected_challenge_id === (challengeInfo?.id || null);


  return (
    <View
      style={[
        styles.challengeCard,
        { backgroundColor: difficultyColors[difficulty] },
      ]}
    >
      {alreadySelected && (
        <View style={[styles.profileImageWrapper, styles.leftSide]}>
          <Image
            source={
              userInfo.avatar_url
                ? { uri: userInfo.avatar_url }
                : require("../assets/icons/anonymous.png")
            } // fallback to defaultProfile
            style={styles.profileImage}
          />
        </View>
      )}

      {partnersChoice && (
        <View style={[styles.profileImageWrapper, styles.rightSide]}>
          <Image
            source={
              twiinInfo.avatar_url
                ? { uri: twiinInfo.avatar_url }
                : require("../assets/icons/anonymous.png")
            } // fallback to defaultProfile
            style={styles.profileImage}
          />
        </View>
      )}

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
            backgroundColor={
              alreadySelected
                ? theme.colors.lightGray
                : buttonColors[difficulty]
            }
            onPress={handleVote}
            disabled={alreadySelected}
          >
            {alreadySelected ? "CHALLENGE SELECTED" : "VOTE FOR CHALLENGE"}
          </CustomButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  challengeCard: {
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#000",
    elevation: 5,
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
    marginBottom: 10,
  },
  profileImageWrapper: {
    position: "absolute",
    top: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSide: {
    left: 10,
  },
  rightSide: {
    right: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#000",
  },
  challengeSectionMiddle: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
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
    fontSize: 20,
    color: "black",
  },
});

export default ChallengeCard;
