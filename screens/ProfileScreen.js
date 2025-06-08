import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import theme from "../theme";
import { supabase, getAvatarUrl } from "../db";
import defaultProfile from "../assets/icons/anonymous.png"; //in square format rn
import CustomButton from "../components/CustomButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import TopBar from "../components/TopBar";
import { useFocusEffect } from "@react-navigation/native";

const defaultUsername = "First Twiin";

const ProfileScreen = ({ navigation }) => {
  const screenHeight = Dimensions.get("window").height;
  const [profileBio, setProfileBio] = useState("");
  const [username, setUsername] = useState(defaultUsername);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setAvatarBase64(null);

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
        .select("name, profile_bio, total_points, avatar_name")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      setUserPoints(userData?.total_points ?? 0);
      setUsername(userData?.name || defaultUsername);
      setProfileBio(userData?.profile_bio || "");

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
      console.error("Error in fetchProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setIsLoadingSubmissions(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("User not authenticated");
        return;
      }

      const userId = session.user.id;

      // Fetch submissions where user is either user_id or partner_id
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(
          `
          id,
          submitted_at,
          user_id,
          partner_id,
          challenge_id,
          users!submissions_user_id_fkey (
            name
          ),
          partners:users!submissions_partner_id_fkey (
            name
          ),
          challenge_list (
            short_desc,
            difficulty
          )
        `
        )
        .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
        .order("submitted_at", { ascending: false });

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        return;
      }

      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error in fetchSubmissions:", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Use useFocusEffect with cleanup
  useFocusEffect(
    React.useCallback(() => {
      console.log("ProfileScreen focused - fetching profile data");
      fetchProfile();
      fetchSubmissions();

      // Cleanup function
      return () => {
        console.log("ProfileScreen unfocused - cleaning up");
        setAvatarBase64(null);
        setIsLoading(true);
        setSubmissions([]);
      };
    }, [])
  );

  // Helper function to get the other user's name
  const getOtherUserName = async (submission) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session.user.id;

    return submission.user_id === userId
      ? submission.partners.name
      : submission.users.name;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar groupName="CS278" points={userPoints} />

      <View style={styles.editProfileContainer}>
        <CustomButton
          backgroundColor={theme.colors.darkBlue}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name="settings" size={26} color="black" />
        </CustomButton>
      </View>

      <View style={[styles.topSection, { height: screenHeight * 0.35 }]}>
        {/* top takes up 0.4 of the screen*/}

        <Text style={styles.profileName}>{username}</Text>

        <View style={styles.avatarContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.darkBlue} />
          ) : (
            <Image
              source={avatarBase64 ? { uri: avatarBase64 } : defaultProfile}
              style={styles.profileImage}
              key={avatarBase64} // Add key to force re-render when avatar changes
            />
          )}
        </View>
        <Text style={styles.bioText}>
          {profileBio && profileBio.trim().length > 0
            ? profileBio
            : "All praise the first twiin! Huzzah!"}
        </Text>
      </View>
      <View style={[styles.bottomSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>YOUR TWIINS</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {isLoadingSubmissions ? (
            <ActivityIndicator size="large" color={theme.colors.darkBlue} />
          ) : (
            submissions.map((submission) => (
              <View key={submission.id} style={styles.twiinCard}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <View>
                    <Text style={styles.twiinName}>
                      {getOtherUserName(submission)}
                    </Text>
                    <Text style={styles.twiinDetails}>
                      {submission.challenge_list.short_desc} |{" "}
                      {submission.challenge_list.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.twiinDate}>
                    {(() => {
                      const submitted = new Date(submission.submitted_at);
                      const maxDate = new Date("2025-06-05T23:59:59");
                      const displayDate =
                        submitted > maxDate ? maxDate : submitted;
                      return displayDate.toLocaleDateString();
                    })()}{" "}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  topSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  profileName: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 180,
    borderWidth: 2,
    borderColor: theme.colors.yourMatchCard,
    backgroundColor: "#fff",
  },
  bioText: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    fontFamily: "SpaceGrotesk_400Regular",
    marginBottom: 16,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 0,
    alignItems: "center",
  },
  prevCard: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  titleContainer: {
    width: "95%", // Full width of the screen
    alignItems: "center",
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 0,
    backgroundColor: theme.colors.blue,
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Makes sure rank and username are on the left, and trophy + points go to the right
    width: "100%", // Ensure the row takes full width
  },
  card: {
    //prevMatch card
    width: "95%",
    backgroundColor: "#FAFAF7",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d6d6d6",
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  date: {
    fontSize: 16,
    //color: "#666",
    fontFamily: "SpaceGrotesk_400Regular",
  },
  rankText: {
    fontSize: 16,
    //color: "#666",
    fontFamily: "SpaceGrotesk_400Regular",
  },
  twiin: {
    fontWeight: "bold",
    fontSize: 20,
    //color: "#666",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  editProfileContainer: {
    position: "absolute", // Allows top/right positioning
    top: 120,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 8,
    zIndex: 999,
  },
  sectionHeader: {
    borderTopWidth: 3,
    height: 60,
    borderBottomWidth: 4,
    borderColor: "#000",
    width: "100%",
    backgroundColor: theme.colors.darkBlue,
    paddingVertical: 10,
    alignItems: "center",
  },
  sectionHeaderText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily: "SpaceGrotesk_700Bold",
    marginTop: 2,
  },
  twiinCard: {
    width: "98%",
    backgroundColor: "#FAFAF7",
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  twiinName: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_700Bold",
    marginBottom: 2,
  },
  twiinDetails: {
    fontSize: 16,
    color: "#222",
    fontFamily: "SpaceGrotesk_400Regular",
  },
  twiinDate: {
    fontSize: 18,
    color: "#222",
    textAlign: "right",
    alignSelf: "flex-start",
    fontFamily: "SpaceGrotesk_400Regular",
  },
});

export default ProfileScreen;
