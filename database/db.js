import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://owfwygmjaxixnoxofgtj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93Znd5Z21qYXhpeG5veG9mZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3OTcxNTAsImV4cCI6MjA2MTM3MzE1MH0.cVbjjd2JoEPoA_9lnAR2C9Zxg8lJa0QgxHGBkgiWMQc"

const db = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    db.auth.startAutoRefresh()
  } else {
    db.auth.stopAutoRefresh()
  }
});

export default db;