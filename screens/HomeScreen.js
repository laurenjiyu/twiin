import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import theme from "../theme";
import {
  supabase,
  getChallengeList,
  getChallengePeriod,
  getUserMatch,
} from "../db";
import defaultProfile from "../assets/default_profile.jpg";

const difficultyColors = {
  EASY: "#DFFFEF",      // Light green background
  MEDIUM: "#FFF3E0",    // Light orange background
  HARD: "#FFEBEE"       // Light red background
};

const buttonColors = {
  EASY: "#DFFF90", 
  MEDIUM: "#FFBD59", 
  HARD: "#FF7676"
};

const HomeScreen = () => {
  const [challengePeriod, setChallengePeriod] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [match, setMatch] = useState(null);
  const [challengesByDifficulty, setChallengesByDifficulty] = useState({});
  const [currentDifficultyIdx, setCurrentDifficultyIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const difficulties = ["EASY", "MEDIUM", "HARD"];
  const copyEmailToClipboard = async () => {
    if (match?.email) {
      await Clipboard.setStringAsync(match.email);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };  
  // const [currentUserId, setCurrentUserId] = useState(null);
  //fetch user info
  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("Error fetching session:", sessionError);
        return; //if user not logged in
      }

      const currentUser = sessionData.session.user;

      const { data: listData } = await getChallengeList();
      const grouped = {
        EASY: [],
        MEDIUM: [],
        HARD: []
      };
      // console.log("List Data:", listData);
      listData.forEach(challenge => {
        grouped[challenge.difficulty]?.push(challenge);
      });
      // console.log("Grouped Challenges:", grouped);
      const randomChallenges = {};
      for (const diff of difficulties) {
        const group = grouped[diff];
        randomChallenges[diff] = group.length > 0 ? group[Math.floor(Math.random() * group.length)] : null;
      }
      // console.log("Random Challenges:", randomChallenges);
      setChallengesByDifficulty(randomChallenges);

      const { data: periodData } = await getChallengePeriod();
      if (periodData?.[0]) {
        setChallengePeriod(periodData[0]);
        // console.log("Challenge Period:", periodData[0]);

        // const { data: userData } = await getUserProfile(user.id);
        console.log("Current User ID:", currentUser.id);
        const { match: matchData } = await getUserMatch(currentUser.id, periodData[0].id);
        if (matchData) {
          setMatch(matchData);
          console.log("Match Data:", matchData);
        }
      }
    };
    loadData();
  }, []);

  // useEffect(() => {
  //   const loadData = async () => {
  //     const { data: listData } = await getChallengeList();
  //     const grouped = {
  //       EASY: [],
  //       MEDIUM: [],
  //       HARD: []
  //     };
  //     console.log("List Data:", listData);
  //     listData.forEach(challenge => {
  //       grouped[challenge.difficulty]?.push(challenge);
  //     });
  //     console.log("Grouped Challenges:", grouped);
  //     const randomChallenges = {};
  //     for (const diff of difficulties) {
  //       const group = grouped[diff];
  //       randomChallenges[diff] = group.length > 0 ? group[Math.floor(Math.random() * group.length)] : null;
  //     }
  //     console.log("Random Challenges:", randomChallenges);
  //     setChallengesByDifficulty(randomChallenges);

  //     const { data: periodData } = await getChallengePeriod();
  //     if (periodData?.[0]) {
  //       setChallengePeriod(periodData[0]);
  //       console.log("Challenge Period:", periodData[0]);

  //       // const { data: userData } = await getUserProfile(user.id);
  //       console.log("Current User ID:", currentUserId);
  //       const { match: matchData } = await getUserMatch(currentUserId, periodData[0].id);
  //       if (matchData) {
  //         setMatch(matchData);
  //         console.log("Match Data:", matchData);
  //       }
  //     }
  //   };

  //   loadData();
  // }, []);

  useEffect(() => {
    if (!challengePeriod) return;

    const endTime = new Date(challengePeriod.end_time);
    const updateTimer = () => {
      const now = new Date();
      const distance = endTime - now;
      if (distance <= 0) {
        setTimeLeft({ expired: true });
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds, expired: false });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [challengePeriod]);

  const currentDifficulty = difficulties[currentDifficultyIdx];
  const currentChallenge = challengesByDifficulty[currentDifficulty];

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>⏳{timeLeft.expired ? "00:00" : `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}    </Text>

      {/* Match Card */}
      <View style={styles.matchCard}>
        <Text style={styles.matchHeader}>YOUR MATCH</Text>
        {match ? (
          <View style={styles.matchRow}>
            <Image
              source={match.avatar_url ? { uri: match.avatar_url } : defaultProfile}
              style={styles.avatar}
            />
            <Text style={styles.matchName}>{match.name}</Text>
            <TouchableOpacity onPress={copyEmailToClipboard}>
              <Icon name="mail-outline" size={24} style={styles.envelope} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text>No match found</Text>
        )}
        <TouchableOpacity style={styles.rematchButton}>
          <Text style={styles.rematchText}>REMATCH</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.challengeTitle}>CHALLENGE DECK</Text>
        <View style={[styles.challengeCard, { backgroundColor: difficultyColors[currentDifficulty] }]}>
          <View style={styles.challengeRow}>
            <TouchableOpacity
              onPress={() => setCurrentDifficultyIdx((i) => Math.max(i - 1, 0))}
              disabled={currentDifficultyIdx === 0}
            >
        <Text style={[styles.arrow, currentDifficultyIdx === 0 && styles.disabledArrow]}>{'<'}</Text>
          </TouchableOpacity>

          <View style={styles.challengeContent}>
            <View style={styles.challengeSectionTop}>
              <Text style={styles.difficultyLabel}>{currentDifficulty}</Text>
              <Text style={styles.pointsLabel}>+100</Text>
            </View>

            <View style={styles.challengeSectionMiddle}>
              <Text style={styles.challengeText}>
                {currentChallenge ? currentChallenge.full_desc : "No challenge"}
              </Text>
            </View>

            <View style={styles.challengeSectionBottom}>
              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: buttonColors[currentDifficulty] }]}
              >
                <Text style={styles.selectText}>SELECT</Text>
              </TouchableOpacity>
            </View>
        </View>

        <TouchableOpacity
          onPress={() => setCurrentDifficultyIdx((i) => Math.min(i + 1, difficulties.length - 1))}
          disabled={currentDifficultyIdx === difficulties.length - 1}
        >
          <Text style={[styles.arrow, currentDifficultyIdx === difficulties.length - 1 && styles.disabledArrow]}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  
        {showToast && (
          <View style={{ position: "absolute", bottom: 50, left: "50%", transform: [{ translateX: -50 }] }}>
            <Text style={{ backgroundColor: "#000", color: "#fff", padding: 10, borderRadius: 5 }}>Email copied!</Text>
          </View>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  timer: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center", // centered again
    marginBottom: 20,
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  
  challengeContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  
  challengeSectionTop: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "start",
    marginBottom: 20,
  },
  
  pointsLabel: {
    fontSize: 14,
    color: "#333",
  },
  
  challengeSectionMiddle: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100, // keeps task vertically in place even if short
  },
  
  challengeSectionBottom: {
    flex: 1,
    alignItems: "end",
    alignContent: "space-between",
  },
  
  envelope: {
    marginLeft: 10,
    color: '#111111',  // You can adjust the color as needed
  },
  matchCard: {
    backgroundColor: "#AECBFA",
    paddingHorizontal: 30, // Doubled horizontal padding
    paddingVertical: 25,   // Increased vertical padding
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    height: 200, // 1.5x original height
    borderWidth: 1.5,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  matchHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  matchName: {
    fontSize: 16,
    marginLeft: 10,
  },
  envelope: {
    fontSize: 18,
    marginLeft: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  rematchButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#3367d6",
    borderRadius: 5,
    width: 100, // smaller size
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: "#000",
    marginTop: 10, // added spacing after "No match found"
  },
  rematchText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  challengeTitle: {
    fontSize: 28, // match timer size
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    alignContent: "start",
  },
  challengeCard: {
    flex: 1, // Ensures it fills available space
    alignItems: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderWidth: 1.5,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 90, // Adds spacing below the card
  },
  challengeContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  difficultyLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2, // tight spacing before points
  },
  challengeText: {
    fontSize: 18, // Increased from 16
    textAlign: "center",
    textAlignVertical: "center",
    marginBottom: 10,
  },
  selectButton: {
    backgroundColor: "#DDD",
    borderRadius: 5,
    width: 100, // smaller size
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: "#000",
  },
  selectText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  arrow: {
    fontSize: 32,
    color: "#000",
    paddingHorizontal: 10,
  },
  disabledArrow: {
    color: "#ccc",
  },
});

export default HomeScreen;
