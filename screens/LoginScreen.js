import { useState } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Button from "../components/Button";
import { StatusBar } from "expo-status-bar";
import theme from "../theme";
import { supabase as db, createUser } from "../db";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [accountDecisionText, setDecisionText] = useState("CREATE ACCOUNT");

  const isFormInvalid = loading || email.length === 0 || password.length === 0;

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      const { error } = await db.auth.signInWithPassword({
        email,
        password,
        options: { shouldCreateUser: false },
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
    setDecisionText("CREATE ACCOUNT");
    setLoading(true);
    try {
      // Step 1: Create the auth account
      console.log("past try");
      const { data: signUpData, error: signUpError } = await db.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        Alert.alert("Signup failed", signUpError.message);
        return;
      }

      const userId = signUpData?.user?.id;

      if (!userId) {
        Alert.alert("Signup failed", "User ID not returned.");
        return;
      }

      // Step 2: Create the user profile in your 'users' table
      const { error: profileError } = await createUser({
        id: userId,
        email: email,
      });

      if (profileError) {
        Alert.alert("User profile creation failed", profileError.message);
        return;
      }

      // Step 3: Navigate into app
      navigation.replace("Main");
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
      {!showForm ? (
        <View style={styles.centeredContent}>
          <Text style={styles.splashText}>Twiin</Text>

          <Button
            onPress={() => {
              setCreatingAccount(false); // important: this ensures login mode
              setShowForm(true);
            }}
            backgroundColor="#f78da7"
            fontSize={18}
          >
            SIGN IN WITH EMAIL
          </Button>

          <View style={styles.dividingLine}>
            <View style={styles.line} />
            <Text style={{ marginHorizontal: 10 }}>OR</Text>
            <View style={styles.line} />
          </View>

          <Button
            onPress={() => navigation.navigate("Signup")}
            backgroundColor={theme.colors.createAccountButton}
            fontSize={18}
          >
            CREATE ACCOUNT
          </Button>
        </View>
      ) : (
        <View style={styles.centeredContent}>
          <Text style={styles.splashText}>Twiin</Text>

          <TextInput
            onChangeText={setEmail}
            value={email}
            placeholder="E-mail"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />

          <Button
            onPress={creatingAccount ? signUpWithEmail : signInWithEmail}
            backgroundColor={theme.colors.createAccountButton}
            fontSize={18}
          >
            {creatingAccount ? "CREATE ACCOUNT" : "SIGN IN WITH EMAIL"}
          </Button>

          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => {
              setShowForm(false);
              setEmail("");
              setPassword("");
            }}
          >
            <Text style={styles.buttonAlt}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: theme.colors.backgroundPrimary,
    flex: 1,
    justifyContent: "center",
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  splashText: {
    fontWeight: "bold",
    fontFamily: theme.text.title_bold,
    fontSize: 70,
    marginBottom: 40,
    textAlign: "center",
  },
  dividingLine: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "70%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
  },
  input: {
    backgroundColor: theme.colors.challengeCard,
    padding: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderRadius: 10,
    marginHorizontal: 30,
    width: 250,
  },
  primaryButton: {
    backgroundColor: theme.colors.challengeCard,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 10,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonAlt: {
    fontFamily: theme.text.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
