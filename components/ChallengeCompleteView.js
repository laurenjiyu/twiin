import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import theme from "../theme";
import defaultProfile from "../assets/default_profile.jpg";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "./CustomButton";

const ChallengeCompleteView = ({ userInfo, pointsEarned = 300, setSubmitted}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={
          userInfo?.avatar_url ? { uri: userInfo.avatar_url } : defaultProfile
        }
        style={styles.avatar}
      />

      <Text style={styles.pointsText}>
        + {userInfo.total_points + pointsEarned}
      </Text>
      <Text style={styles.completeText}>CHALLENGE COMPLETE! 🎉</Text>
      <Text style={styles.huzzahText}>HUZZAH!</Text>
      <Text style={styles.earnedText}>You just earned {pointsEarned} 🏆!</Text>

      <CustomButton
        backgroundColor={theme.colors.darkestBlue}
        style={styles.leaderboardButton}
        onPress={() => navigation.navigate("Rankings")}
      >
        <Text style={styles.leaderboardText}>LEADERBOARD</Text>
      </CustomButton>

      <CustomButton
        backgroundColor={theme.colors.darkOrange}
        style={styles.leaderboardButton}
        onPress={() => setSubmitted(false)}
      >
        Redo!
      </CustomButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 70,
    fontWeight: "bold",
    fontFamily: theme.text.title_bold,
    marginBottom: 10,
  },
  completeText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: theme.text.heading,
    marginBottom: 10,
  },
  huzzahText: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: theme.text.body,
  },
  earnedText: {
    fontSize: 16,
    fontFamily: theme.text.body,
    marginBottom: 30,
  },
  leaderboardButton: {
    backgroundColor: "#2F3AC5",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leaderboardText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default ChallengeCompleteView;


