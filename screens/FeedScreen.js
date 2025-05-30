import React, { useState, useEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import theme from "../theme";
import { supabase } from "../db";
import TopBar from "../components/TopBar";
import EmojiPicker from "../components/EmojiPicker";
import ReactionModal from "../components/ReactionModal";

const FeedScreen = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [reactions, setReactions] = useState({});
  const [otherReactions, setOtherReactions] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const [selectedCardPosition, setSelectedCardPosition] = useState(null);
  const cardRefs = useRef({});
  const [selectedReactionsId, setSelectedReactionsId] = useState(null);
  const [reactionsButtonPosition, setReactionsButtonPosition] = useState(null);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Error fetching session:", sessionError);
        return;
      }
      setCurrentUserId(sessionData.session.user.id);
    };
    fetchUser();
  }, []);

  // Fetch submissions with related data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) return; // Don't fetch if we don't have currentUserId yet

      // Fetch submissions with related data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(
          `
          id,
          submitted_at,
          challenge_id,
          user_id,
          partner_id,
          users!submissions_user_id_fkey (
            name
          ),
          partners:users!submissions_partner_id_fkey (
            name
          ),
          challenge_list (
            difficulty,
            short_desc
          )
        `
        )
        .order("submitted_at", { ascending: false });

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        return;
      }

      setSubmissions(submissionsData);

      // After fetching submissions, fetch reactions for each
      for (const submission of submissionsData) {
        await fetchReactions(submission.id);
      }
    };

    fetchData();
  }, [currentUserId]);

  const fetchReactions = async (submissionId) => {
    try {
      const { data: allReactions, error } = await supabase
        .from("feed_reactions")
        .select(
          `
          emoji_id,
          user_id,
          users (
            name
          )
        `
        )
        .eq("submission_id", submissionId);

      if (error) {
        console.error("Error fetching reactions:", error);
        return;
      }

      // First, find the current user's reaction
      const currentUserReaction = allReactions.find(
        (r) => r.user_id === currentUserId
      );

      // Then, filter out the current user's reaction from other reactions
      const otherUsersReactions = allReactions.filter(
        (r) => r.user_id !== currentUserId
      );

      // Update states separately
      setReactions((prev) => ({
        ...prev,
        [submissionId]: currentUserReaction?.emoji_id || null,
      }));

      setOtherReactions((prev) => ({
        ...prev,
        [submissionId]: otherUsersReactions || [],
      }));
    } catch (error) {
      console.error("Error in fetchReactions:", error);
    }
  };

  const handleEmojiSelect = async (emoji) => {
    try {
      if (!selectedSubmissionId || !currentUserId) return;

      // First check if a reaction already exists
      const { data: existingReaction, error: checkError } = await supabase
        .from("feed_reactions")
        .select("*")
        .eq("submission_id", selectedSubmissionId)
        .eq("user_id", currentUserId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error checking existing reaction:", checkError);
        return;
      }

      let error;
      if (existingReaction) {
        // Update existing reaction
        const { error: updateError } = await supabase
          .from("feed_reactions")
          .update({ emoji_id: emoji })
          .eq("submission_id", selectedSubmissionId)
          .eq("user_id", currentUserId);
        error = updateError;
      } else {
        // Insert new reaction
        const { error: insertError } = await supabase
          .from("feed_reactions")
          .insert({
            submission_id: selectedSubmissionId,
            user_id: currentUserId,
            emoji_id: emoji,
          });
        error = insertError;
      }

      if (error) {
        console.error("Error saving reaction:", error);
        return;
      }

      // Update local state
      setReactions((prev) => ({
        ...prev,
        [selectedSubmissionId]: emoji,
      }));

      // After successful update, refresh reactions
      await fetchReactions(selectedSubmissionId);
    } catch (error) {
      console.error("Error in handleEmojiSelect:", error);
    }
  };

  // Add this useEffect after your other useEffects
  useEffect(() => {
    const fetchProfileImages = async () => {
      // Get all unique user IDs from otherReactions
      const uniqueUserIds = Object.values(otherReactions)
        .flat()
        .map((reaction) => reaction.user_id);

      // Fetch avatars for each unique user
      for (const userId of uniqueUserIds) {
        try {
          const { data: files, error: listError } = await supabase.storage
            .from("avatars")
            .list();

          if (listError) {
            console.log("Error listing avatars:", listError);
            continue;
          }

          const userAvatars = files
            .filter((file) => file.name.startsWith(`${userId}_`))
            .sort((a, b) => b.name.localeCompare(a.name));

          if (userAvatars.length === 0) {
            console.log("No avatar found for user:", userId);
            continue;
          }

          const { data, error: downloadError } = await supabase.storage
            .from("avatars")
            .download(userAvatars[0].name);

          if (downloadError) {
            console.log("Error downloading avatar image:", downloadError);
            continue;
          }

          const reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = () => {
            setProfileImages((prev) => ({
              ...prev,
              [userId]: reader.result,
            }));
          };
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }
    };

    fetchProfileImages();
  }, [otherReactions]); // Only re-run when otherReactions changes

  const OtherReactions = ({ submissionId }) => {
    const reactions = otherReactions[submissionId] || [];
    const buttonRef = React.useRef(null); // Initialize the ref properly

    // Get unique emojis (up to 3)
    const uniqueEmojis = [...new Set(reactions.map((r) => r.emoji_id))].slice(
      0,
      3
    );

    // Get the first user's name and count of other users
    const firstUserName = reactions[0]?.users?.name || "";
    const otherUsersCount = reactions.length - 1;

    return (
      <View style={styles.otherReactionsContainer}>
        {reactions.length > 0 && (
          <TouchableOpacity
            style={styles.reactionsButton}
            onPress={() => {
              // Measure the button position
              buttonRef.current?.measure(
                (x, y, width, height, pageX, pageY) => {
                  setReactionsButtonPosition({
                    x: pageX,
                    y: pageY,
                    width,
                    height,
                  });
                  setSelectedReactionsId(submissionId);
                }
              );
            }}
            ref={buttonRef}
          >
            <View style={styles.reactionsButtonContent}>
              <View style={styles.emojisContainer}>
                {uniqueEmojis.map((emoji, index) => (
                  <Text key={index} style={styles.reactionEmoji}>
                    {emoji}
                  </Text>
                ))}
              </View>
              <View style={styles.reactionsTextContainer}>
                <Text style={styles.reactionsText}>
                  by {firstUserName}
                  {otherUsersCount > 0 ? ` and ${otherUsersCount} others` : ""}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar groupName="CS278" points={0} />

      <View style={styles.blueHeader}>
        <Text style={styles.blueHeaderText}>GROUP FEED</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {submissions.map((submission) => (
          <View
            key={submission.id}
            style={styles.card}
            ref={(ref) => (cardRefs.current[submission.id] = ref)}
          >
            <View style={styles.submissionContent}>
              {/* Your full card content here */}
              <View style={styles.mainContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.names}>
                    {submission.users.name} & {submission.partners.name}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.descriptionRow}>
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                      {submission.challenge_list.short_desc} |{" "}
                      {submission.challenge_list.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* This stays inside the card, but absolutely positioned to break out */}
            <View style={styles.allReactionsContainer}>
              <TouchableOpacity
                style={styles.currentUserReactionContainer}
                onPress={() => {
                  // Measure the position of the card
                  cardRefs.current[submission.id].measure(
                    (x, y, width, height, pageX, pageY) => {
                      setSelectedCardPosition({
                        x: pageX,
                        y: pageY + height, // Position it below the card
                      });
                      setSelectedSubmissionId(submission.id);
                      setShowEmojiPicker(true);
                    }
                  );
                }}
              >
                <Text style={styles.currentUserReactionEmoji}>
                  {reactions[submission.id] || "😊"}
                </Text>
              </TouchableOpacity>
              <OtherReactions submissionId={submission.id} />
            </View>
          </View>
        ))}
      </ScrollView>

      {selectedReactionsId && reactionsButtonPosition && (
        <View
          style={[
            styles.allReactionsBox,
            {
              position: "absolute",
              top:
                reactionsButtonPosition.y + reactionsButtonPosition.height + 8,
              right: 20,
            },
          ]}
        >
          {/* This will be implemented later */}
        </View>
      )}

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
        position={selectedCardPosition}
      />

      <ReactionModal
        visible={!!selectedReactionsId}
        reactions={otherReactions[selectedReactionsId] || []}
        onClose={() => setSelectedReactionsId(null)}
        getProfileImage={(userId) => profileImages[userId]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F2",
  },
  blueHeader: {
    width: "100%",
    backgroundColor: theme.colors.darkestBlue,
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
    marginBottom: 35,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submissionContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mainContent: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    width: "100%",
  },
  names: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  date: {
    fontSize: 16,
    color: "#666",
    fontFamily: "SpaceGrotesk_400Regular",
  },
  description: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    marginBottom: 10,
    textAlign: "left",
  },
  allReactionsContainer: {
    position: "absolute",
    right: 0, // Align to the ScrollView's right edge
    top: 65, // Adjust to align vertically with the card
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 12,
    padding: 4,
  },
  currentUserReactionContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 2,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.darkestBlue,
  },
  currentUserReactionEmoji: {
    fontSize: 24,
  },
  reactionContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 4,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.darkestBlue,
  },
  reactionWithName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    //paddingHorizontal: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionName: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#666",
  },
  otherReactionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 1,
  },
  reactionsButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 8,
    borderWidth: 0.5,
    borderColor: theme.colors.darkestBlue,
  },
  reactionsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emojisContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reactionsTextContainer: {
    marginLeft: 2,
  },
  reactionsText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#666",
  },
  allReactionsBox: {
    width: 200,
    height: 150,
    backgroundColor: "white",
    zIndex: 1000,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderProfilePic: {
    backgroundColor: "#ddd",
  },
  reactionsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  reactionsModalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  reactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reactionsTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  reactionsTabs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reactionsTab: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  reactionsTabSelected: {
    backgroundColor: "#007AFF",
  },
  reactionsTabText: {
    color: "#333",
    fontWeight: "bold",
  },
  reactionsTabTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  reactionsList: {
    maxHeight: 300, // About 6 rows, then scroll
  },
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reactionEmojiCol: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FeedScreen;
