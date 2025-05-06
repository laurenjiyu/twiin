import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Button,
  ActivityIndicator,
} from "react-native";
import theme from "../theme";
import GoldTrophy from "../assets/icons/GoldTrophy.png";
import SilverTrophy from "../assets/icons/SilverTrophy.png";
import BronzeTrophy from "../assets/icons/BronzeTrophy.png";
import DefaultTrophy from "../assets/icons/DefaultTrophy.png";
import { supabase } from "../db";

const generateLeaderboard = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, avatar_url, total_points")
    .order("total_points", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    username: user.name,
    avatarUrl: user.avatar_url || "https://via.placeholder.com/100", //placeholder bc avatar_url null
    points: user.total_points,
  }));
};

//Sample leaderboard
const sampleData = [
  {
    rank: 1,
    username: "Alice",
    avatarUrl: "https://via.placeholder.com/100",
    points: 1200,
  },
  {
    rank: 2,
    username: "Bob",
    avatarUrl: "https://via.placeholder.com/100",
    points: 1100,
  },
  {
    rank: 3,
    username: "Charlie",
    avatarUrl: "https://via.placeholder.com/100",
    points: 1050,
  },
  {
    rank: 4,
    username: "Diana",
    avatarUrl: "https://via.placeholder.com/100",
    points: 980,
  },
];

const TrophyIcon = ({ rank }) => {
  let source;

  switch (rank) {
    case 1:
      source = GoldTrophy;
      break;
    case 2:
      source = SilverTrophy;
      break;
    case 3:
      source = BronzeTrophy;
      break;
    default:
      source = DefaultTrophy;
      break;
  }

  return <Image source={source} style={styles.trophyIcon} />;
};

const RankingsScreen = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  //fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("Error fetching session:", sessionError);
        return; //if user not logged in
      }

      const currentUser = sessionData.session.user;
      console.log("User:", currentUser);
      setCurrentUserId(currentUser.id);
    };

    fetchUser();
  }, []);

  //create leaderboard
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await generateLeaderboard();
      setLeaderboardData(data.length ? data : sampleData);
    };

    fetchLeaderboard();
  }, []);

  return (
    <View style={[styles.container]}>
      <View style={[styles.titleContainer]}>
        <Text style={[styles.header]}>LEADERBOARD</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {leaderboardData.map((user) => {
          const isCurrentUser = user.userId === currentUserId;

          return (
            <View
              key={user.rank}
              style={isCurrentUser ? styles.userCard : styles.card}
            >
              <View style={styles.rankRow}>
                <Text style={styles.rankText}>#{user.rank}</Text>
                <Text style={styles.username}>{user.username}</Text>

                <View style={styles.pointsTrophyContainer}>
                  <TrophyIcon rank={user.rank} />
                  <Text style={styles.points}>{user.points} pts</Text>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ paddingVertical: 20 }}>
          <Text style={styles.username}>more twiins on the way...</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkestBlue,
  },
  titleContainer: {
    width: "100%", // Full width of the screen
    padding: 10,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: theme.colors.blue,
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: theme.colors.darkestBlue,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_700Bold", // Apply the loaded font
  },
  card: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 2,
  },
  userCard: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",

    // Bright shadow/glow
    // shadowColor: "#ffe066", // bright yellow
    // shadowOffset: { width: 0, height: -1 },
    // shadowOpacity: 1,
    // shadowRadius: 12,
    // elevation: 1,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Makes sure rank and username are on the left, and trophy + points go to the right
    width: "100%", // Ensure the row takes full width
  },
  rankText: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 5,
    fontFamily: "SpaceGrotesk_700Bold", // Apply the loaded font
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    marginRight: 10, // Adds space between username and pointsTrophyContainer
    fontFamily: "SpaceGrotesk_400RBold", // Apply the loaded font
  },
  pointsTrophyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align the trophy and points to the right
    gap: 6, // Controls spacing between trophy and points
  },
  points: {},
  trophyIcon: {
    width: 20,
    height: 20,
  },
  shadowIOS: {
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  shadowAndroid: {
    elevation: 6,
  },
});

export default RankingsScreen;
