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
  getChallenges,
  getUserMatch,
} from "../db";
import defaultProfile from "../assets/default_profile.jpg";
import CustomButton from "../components/CustomButton";
import ChallengeSubmissionView from "../components/ChallengeSubmissionView";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../components/TopBar";

const difficulties = ["Easy", "Medium", "Hard"];

const difficultyColors = {
  Easy: "#DFFFEF",    // Light green background
  Medium: "#FFF3E0",  // Light orange background
  Hard: "#FFEBEE"     // Light red background
};

const buttonColors = {
  Easy: "#DFFF90",
  Medium: "#FFBD59",
  Hard: "#FF7676"
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState([]);
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

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        console.error("User not authenticated");
        return;
      }

      const user = session.user;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("total_points")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      setUserPoints(userData?.total_points ?? 0);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true);
        const { data: chData, error: chErr } = await getChallenges();
        if (chErr || !chData) {
          console.error("Error fetching challenges", chErr || "No data returned");
          setChallenges([]);
        } else {
          setChallenges(chData);
        }
      } catch (err) {
        console.error("Unexpected error fetching challenges", err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    loadChallenges();
  }, []);

  useEffect(() => {
    const loadMatch = async () => {
      if (!challenges.length) return;
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { match: mData, error: mErr } = await getUserMatch(
        user.id,
        challenges[currentDifficultyIdx].id
      );
      if (mErr) console.error("Error fetching match", mErr);
      else setMatch(mData);
      setLoading(false);
    };
    loadMatch();
  }, [challenges, currentDifficultyIdx]);

  useEffect(() => {
    if (!challenges.length) return;
    const endTime = new Date(challenges[challengeIdx].end_time);
    const updateTimer = () => {
      const now = new Date();
      const distance = endTime - now;
      if (distance <= 0) {
        setTimeLeft({ expired: true });
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [challenges, challengeIdx]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.darkestBlue} />
      </View>
    );
  }

  const currentDifficulty = difficulties[currentDifficultyIdx];
  const currentChallenge = challenges[currentDifficultyIdx];

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
                <Text style={styles.noMatchText}>No match found</Text>
              )}
              <TouchableOpacity style={styles.rematchButton}>
                <Text style={styles.rematchText}>REMATCH</Text>
              </TouchableOpacity>
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
                    <Text style={styles.difficultyLabel}>{currentDifficulty.toUpperCase()}</Text>
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
                      onPress={() => setSubmissionPage(true)}
                    >
                      <Text style={styles.selectText}>SELECT</Text>
                    </TouchableOpacity>
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
    flex: 1,
  },
  timer: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  matchCard: {
    backgroundColor: "#AECBFA",
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    height: 200,
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  challengeCard: {
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
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  challengeSectionMiddle: {
    //flex: 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  challengeSectionBottom: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  difficultyLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  difficultyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#333",
  },
  challengeText: {
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
    marginBottom: 10,
  },
  taskText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
  },
  selectButton: {
    backgroundColor: "#DDD",
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