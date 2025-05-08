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
  getChallengeRound,
  getUserMatch,
  getUserProfile,
  uploadVote,
} from "../db";
import defaultProfile from "../assets/default_profile.jpg";
import CustomButton from "../components/CustomButton";
import ChallengeSubmissionView from "../components/ChallengeSubmissionView";
import ChallengeCard from "../components/ChallengeCard";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../components/TopBar";

const difficulties = ["EASY", "MEDIUM", "HARD"];

const HomeScreen = () => {
  const [challengeRound, setChallengeRound] = useState(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [userInfo, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengesByDifficulty, setChallengesByDifficulty] = useState({});
  const [currentDifficultyIdx, setCurrentDifficultyIdx] = useState(0);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const [matchInfo, setMatch] = useState(null);
  const [matchSelectedChallengeId, setMatchSelectedChallengeId] =
    useState(null);

  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSubmissionScreen, setSubmissionPage] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [challengeSelected, selectChallenge] = useState(null);

  const copyEmailToClipboard = async () => {
    if (matchInfo?.email) {
      await Clipboard.setStringAsync(matchInfo.email);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  //fetch user info
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Set up session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("Error fetching session:", sessionError);
        return;
      } else {
        console.log("retrieved session data");
      }

      // Get current user data
      const currentUser = sessionData.session.user;

      const { user: currUserData, error: userError } = await getUserProfile(
        currentUser.id
      );
      if (userError) {
        console.error("Error fetching user data:", userError);
      }
      if (currUserData) {
        setCurrentUser(currUserData);
        setCurrentUserId(currUserData.id);
        setUserPoints(currUserData.total_points);
        setSelectedChallengeId(currUserData.selected_challenge_id);
      }

      const { match: matchData } = await getUserMatch(currentUser.id, 3);
      if (matchData) {
        setMatch(matchData);
        setMatchSelectedChallengeId(matchData.selected_challenge_id);
        // Get the list of challenges
        const { data: listData, error: listError } = await getChallengeList(3);

        if (listError) {
          console.error("Error fetching challenge list:", listError);
        } else {
          const grouped = {
            EASY: {},
            MEDIUM: {},
            HARD: {},
          };

          // Create dictionary of dictionaries with the challenge data per difficulty level
          listData.forEach((challenge) => {
            const diff = challenge.difficulty;
            if (grouped.hasOwnProperty(diff)) {
              grouped[diff] = {
                full_desc: challenge.full_desc,
                id: challenge.id,
                short_desc: challenge.short_desc,
                point_value: challenge.point_value,
              };
            }
          });
          setChallengesByDifficulty(grouped);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!challengeRound) return;

    const endTime = new Date(challengeRound.end_time);
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
  }, [challengeRound]);

  const currentDifficulty = difficulties[currentDifficultyIdx];
  const currentChallenge = challengesByDifficulty[currentDifficulty];

  return (
    <SafeAreaView style={styles.container}>
      <TopBar groupName="CS278" points={userPoints} />

      <Text style={styles.timer}>
        ⏳
        {timeLeft.expired
          ? "00:00"
          : `${timeLeft.days ? `${timeLeft.days}` : "0"}d ${
              timeLeft.hours ? `${timeLeft.hours}` : "0"
            }h ${timeLeft.minutes ? `${timeLeft.minutes}` : "0"}m ${
              timeLeft.seconds ? `${timeLeft.seconds}` : "0"
            }s`.trim()}
      </Text>

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#000"
            style={{ marginTop: 50 }}
          />
        ) : showSubmissionScreen ? (
          <ChallengeSubmissionView
            setSubmissionPage={setSubmissionPage}
            chosenChallenge={currentChallenge?.name || ""}
            currUser={currentChallenge?.id || ""}
            currTwiin={currentChallenge?.full_desc || ""}
          />
        ) : (
          <>
            <View style={styles.matchCard}>
              <Text style={styles.cardLabel}>YOUR TWIIN</Text>
              {matchInfo ? (
                <View style={styles.matchRow}>
                  <Image
                    source={
                      matchInfo.avatar_url
                        ? { uri: matchInfo.avatar_url }
                        : defaultProfile
                    }
                    style={styles.avatar}
                  />
                  <Text style={styles.matchName}>{matchInfo.name}</Text>
                  <TouchableOpacity onPress={copyEmailToClipboard}>
                    <Icon
                      name="mail-outline"
                      size={24}
                      style={styles.envelope}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.noMatchText}>No match found</Text>
              )}
              <CustomButton
                backgroundColor={theme.colors.darkBlue}
                style={styles.rematchButton}
                disabled={true}
              >
                REMATCH
              </CustomButton>
            </View>

            <Text style={styles.challengeTitle}>CHALLENGE DECK</Text>
            {/*difficulty, challenge, voteButtonDisabled,*/}
            <View style={styles.challengeCardContainer}>
              <View style={styles.overlapArrows}>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentDifficultyIdx((i) => Math.max(i - 1, 0))
                  }
                  disabled={currentDifficultyIdx === 0}
                >
                  <Text
                    style={[
                      styles.arrow,
                      currentDifficultyIdx === 0 && styles.disabledArrow,
                    ]}
                  >
                    {"<"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setCurrentDifficultyIdx((i) =>
                      Math.min(i + 1, difficulties.length - 1)
                    )
                  }
                  disabled={currentDifficultyIdx === difficulties.length - 1}
                >
                  <Text
                    style={[
                      styles.arrow,
                      currentDifficultyIdx === difficulties.length - 1 &&
                        styles.disabledArrow,
                    ]}
                  >
                    {">"}
                  </Text>
                </TouchableOpacity>
              </View>

              <ChallengeCard
                userInfo={userInfo}
                twiinInfo={matchInfo}
                difficulty={currentDifficulty}
                challengeInfo={currentChallenge}
                currSelectedId={selectedChallengeId}
                voteForChallenge={setSelectedChallengeId}
              />
            </View>
            <View style={styles.buttonWrapper}>

            
            <CustomButton
              backgroundColor={theme.colors.green}
              onPress={() => {
                setSubmissionPage(true);
              }}
              style={styles.proceedButton}
              disabled={selectedChallengeId !== matchSelectedChallengeId}
            >
              {selectedChallengeId !== matchSelectedChallengeId
                ? "YOU MUST AGREE WITH YOUR TWIIN!"
                : "PROCEED"}
            </CustomButton>
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
  body: {
    margin: 20,
    paddingBottom: 100,
  },
  timer: {
    fontSize: 30,
    fontFamily: theme.text.title_bold,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 30,
    fontFamily: theme.text.heading,
    textAlign: "center",
  },
  matchCard: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 25,
    fontFamily: theme.text.body,
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
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: "#000",
    elevation: 5,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    paddingHorizontal: 20,
  },
  challengeSectionTop: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  challengeSectionMiddle: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
    maxHeight: 150,
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
  buttonWrapper: {
    maxWidth: "80%",
    alignSelf: "center",
  },
  challengeCardContainer: {
    position: "relative",
    marginBottom: 10,
  },

  overlapArrows: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  arrow: {
    fontSize: 40,
    color: "#000",
  },

  disabledArrow: {
    color: "#aaa",
  },
});

export default HomeScreen;
