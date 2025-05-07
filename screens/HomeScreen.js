import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import theme from "../theme";
import {
  supabase,
  getChallengeList,
  getChallengePeriod,
  getUserMatch
} from "../db";
import defaultProfile from "../assets/default_profile.jpg";
import CustomButton from "../components/CustomButton";
import ChallengeSubmissionView from "../components/ChallengeSubmissionView";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../components/TopBar";

const difficulties = ["EASY", "MEDIUM", "HARD"];

const difficultyColors = {
  EASY: "#C0F5E4",    // Light green background
  MEDIUM: "#FFBF91",  // Light orange background
  HARD: "#FDB4BD"     // Light red background
};

const buttonColors = {
  EASY: "#D3FF8C",
  MEDIUM: "#FF9650",
  HARD: "#FF8A8A"
};

const HomeScreen = () => {
  const [challengePeriod, setChallengePeriod] = useState(null);
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState([]);
  const [challengesByDifficulty, setChallengesByDifficulty] = useState({});
  const [currentDifficultyIdx, setCurrentDifficultyIdx] = useState(0);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSubmissionScreen, setSubmissionPage] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showToast, setShowToast] = useState(false);

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
        const { match: matchData } = await getUserMatch(currentUser.id, periodData[0].id);
        if (matchData) {
          setMatch(matchData);
        }
      }
    };
    loadData();
  }, []);

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
    <SafeAreaView style={styles.container}>
      <TopBar groupName="CS278" points={userPoints} />

      <Text style={styles.timer}>
        ⏳{timeLeft.expired ? "00:00" : `${String(timeLeft.days)}d ${String(timeLeft.hours)}h ${String(timeLeft.minutes)}m ${String(timeLeft.seconds)}s`}
      </Text>

      <View style={styles.body}>
        {showSubmissionScreen ? (
          <ChallengeSubmissionView
            submissionPage={showSubmissionScreen}
            setSubmissionPage={setSubmissionPage}
            chosenChallenge={currentChallenge?.name || ""}
          />
        ) : (
          <>
            <View style={styles.matchCard}>
              <Text style={styles.cardLabel}>YOUR TWIIN</Text>
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
                <Text style={styles.noMatchText}>No match found</Text>
              )}
              <CustomButton backgroundColor={theme.colors.darkBlue} style={styles.rematchButton}>
                REMATCH
              </CustomButton>
            </View>

            <Text style={styles.challengeTitle}>CHALLENGE DECK</Text>
            
            <View style={[styles.challengeCard, { backgroundColor: difficultyColors[currentDifficulty] }]}>
              <View style={styles.challengeRow}>
                <TouchableOpacity
                  onPress={() => setCurrentDifficultyIdx(i => Math.max(i - 1, 0))}
                  disabled={currentDifficultyIdx === 0}
                >
                  <Text style={[styles.arrow, currentDifficultyIdx === 0 && styles.disabledArrow]}>{'<'}</Text>
                </TouchableOpacity>

                <View style={styles.challengeContent}>
                  <View style={styles.challengeSectionTop}>
                    <Text style={styles.cardLabel}>{currentDifficulty.toUpperCase()}</Text>
                    <Text style={styles.pointsLabel}>+100</Text>
                  </View>

                  <View style={styles.challengeSectionMiddle}>
                    <Text style={styles.challengeText}>
                      {currentChallenge ? currentChallenge.full_desc : "No challenge"}
                    </Text>
                  </View>

                  <View style={styles.challengeSectionBottom}>
                    <CustomButton
                      backgroundColor={buttonColors[currentDifficulty]}
                      onPress={() => {
                        setSubmissionPage(true);}}>SELECT
                    </CustomButton>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setCurrentDifficultyIdx(i => Math.min(i + 1, difficulties.length - 1))}
                  disabled={currentDifficultyIdx === difficulties.length - 1}
                >
                  <Text style={[styles.arrow, currentDifficultyIdx === difficulties.length - 1 && styles.disabledArrow]}>{'>'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showToast && (
              <View style={styles.toastContainer}>
                <Text style={styles.toastText}>Email copied!</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    margin: 20,
  },
  timer: {
    fontSize: 28,
    fontFamily: theme.text.title_bold,
    fontWeight: "bold",
    textAlign: "center",
    margin: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  matchCard: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    height: 200,
    borderWidth: 1.5,
    borderColor: "#000",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  matchName: {
    fontSize: 16,
    marginLeft: 10,
  },
  envelope: {
    marginLeft: 10,
    color: "#111111",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noMatchText: {
    fontSize: 16,
    marginBottom: 10,
  },
  rematchButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#3367d6",
    borderRadius: 5,
    width: 100,
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
    marginTop: 10,
  },
  rematchText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  spacer: {
    height: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  challengeTitle: {
    fontFamily: theme.text.heading,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  challengeCard: {
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderWidth: 1.5,
    borderColor: "#000",
    elevation: 5,
    marginBottom: 40,
    backgroundColor: "#fff", 
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
    marginBottom: 2,
  },
  difficultyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pointsLabel: {
    fontSize: 14,
    color: "black",
  },
  taskText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
  },
  selectText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  arrow: {
    fontSize: 32,
    color: "#000",
    paddingHorizontal: 5,
  },
  disabledArrow: {
    color: "#ccc",
  },
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  toastText: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
  },
});

export default HomeScreen;