import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import theme from "../theme";
import defaultProfile from "../assets/default_profile.jpg";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "./CustomButton";
import { supabase } from "../db";

const ChallengeCompleteView = ({
  userInfo,
  pointsEarned = 300,
  setSubmitted,
}) => {
  const navigation = useNavigation();
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);
      setAvatarBase64(null);

      if (!userInfo?.id) {
        console.error("No user ID provided");
        return;
      }

      // Get user data including avatar_name
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("avatar_name")
        .eq("id", userInfo.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Use avatar_name from the database
      if (userData?.avatar_name) {
        const { data, error: downloadError } = await supabase.storage
          .from("avatars")
          .download(userData.avatar_name);

        if (downloadError) {
          console.log("Error downloading avatar image:", downloadError);
          console.log("Switch to default profile");
          setAvatarBase64(null);
          return;
        }

        // Convert the file to base64
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = () => {
          setAvatarBase64(reader.result);
        };
      }
    } catch (error) {
      console.error("Error in fetchAvatar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      fetchAvatar();
    }
  }, [userInfo?.id]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.darkBlue} />
      ) : (
        <Image
          source={avatarBase64 ? { uri: avatarBase64 } : defaultProfile}
          style={styles.avatar}
          key={avatarBase64} // Add key to force re-render when avatar changes
        />
      )}

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
    width: 150,
    height: 150,
    borderRadius: 90,
    marginBottom: 20,
    borderColor: theme.colors.blue,
    borderWidth: 2,
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
