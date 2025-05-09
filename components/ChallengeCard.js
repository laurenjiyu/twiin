import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import CustomButton from "./CustomButton";
import theme from "../theme";
import { uploadVote, supabase } from "../db";

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
  userInfo = {},
  twiinInfo = {},
  difficulty = "EASY",
  challengeInfo = {},
  currSelectedId = null,
  voteForChallenge = () => {},
}) => {
  const [userAvatarBase64, setUserAvatarBase64] = useState(null);
  const [twiinAvatarBase64, setTwiinAvatarBase64] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingTwiin, setIsLoadingTwiin] = useState(false);

  // Validate required props
  if (!difficulty || !Object.keys(difficultyColors).includes(difficulty)) {
    console.warn("Invalid difficulty level provided to ChallengeCard");
    difficulty = "EASY"; // Fallback to EASY
  }

  const fetchAvatar = async (userId, isUser = true) => {
    try {
      if (isUser) {
        setIsLoadingUser(true);
      } else {
        setIsLoadingTwiin(true);
      }

      // First get the user's avatar_name from the database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("avatar_name")
        .eq("id", userId)
        .single();

      if (userError || !userData?.avatar_name) {
        console.log("Error fetching avatar name:", userError);
        if (isUser) {
          setUserAvatarBase64(null);
        } else {
          setTwiinAvatarBase64(null);
        }
        return;
      }

      // Use the avatar_name to download the file
      const { data, error: downloadError } = await supabase.storage
        .from("avatars")
        .download(`avatars/${userData.avatar_name}`);

      if (downloadError) {
        console.log("Error downloading avatar image:", downloadError);
        if (isUser) {
          setUserAvatarBase64(null);
        } else {
          setTwiinAvatarBase64(null);
        }
        return;
      }

      // Convert the file to base64
      const reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onloadend = () => {
        if (isUser) {
          setUserAvatarBase64(reader.result);
        } else {
          setTwiinAvatarBase64(reader.result);
        }
      };
    } catch (error) {
      console.error("Error in fetchAvatar:", error);
    } finally {
      if (isUser) {
        setIsLoadingUser(false);
      } else {
        setIsLoadingTwiin(false);
      }
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      fetchAvatar(userInfo.id, true);
    }
    if (twiinInfo?.id) {
      fetchAvatar(twiinInfo.id, false);
    }
  }, [userInfo?.id, twiinInfo?.id]);

  const handleVote = async () => {
    try {
      if (!challengeInfo?.id || !userInfo?.id) {
        console.error("Missing required IDs for voting");
        return;
      }

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
        voteForChallenge(voteIndex);
      }
    } catch (err) {
      console.error("Unexpected error during vote:", err);
    }
  };

  const alreadySelected = currSelectedId === (challengeInfo?.id || null);
  const partnersChoice =
    twiinInfo?.selected_challenge_id === (challengeInfo?.id || null);

  return (
    <View
      style={[
        styles.challengeCard,
        {
          backgroundColor:
            difficultyColors[difficulty] || difficultyColors.EASY,
        },
      ]}
    >
      {alreadySelected && (
        <View style={[styles.profileImageWrapper, styles.leftSide]}>
          {isLoadingUser ? (
            <ActivityIndicator size="small" color={theme.colors.darkBlue} />
          ) : (
            <Image
              source={
                userAvatarBase64
                  ? { uri: userAvatarBase64 }
                  : require("../assets/icons/anonymous.png")
              }
              style={styles.profileImage}
            />
          )}
        </View>
      )}

      {partnersChoice && (
        <View style={[styles.profileImageWrapper, styles.rightSide]}>
          {isLoadingTwiin ? (
            <ActivityIndicator size="small" color={theme.colors.darkBlue} />
          ) : (
            <Image
              source={
                twiinAvatarBase64
                  ? { uri: twiinAvatarBase64 }
                  : require("../assets/icons/anonymous.png")
              }
              style={styles.profileImage}
            />
          )}
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
            {challengeInfo?.full_desc || "No challenge available"}
          </Text>
        </View>

        <View style={styles.challengeSectionBottom}>
          <CustomButton
            backgroundColor={
              alreadySelected
                ? theme.colors.lightGray
                : buttonColors[difficulty] || buttonColors.EASY
            }
            onPress={handleVote}
            disabled={alreadySelected || !challengeInfo?.id}
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
