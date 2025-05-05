import { useState } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import Button from "../components/Button";
import { StatusBar } from "expo-status-bar";
import theme from "../theme";
import { supabase as db, createUser } from "../db";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormInvalid = loading || email.length === 0 || password.length === 0;

  const handleSignup = async () => {
    setLoading(true);
    try {
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
      
      console.log("successfully signed up")
    
      const { error: profileError } = await createUser({
        id: userId,
        email,
        name,
      });

      if (profileError) {
        Alert.alert("User profile creation failed", profileError.message);
        return;
      }

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
      <View style={styles.centeredContent}>
        <Image source={require('../assets/icons/twiin_logo.png')} style={styles.logo}/>
        <Text style={styles.splashText}>Twiin</Text>
        <Text style={styles.bodyText}>Create your account</Text>
        <TextInput
          onChangeText={setName}
          value={name}
          placeholder="Name"
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          style={styles.input}
        />
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
          onPress={handleSignup}
          backgroundColor={theme.colors.createAccountButton}
          fontSize={18}
          disabled={isFormInvalid}
        >
          CREATE ACCOUNT
        </Button>

        <TouchableOpacity
          style={{ marginTop: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonAlt}>Back to Login</Text>
        </TouchableOpacity>
      </View>
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
  logo: {
    height: '20%',
    resizeMode: 'contain',
  },
  splashText: {
    fontWeight: "bold",
    fontFamily: theme.text.title_bold,
    fontSize: 60,
    marginBottom: 5,
    textAlign: "center",
  },
  bodyText: {
    fontFamily: theme.text.body,
    textAlign: "center",
    fontSize: 20,
    marginBottom: 50,
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
  buttonAlt: {
    fontFamily: theme.text.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
