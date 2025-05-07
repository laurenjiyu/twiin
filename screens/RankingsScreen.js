import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import theme from "../theme";
import GoldTrophy from "../assets/icons/GoldTrophy.png";
import SilverTrophy from "../assets/icons/SilverTrophy.png";
import BronzeTrophy from "../assets/icons/BronzeTrophy.png";
import DefaultTrophy from "../assets/icons/DefaultTrophy.png";
import { supabase } from "../db";
import TopBar from "../components/TopBar";

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

  //find current user points for topbar
  const currentUser = leaderboardData.find(
    (user) => user.userId === currentUserId
  );
  const currentPoints = currentUser?.points ?? 0;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await generateLeaderboard();
      setLeaderboardData(data.length ? data : sampleData);
    };

    fetchLeaderboard();
  }, []);

  return (
    <SafeAreaView style={[styles.container]}>
      <TopBar groupName="CS278" points={currentPoints} />

      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>TOP TWIINS</Text>
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
        <View style={{ paddingVertical: 13 }}>
          <Text style={styles.username}>more twiins on the way...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F2", // very light off-white
  },
  blueHeader: {
    width: "100%",
    backgroundColor: theme.colors.darkestBlue, // strong blue
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 5,
  },
  blueHeaderText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 8,
    backgroundColor: "#FAFAF7",
    alignItems: "center",
  },
  card: {
    width: "95%",
    backgroundColor: "#FAFAF7",
    borderRadius: 12,
    borderWidth: 1.25,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userCard: {
    width: "95%",
    backgroundColor: theme.colors.yourMatchCard,
    borderRadius: 12,
    borderColor: "#000",
    borderWidth: 1.25,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 10,
    alignItems: "center",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  rankText: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 10,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    flex: 1,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  pointsTrophyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  points: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 4,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  trophyIcon: {
    width: 22,
    height: 22,
    marginLeft: 2,
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
