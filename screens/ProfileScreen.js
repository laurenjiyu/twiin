import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
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
import Button from "../components/Button";
import Icon from "react-native-vector-icons/MaterialIcons";
import TopBar from "../components/TopBar";

//Data of previous matches (sample data)
const prevTwiins = [
  {
    challengeName: "Teacher Selfie",
    difficulty: "Easy",
    twiinName: "Daenerys T.",
    date: "04/15/2025",
  },
  {
    challengeName: "Campus Tour",
    difficulty: "Medium",
    twiinName: "Jon S.",
    date: "04/20/2025",
  },
  {
    challengeName: "SF Trip",
    difficulty: "Hard",
    twiinName: "Tyrion L.",
    date: "04/22/2025",
  },
];

const defaultUsername = "First Twiin";

const ProfileScreen = ({ navigation }) => {
  const screenHeight = Dimensions.get("window").height;
  const [profileBio, setProfileBio] = useState("");
  const [username, setUsername] = useState(defaultUsername);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

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
        .select("name, profile_bio", "total_points")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }
      setUserPoints(userData?.total_points ?? 0); //set for topbar

      setUsername(userData?.name || defaultUsername);
      setProfileBio(userData?.profile_bio || "");
      // Construct the correct path for the avatar
      const avatarPath = `avatars/${user.id}.jpg`;

      // Try downloading the avatar
      const { data, error: downloadError } = await supabase.storage
        .from("avatars")
        .download(avatarPath);

      if (downloadError) {
        console.log("Error downloading avatar image:", downloadError);
        console.log("Switch to defualt profile");
        return;
      }

      // Convert the file to base64
      const reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };

      if (bioError) {
        console.error("Error fetching bio:", bioError);
      } else {
        setProfileBio(profile?.profile_bio || "");
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <TopBar groupName="CS278" points={userPoints} />

      <View style={styles.editProfileContainer}>
        <Button
          backgroundColor={theme.colors.rematchButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name="settings" size={26} color="black" />
        </Button>
      </View>

      <View style={[styles.topSection, { height: screenHeight * 0.35 }]}>
        {/* top takes up 0.4 of the screen*/}

        <Text style={styles.profileName}>{username}</Text>

        <View style={styles.avatarContainer}>
          <Image
            source={avatarBase64 ? { uri: avatarBase64 } : defaultProfile}
            style={styles.profileImage}
          />
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
          {prevTwiins.map((twiin, index) => (
            <View key={index} style={styles.twiinCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <View>
                  <Text style={styles.twiinName}>{twiin.twiinName}</Text>
                  <Text style={styles.twiinDetails}>
                    {twiin.challengeName} | {twiin.difficulty}
                  </Text>
                </View>
                <Text style={styles.twiinDate}>{twiin.date}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
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
    borderWidth: 3,
    borderColor: theme.colors.background, // or your theme's dark color
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
    backgroundColor: "#f0f0f0",
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
    backgroundColor: theme.colors.yourMatchCard,
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    marginTop: 6,
    marginBottom: 6,
    fontFamily: "SpaceGrotesk_700Bold", // Apply the loaded font
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: theme.colors.leaderboard,
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
    top: 60,
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
    backgroundColor: theme.colors.rematchButton,
    paddingVertical: 10,
    alignItems: "center",
  },
  sectionHeaderText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily: "SpaceGrotesk_700Bold",
    marginTop: 5,
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
