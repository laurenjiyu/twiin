import React, { useCallback } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import TrophyIcon from "../assets/icons/DefaultTrophy.png";
import { supabase, getUserProfile } from "../db.js";
import theme from "../theme";
import { useFocusEffect } from "@react-navigation/native"; // <-- Add this

const TopBar = ({ groupName = "CS278" }) => {
  const [points, setPoints] = React.useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          console.error("Error fetching session:", sessionError);
          return;
        }

        const currentUser = sessionData.session.user;
        const { user, error } = await getUserProfile(currentUser.id);
        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }
        setPoints(user.total_points);
      };
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.left}>Twiin</Text>
      </View>
      <View style={styles.center}>
        <Image source={TrophyIcon} style={styles.icon} />
        <Text style={styles.points}>{points ?? "--"}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.right}>{groupName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: theme.colors.background, // Assuming you have a background color defined in the theme
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: theme.colors.border, // Use theme color for borders
  },
  leftContainer: {
    width: "40%",
    alignItems: "left", // Align text to the left
    paddingVertical: 2,
    borderWidth: 3,
  },
  center: {
    flexDirection: "row",
    width: "30%",
    alignItems: "center",
    justifyContent: "center", // horizontal alignment
    paddingVertical: 2,
    backgroundColor: "#000000",
    borderTopColor: "#000000",
    borderBottomColor: "#000000",
    borderTopWidth: 3,
    borderBottomWidth: 3,
  },
  rightContainer: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#FFFFFF",
    backgroundColor: "#000000",
    borderTopColor: "#000000",
    borderBottomColor: "#000000",
    borderTopWidth: 3,
    borderBottomWidth: 3,
  },
  left: {
    fontSize: 26, // Updated font size
    fontFamily: "Ojuju_800ExtraBold",
    color: theme.colors.primary, // Updated primary color from theme
    marginLeft: 20,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#FFF",
    marginRight: 10,
    marginTop: 4, // push icon down slightly
  },
  points: {
    fontSize: 26, // Updated font size
    fontFamily: "Ojuju_800ExtraBold",
    color: "#FFFFFF",
  },
  right: {
    fontSize: 26, // Updated font size
    fontFamily: "Ojuju_800ExtraBold",
    color: "#FFFFFF",
  },
});

export default TopBar;
