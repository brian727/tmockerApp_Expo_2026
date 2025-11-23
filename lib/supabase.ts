import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// ✅ Grab from .env (Expo automatically exposes variables starting with EXPO_PUBLIC_)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

console.log("Supabase Config:", {
  url: supabaseUrl, // Log full URL to debug TLD
  key: supabaseAnonKey ? "PRESENT" : "MISSING",
});

// ✅ Create a single supabase client for the whole app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store the session on the device so user stays logged in
    storage: AsyncStorage,
    autoRefreshToken: true, // refresh session automatically
    persistSession: true, // save session across app restarts
    detectSessionInUrl: false, // avoids issues on mobile
  },
});
