import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
// import { GoldTrophy, SilverTrophy, BronzeTrophy } from "./twiin/assets/icons"; // Adjust path as needed
// Importing PNG icons from the assets folder
import GoldTrophy from "../assets/icons/GoldTrophy.png";
import SilverTrophy from "../assets/icons/SilverTrophy.png";
import BronzeTrophy from "../assets/icons/BronzeTrophy.png";
import DefaultTrophy from "../assets/icons/DefaultTrophy.png";

// const generateRankedList = (users) => {
//   return users
//     .sort((a, b) => b.points - a.points)
//     .map((user, index) => ({
//       ...user,
//       rank: index + 1,
//     }));
// };

// Sample leaderboard
const leaderboardData = [
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
  {
    rank: 5,
    username: "Ethan",
    avatarUrl: "https://via.placeholder.com/100",
    points: 940,
  },
  {
    rank: 6,
    username: "Fay",
    avatarUrl: "https://via.placeholder.com/100",
    points: 900,
  },
  {
    rank: 7,
    username: "George",
    avatarUrl: "https://via.placeholder.com/100",
    points: 880,
  },
  {
    rank: 8,
    username: "George",
    avatarUrl: "https://via.placeholder.com/100",
    points: 880,
  },
  {
    rank: 9,
    username: "George",
    avatarUrl: "https://via.placeholder.com/100",
    points: 800,
  },
  {
    rank: 10,
    username: "George",
    avatarUrl: "https://via.placeholder.com/100",
    points: 750,
  },
  {
    rank: 11,
    username: "George",
    avatarUrl: "https://via.placeholder.com/100",
    points: 700,
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
  // const [leaderboardData, setLeaderboardData] = useState([]);

  // // Fetch leaderboard data from Supabase (or replace with local static data)
  // useEffect(() => {
  //   const fetchLeaderboardData = async () => {
  //     // Example fetch from Supabase (commented out for now)
  //     /*
  //     const { data, error } = await supabase.from('users').select('username, avatarUrl, points');
  //     if (error) {
  //       console.log('Error fetching leaderboard data', error);
  //     } else {
  //       setLeaderboardData(data);
  //     }
  //     */

  //     // COMMENT OUT this block when Supabase is integrated
  //     const rawUserData = [
  //       { username: 'Alice', avatarUrl: 'https://via.placeholder.com/100', points: 1200 },
  //       { username: 'Bob', avatarUrl: 'https://via.placeholder.com/100', points: 1100 },
  //       { username: 'Charlie', avatarUrl: 'https://via.placeholder.com/100', points: 1050 },
  //       { username: 'Diana', avatarUrl: 'https://via.placeholder.com/100', points: 980 },
  //       { username: 'Ethan', avatarUrl: 'https://via.placeholder.com/100', points: 940 },
  //       { username: 'Fay', avatarUrl: 'https://via.placeholder.com/100', points: 900 },
  //     ];
  //     setLeaderboardData(rawUserData);
  //   };

  //   fetchLeaderboardData();
  // }, []);

  // // Generate the ranked leaderboard based on points (commented for now)
  // const rankedUsers = generateRankedList(leaderboardData);

  //prev leaderboard mapping
  // {leaderboardData.map((user) => (
  //   <View key={user.rank} style={styles.card}>
  //     <View style={styles.rankRow}>
  //       <Text style={styles.rankText}>#{user.rank}</Text>
  //       <TrophyIcon rank={user.rank} />
  //     </View>

  //     <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
  //     <Text style={styles.username}>{user.username}</Text>
  //     <Text style={styles.points}>{user.points} pts</Text>
  //   </View>
  // ))}
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>RANKING</Text>

      {leaderboardData.map((user) => (
        <View key={user.rank} style={styles.card}>
          <View style={styles.rankRow}>
            <Text style={styles.rankText}>#{user.rank}</Text>
            <Text style={styles.username}>{user.username}</Text>

            {/* Wrap Trophy and Points in a container aligned to the right */}
            <View style={styles.pointsTrophyContainer}>
              {/* Show trophy for rank 1-3 */}
              {<TrophyIcon rank={user.rank} />}
              <Text style={styles.points}>{user.points} pts</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// const RankingsScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text>Leaderboard Rankings</Text>
//     </View>
//   );
// };

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    width: "100%", // Full width of the screen
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    marginRight: 10, // Adds space between username and pointsTrophyContainer
  },
  pointsTrophyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align the trophy and points to the right
    gap: 6, // Controls spacing between trophy and points
  },
  points: {
    fontSize: 18,
    color: "#666",
  },
  trophyIcon: {
    width: 20,
    height: 20,
  },
});

export default RankingsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
