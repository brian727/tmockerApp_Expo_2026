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
  ImageBackground
} from "react-native";
import { router } from "expo-router";
import { useSignUp } from "@/hooks/useSignUp";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function Page() {
  const { isLoaded, signUp, verifyOtp } = useSignUp();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp({ email, password });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await verifyOtp({ email, token });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to verify");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ImageBackground 
          source={require('../../assets/tumamoc_sunset.png')} 
          style={styles.background}
          resizeMode="cover"
        >
          <View style={[styles.overlay, { paddingTop: insets.top + 40 }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    value={token}
                    placeholder="123456"
                    onChangeText={setToken}
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, !token && styles.buttonDisabled]}
                  onPress={onVerifyPress}
                  disabled={!token || loading}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </ImageBackground>
      </View>
    );
  }

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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the community</Text>
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
                onPress={onSignUpPress}
                disabled={!email || !password || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/sign-in")}>
                  <Text style={styles.link}>Sign in</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    height: 64,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
  },
  button: {
    height: 64,
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
    fontSize: 20,
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
    color: '#FFD700',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
