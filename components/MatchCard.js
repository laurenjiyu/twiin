import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import defaultProfile from "../assets/default_profile.jpg";
import CustomButton from "./CustomButton";
import * as Clipboard from "expo-clipboard";
import theme from "../theme";

const MatchCard = ({ matchInfo, onCopyEmail }) => {
  const handleCopy = async () => {
    if (matchInfo?.email) {
      await Clipboard.setStringAsync(matchInfo.email);
      if (onCopyEmail) onCopyEmail();
    }
  };

  return (
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
          <TouchableOpacity onPress={handleCopy}>
            <Icon name="mail-outline" style={styles.envelope} />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noMatchText}>No match found</Text>
      )}
      <CustomButton
        backgroundColor={theme.colors.darkBlue}
        style={styles.rematchButton}
      >
        REMATCH
      </CustomButton>
    </View>
  );
};

const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchName: {
    fontSize: 25,
    fontFamily: theme.text.body,
    marginLeft: 10,
  },
  envelope: {
    fontSize: 30,
    marginLeft: 10,
    color: "#111111",
  },
  noMatchText: {
    fontSize: 16,
    marginBottom: 10,
  },
  rematchButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: theme.colors.darkBlue,
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
    fontSize: 12,
  },
  cardLabel: {
    fontSize: 24,
    fontFamily: theme.text.heading,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
});

export default MatchCard;
