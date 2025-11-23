import { useState } from "react";
import { 
  Text, 
  TextInput, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  ImageBackground,
  Dimensions
} from "react-native";
import { router } from "expo-router";
import { useSignIn } from "@/hooks/useSignIn";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function Page() {
  const { signInWithPassword, isLoaded } = useSignIn();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signInWithPassword({ email, password });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground 
        source={require('../../assets/tumamoc_sunset.png')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { paddingTop: insets.top + 40 }]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue hiking</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  autoCapitalize="none"
                  value={email}
                  placeholder="Enter email"
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  placeholder="Enter password"
                  secureTextEntry
                  onChangeText={setPassword}
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, (!email || !password) && styles.buttonDisabled]}
                onPress={onSignInPress}
                disabled={!email || !password || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/sign-up")}>
                  <Text style={styles.link}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Darker overlay for better contrast
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 18, // Larger label
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    height: 64, // Larger touch target
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 20, // Larger font
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background
    color: 'white',
  },
  button: {
    height: 64, // Larger button
    backgroundColor: '#FF4500',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 69, 0, 0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 20, // Larger text
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  link: {
    fontSize: 16,
    color: '#FFD700', // Gold color for link
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
