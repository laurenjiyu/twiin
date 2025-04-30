import { useState } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Theme from "../assets/theme";
import db from "../database/db";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const isFormInvalid = loading || email.length === 0 || password.length === 0;

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      const { error } = await db.auth.signInWithPassword({
        email,
        password,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        Alert.alert("Login failed", error.message);
      } else {
        navigation.replace("Main");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Unexpected error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    try {
      const { error } = await db.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Signup failed", error.message);
      } else {
        Alert.alert("Success", "Account created! Please check your email.");
        setCreatingAccount(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Unexpected error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.splashText}>Twiin</Text>

      <TextInput
        onChangeText={setEmail}
        value={email}
        placeholder="email@address.com"
        placeholderTextColor={Theme.colors.textSecondary}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        onChangeText={setPassword}
        value={password}
        placeholder="Password"
        placeholderTextColor={Theme.colors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={creatingAccount ? signUpWithEmail : signInWithEmail}
          disabled={isFormInvalid}
        >
          <Text
            style={[
              styles.button,
              isFormInvalid ? styles.buttonDisabled : undefined,
            ]}
          >
            {loading
              ? creatingAccount
                ? "Creating account..."
                : "Signing in..."
              : creatingAccount
              ? "Create account"
              : "Sign in"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividingLine}>
        <View style={styles.line} />
        <Text style={{ marginHorizontal: 10 }}>Or</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => setCreatingAccount(!creatingAccount)}>
          <Text style={styles.buttonAlt}>
            {creatingAccount
              ? "Back to Login"
              : "Don't have an account? Create one"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Theme.colors.backgroundPrimary,
    flex: 1,
    justifyContent: "center",
  },
  splash: {
    alignItems: "center",
    marginBottom: 12,
  },
  splashText: {
    fontWeight: "bold",
    fontFamily: Theme.fonts.title_bold,
    fontSize: 70,
    margin: 30,
    textAlign: "center",
  },
  dividingLine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  input: {
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.backgroundSecondary,
    padding: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 10,
  },
  button: {
    color: Theme.colors.textHighlighted,
    fontSize: 18,
    fontWeight: "bold",
    padding: 8,
  },
  buttonDisabled: {
    color: Theme.colors.textSecondary,
  },
  Text: {
    fontFamily: Theme.fonts.body,
  },
});
