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
} from "react-native";
import theme from "../theme";
import { supabase } from "../db";
import defaultProfile from "../assets/icons/anonymous.png"; //in square format rn
import CustomButton from "../components/Button";
import Icon from "react-native-vector-icons/MaterialIcons";

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
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [profileBio, setProfileBio] = useState("");

  useEffect(() => {
    const fetchAvatar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("avatar_url, profile_bio")
          .eq("id", user.id)
          .single();
        setAvatarUrl(profile?.avatar_url || null);
        setProfileBio(profile?.profile_bio || "");
      }
    };
    fetchAvatar();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.editProfileContainer}>
        <CustomButton
          backgroundColor="#f78da7"
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name="menu" size={24} color="black" />
        </CustomButton>
      </View>

      <View style={[styles.topSection, { height: screenHeight * 0.35 }]}>
        {/* top takes up 0.4 of the screen*/}

        <Text style={styles.username}>{defaultUsername}</Text>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : defaultProfile}
          style={styles.profileImage}
        />
        <Text style={styles.bioText}>
          {profileBio && profileBio.trim().length > 0
            ? profileBio
            : "All praise the first twiin! Huzzah!"}
        </Text>
      </View>
      <View style={[styles.bottomSection]}>
        <View style={[styles.titleContainer]}>
          <Text style={[styles.header]}>Previous Twiins</Text>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {prevTwiins.map((twiin, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.rankRow}>
                <View style={{ flexDirection: "column" }}>
                  <Text style={[styles.twiin]}>{twiin.twiinName}</Text>

                  <Text style={styles.rankText}>
                    {twiin.challengeName} • {twiin.difficulty}
                  </Text>
                </View>

                <View>
                  <Text style={styles.date}>{twiin.date}</Text>
                </View>
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
    backgroundColor: theme.colors.background || "#fff",
  },
  topSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  username: {
    fontSize: 22,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_700Bold", // Apply the loaded font
  },
  profileImage: {
    width: 180,
    height: 180,
    resizeMode: "cover",
    borderRadius: 700,
    marginBottom: 20,
  },
  bioText: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    fontFamily: "SpaceGrotesk_400Regular",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContent: {
    padding: 20,
  },
  prevCard: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  titleContainer: {
    width: "100%", // Full width of the screen
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
  header: {
    fontSize: 22,
    marginTop: 6,
    marginBottom: 6,
    fontFamily: "SpaceGrotesk_700Bold", // Apply the loaded font
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: theme.colors.darkestBlue,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Makes sure rank and username are on the left, and trophy + points go to the right
    width: "100%", // Ensure the row takes full width
  },
  card: {
    //prevMatch card
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
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
    top: 20,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 8,
    zIndex: 999,
  },
});

export default ProfileScreen;
