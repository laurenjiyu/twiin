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
import TimeHeader from "../components/TimeHeader";
import MatchCard from "../components/MatchCard";
import * as Clipboard from "expo-clipboard";
import theme from "../theme";
import {
  supabase,
  getChallengeList,
  getChallengeRound,
  getUserMatch,
  getUserProfile,
  uploadVote,
  confirmSubmission,
  getChallengePeriod,
} from "../db";
import defaultProfile from "../assets/default_profile.jpg";
import CustomButton from "../components/CustomButton";
import ChallengeSubmissionView from "../components/ChallengeSubmissionView";
import ChallengeCompleteView from "../components/ChallengeCompleteView";
import ChallengeCard from "../components/ChallengeCard";
import Timer from "../components/Timer";
import TopBar from "../components/TopBar";
import { useFocusEffect } from "@react-navigation/native";

const difficulties = ["EASY", "MEDIUM", "HARD"];
const points = [100, 200, 300];

const HomeScreen = () => {
  const [challengeRound, setChallengeRound] = useState(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [userInfo, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengesByDifficulty, setChallengesByDifficulty] = useState({});
  const [currentDifficultyIdx, setCurrentDifficultyIdx] = useState(0);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [matchInfo, setMatch] = useState(null);
  const [matchSelectedChallengeId, setMatchSelectedChallengeId] =
    useState(null);

  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSubmissionScreen, setSubmissionPage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [challengeSelected, selectChallenge] = useState(null);

  const copyEmailToClipboard = async () => {
    if (matchInfo?.email) {
      await Clipboard.setStringAsync(matchInfo.email);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // Replace the existing useEffect for loading data with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          console.error("Error fetching session:", sessionError);
          return;
        }

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
          setSelectedChallengeId(currUserData.selected_challenge_id);
        }

        const { data: roundData, error: roundError } = await getChallengeRound(
          1
        ); // round number hardcoded for no
        if (roundError) {
          console.error("Error fetching challenge round:", roundError);
        } else if (roundData) {
          setChallengeRound(roundData[0]);
          console.log("Challenge round data:", roundData);
        }

        const { data: submittedIds, error: submittedError } =
          await confirmSubmission(currentUser.id);
        if (submittedIds && submittedIds.length > 0) {
          console.log("user has already submitted!");
          setSubmitted(true);
        }

        const { match: matchData } = await getUserMatch(currentUser.id, 1);
        if (matchData) {
          setMatch(matchData);
          setMatchSelectedChallengeId(matchData.selected_challenge_id);

          const { data: listData, error: listError } = await getChallengeList(
            1
          );
          if (listError) {
            console.error("Error fetching challenge list:", listError);
          } else {
            const grouped = {
              EASY: {},
              MEDIUM: {},
              HARD: {},
            };

            listData.forEach((challenge) => {
              const diff = challenge.difficulty;
              if (grouped.hasOwnProperty(diff)) {
                grouped[diff] = {
                  full_desc: challenge.full_desc,
                  id: challenge.id,
                  short_desc: challenge.short_desc,
                  point_value: challenge.point_value,
                  challenge_round: challenge.challenge_round,
                };
              }
            });
            setChallengesByDifficulty(grouped);
          }
        }

        setLoading(false);
      };

      loadData();

      // Cleanup function
      return () => {
        console.log("HomeScreen unfocused - cleaning up");
        setLoading(true);
      };
    }, [])
  );

  // Helper function
  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const difference = endTime - now;

    if (difference <= 0) {
      return { expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  };

  useEffect(() => {
    if (!challengeRound?.end_time) return;

    const endTime = new Date(challengeRound.end_time);

    // Initial set
    setTimeLeft(calculateTimeLeft(endTime));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeRound]);

  const currentDifficulty = difficulties[currentDifficultyIdx];
  const currentPoints = points[currentDifficultyIdx];
  const currentChallenge = challengesByDifficulty[currentDifficulty];
  // console.log("name", name);
  // console.log("match avatar_url", match?.avatar_url);
  return (
    <SafeAreaView style={styles.container}>
      <TopBar groupName="CS278" />

      {submitted ? (
        <ChallengeCompleteView
          userInfo={userInfo}
          pointsEarned={300}
          setSubmitted={setSubmitted}
        />
      ) : (
        <>
                        <TimeHeader endTime={challengeRound.end_time} />

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
                chosenChallenge={currentChallenge}
                userInfo={userInfo}
                matchInfo={matchInfo}
                setSubmitted={setSubmitted}
              />
            ) : (
              <>
                <TimeHeader endTime={challengeRound.end_time} />
                <MatchCard
                  matchInfo={matchInfo}
                  onCopyEmail={() => {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
                  }}
                />

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
                      disabled={
                        currentDifficultyIdx === difficulties.length - 1
                      }
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
                      ? "YOU AND YOUR TWIN MUST AGREE!"
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
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
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
    fontSize: 22,
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
