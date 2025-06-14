import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { supabase, getAvatarUrl, setAvatar } from "../db";
import theme from "../theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentAvatarName, setCurrentAvatarName] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log("EditProfileScreen: user.id =", user.id); // <-- Add this line
        const { data: profile } = await supabase
          .from("users")
          .select("profile_bio, avatar_url")
          .eq("id", user.id)
          .single();
        setBio(profile?.profile_bio || "");
        setCurrentAvatarName(profile?.avatar_name);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload a profile picture.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to access camera roll. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("User not authenticated");
      const user = session.user;
      if (!user) throw new Error("User not found");

      // Handle avatar upload if a new image is selected
      if (profileImage) {
        // Get the file extension and MIME type
        const extension = profileImage.uri.split(".").pop();
        let mimeType = "image/png"; // default MIME type

        if (extension === "jpg" || extension === "jpeg") {
          mimeType = "image/jpeg";
        } else if (extension === "png") {
          mimeType = "image/png";
        }

        // Construct the file-like object
        const avatarFile = {
          uri: profileImage.uri,
          type: mimeType,
          name: `avatar.${extension}`,
        };

        const { avatarName, error } = await setAvatar(user.id, avatarFile);
        if (error) throw error;
        setCurrentAvatarName(avatarName);
      }

      // Update bio
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_bio: bio, avatar_name: currentAvatarName })
        .eq("id", user.id);

      if (updateError) throw updateError;

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.header}>Edit Profile</Text>
      </View>
      <View style={styles.backButton}>
        <CustomButton
          backgroundColor={theme.colors.blue}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="black" />
        </CustomButton>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Bio Section */}
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>Bio</Text>
        </View>
        <View style={styles.responseCard}>
          <TextInput
            placeholder="Type here..."
            value={bio}
            onChangeText={setBio}
            style={styles.input}
            multiline
          />
        </View>
        {/* Profile Picture Section */}
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>Upload Profile Pic</Text>
        </View>
        <View style={styles.responseCard}>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={pickImage}
            disabled={uploading}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage.uri }}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Icon name="add-a-photo" size={24} color="black" />
                <Text style={styles.uploadText}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <CustomButton
          onPress={handleSave}
          backgroundColor={theme.colors.darkOrange}
          disabled={uploading}
        >
          {uploading ? "Saving..." : "Save Changes"}
        </CustomButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 100,
    backgroundColor: theme.colors.background,
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 0,
    backgroundColor: theme.colors.darkBlue,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  scrollContainer: {
    padding: 20,
  },
  promptCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  promptText: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  responseCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  input: {
    fontSize: 16,
    minHeight: 40,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  imageUploadButton: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 10,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "SpaceGrotesk_400Regular",
  },
  backButton: {
    position: "absolute",
    top: 8,
    left: 30,
    width: 50,
    height: 50,
    borderRadius: 8,
    zIndex: 999,
  },
});

export default EditProfileScreen;
