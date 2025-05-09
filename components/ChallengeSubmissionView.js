import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import CustomButton from "./CustomButton";
import { Feather } from "@expo/vector-icons";
import theme from "../theme";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../db"; // make sure this helper is defined
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base-64";

const ChallengeSubmissionView = ({
  setSubmissionPage,
  chosenChallenge,
  userInfo,
  matchInfo,
  setSubmitted,
  addPoints,
}) => {
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePickMedia = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow access to media library."
        );
        return;
      }
      //get the image from the bucket*******
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled || !result.assets || !result.assets.length) return;

      setMedia(result.assets[0]);
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Could not select a media file.");
    }
  };

  const handleSave = async () => {
    try {
      if (!media) {
        Alert.alert("No media", "Please upload a media file first.");
        return;
      }

      setUploading(true);

      // Get current session and user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session?.user)
        throw new Error("User not authenticated");
      const user = session.user;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(media.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create unique filename with timestamp and both users' IDs
      const timestamp = Date.now();
      const uniqueFileName = `${user.id}_${matchInfo.id}_${chosenChallenge.id}_${timestamp}.jpg`;
      const contentType = media.mimeType || "image/jpeg";

      // Ensure content type is valid
      if (!contentType.startsWith("image/")) {
        throw new Error("Invalid image type.");
      }

      // Decode base64 to binary
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        //base64 to bytes
        bytes[i] = binary.charCodeAt(i);
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(uniqueFileName, bytes, { contentType, upsert: true });

      if (uploadError) throw uploadError;

      // Insert row into 'submissions' table
      const { error: insertError } = await supabase.from("submissions").insert({
        challenge_id: chosenChallenge.id,
        user_id: user.id,
        payload: uniqueFileName,
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      Alert.alert("Success", "Your submission has been saved!");
      setSubmissionPage(false); // go back to previous screen
    } catch (err) {
      console.error("Submission failed:", err);
      Alert.alert("Submission Failed", err.message || "Please try again.");
    } finally {
      //addPoints(userInfo.id, chosenChallenge.points);
      setSubmitted(true);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.challengeCard}>
        <Text style={styles.title}>TWIINS</Text>
        <Text style={styles.names}>
          {userInfo.name} & {matchInfo.name}
        </Text>
        <Text style={styles.title}>CHALLENGE</Text>
        <Text style={styles.challengeText}>{chosenChallenge.full_desc}</Text>
        <CustomButton
          style={styles.changeButton}
          backgroundColor={theme.colors.red}
          onPress={() => setSubmissionPage(false)}
        >
          <Text style={styles.changeButtonText}>Change Challenge</Text>
        </CustomButton>
      </View>

      <View style={styles.uploadCard}>
        <Text style={styles.uploadHeader}>UPLOAD MEDIA HERE</Text>
        <View style={styles.imageSection}>
          {uploading && <ActivityIndicator size="small" color="#000" />}
          {media && (
            <Image source={{ uri: media.uri }} style={styles.previewImage} />
          )}
          <TouchableOpacity
            style={styles.uploadMediaButton}
            onPress={handlePickMedia}
          >
            <Feather name="image" size={48} color="#000" />
            <Feather name="arrow-up-circle" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <CustomButton
        color="#000"
        backgroundColor="#FCA968"
        style={styles.submitButton}
        onPress={handleSave}
      >
        SUBMIT
      </CustomButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  challengeCard: {
    backgroundColor: theme.colors.blue,
    borderRadius: 12,
    borderWidth: 2,
    width: "100%",
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: theme.text.heading,
  },
  names: { fontSize: 16, marginBottom: 12 },
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
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  uploadMediaButton: {
    alignItems: "center",
    padding: 10,
  },
  previewImage: {
    width: 200,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
  },
  imageSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: { width: "100%" },
});

export default ChallengeSubmissionView;
