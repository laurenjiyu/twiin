// components/ChallengeSubmissionView.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CustomButton from "./CustomButton";
import { Feather } from "@expo/vector-icons";
import theme from "../theme";
import { useNavigation } from "@react-navigation/native";

const ChallengeSubmissionView = ({ setSubmissionPage, chosenChallenge, currUser, currMatch }) => {

  return (
    <View style={styles.container}>
      <View style={styles.challengeCard}>
        <Text style={styles.title}>TWIINS</Text>
        <Text style={styles.names}>{} & {}</Text>
        <Text style={styles.title}>CHALLENGE</Text>
        <Text style={styles.challengeText}>
          {chosenChallenge}
        </Text>
        <CustomButton
          style={styles.changeButton}
          backgroundColor={theme.colors.red}
          onPress={() => setSubmissionPage(false)}
        >
          <Text style={styles.changeButtonText}>Change Challenge</Text>
        </CustomButton>
      </View>

      <View style={styles.uploadCard}>
        <Text style={styles.uploadHeader}>1. UPLOAD MEDIA</Text>
        <Feather name="image" size={48} color="#000" />
        <Feather name="arrow-right-circle" size={28} color="#000" />
      </View>

      <CustomButton
        color="#000"
        backgroundColor="#FCA968"
        style={styles.submitButton}
      >
        SUBMIT
      </CustomButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  timerText: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  challengeCard: {
    backgroundColor: theme.colors.blue,
    borderRadius: 12,
    borderWidth: 2,
    width: "100%",
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 4 , fontFamily: theme.text.heading},
  names: { fontSize: 16, marginBottom: 12 },
  challengeLabel: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  challengeText: { fontSize: 16, textAlign: "center", marginBottom: 12 },
  changeButton: {
    backgroundColor: "#4D9EEB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeButtonText: { color: "#fff", fontWeight: "bold" },
  uploadCard: {
    backgroundColor: theme.colors.darkGray,
    borderRadius: 12,
    borderWidth: 2,
    width: "100%",
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  submitButton: { width: "100%" },
});

export default ChallengeSubmissionView;