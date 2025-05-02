import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "../components/Button";
import { supabase } from "../db";
import theme from "../theme";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [hobby, setBio] = useState("");
  const [goal, setPic] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.titleContainer]}>
        <Text style={[styles.header]}>Edit Profile</Text>
      </View>
      <View style={styles.backButton}>
        <Button backgroundColor="#f78da7" onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Prompt + Response 1 */}
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>Bio</Text>
        </View>
        <View style={styles.responseCard}>
          <TextInput
            placeholder="Type here..."
            value={hobby}
            onChangeText={setBio}
            style={styles.input}
          />
        </View>

        {/* Prompt + Response 2 */}
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>Upload Profile Pic</Text>
        </View>
        <View style={styles.responseCard}>
          <TextInput
            placeholder="Type here..."
            value={goal}
            onChangeText={setPic}
            style={styles.input}
          />
        </View>
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
    width: "100%", // Full width of the screen
    alignItems: "center",
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 0,
    backgroundColor: theme.colors.yourMatchCard,
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_700Bold", // Apply the loaded font
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
    fontSize: 16,
    fontWeight: "600",
  },
  responseCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    minHeight: 40,
  },
  backButton: {
    position: "absolute", // Allows top/right positioning
    top: 8,
    left: 30,
    width: 50,
    height: 50,
    borderRadius: 8,
    zIndex: 999,
  },
});

export default EditProfileScreen;
