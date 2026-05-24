import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Colors } from "@/components/colors";

const { width, height } = Dimensions.get("window");

interface AnimatedCircleProps {
  delay?: number;
  size?: number;
  initialX?: number;
  initialY?: number;
}

const AnimatedCircle: React.FC<AnimatedCircleProps> = ({ 
  delay = 0, 
  size = 200, 
  initialX = 0, 
  initialY = 0 
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { 
          toValue: 1, 
          duration: 4000, 
          useNativeDriver: true 
        }),
        Animated.timing(anim, { 
          toValue: 0, 
          duration: 4000, 
          useNativeDriver: true 
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay]);

  const translateY = anim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [0, -50] 
  });

  const translateX = anim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [0, 30] 
  });

  const rotateZ = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          top: initialY,
          left: initialX,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotateZ },
            { scale },
          ],
        },
      ]}
    />
  );
};

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
}

const ParticleBackground: React.FC = () => {
  const particles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * width,
    y: Math.random() * height,
    delay: Math.random() * 2000,
  }));

  return (
    <>
      {particles.map((particle) => (
        <AnimatedParticle
          key={particle.id}
          size={particle.size}
          initialX={particle.x}
          initialY={particle.y}
          delay={particle.delay}
        />
      ))}
    </>
  );
};

interface AnimatedParticleProps {
  size: number;
  initialX: number;
  initialY: number;
  delay: number;
}

const AnimatedParticle: React.FC<AnimatedParticleProps> = ({ 
  size, 
  initialX, 
  initialY, 
  delay 
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -150,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start(() => {
      translateY.setValue(0);
    });
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          left: initialX,
          top: initialY,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

export default function Register() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;
  const errorSlide = useRef(new Animated.Value(100)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fade, { 
        toValue: 1, 
        tension: 20,
        friction: 7,
        useNativeDriver: true 
      }),
      Animated.spring(slide, { 
        toValue: 0, 
        tension: 20,
        friction: 7,
        useNativeDriver: true 
      }),
    ]).start();
  }, [fade, slide]);

  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.spring(errorSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(errorSlide, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, errorSlide, errorOpacity]);

  const handleRegister = async (): Promise<void> => {
    // Validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters");
      setTimeout(() => setError(""), 4000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setTimeout(() => setError(""), 4000);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      console.log("🔄 Starting registration...");
      
      // Dummy registration - simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("✅ Registration successful");
      console.log("User data:", { fullName, email });
      
      // TODO: Replace with actual registration logic from authService
      // await register(fullName, email, password);
      
      // For now, just navigate back to login
      router.push("/(auth)/login");
      
    } catch (error: any) {
      console.error("❌ Registration error:", error.message);
      setError(error.message || "Registration failed. Please try again.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.main} />
      
      <LinearGradient 
        colors={Colors.gradients.background as any} 
        style={styles.gradient}
      >
        <ParticleBackground />
        <AnimatedCircle delay={0} size={250} initialX={-50} initialY={50} />
        <AnimatedCircle delay={800} size={180} initialX={width - 150} initialY={250} />
        <AnimatedCircle delay={400} size={120} initialX={width / 2 - 60} initialY={height - 200} />
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer, 
              { 
                opacity: fade, 
                transform: [{ translateY: slide }] 
              }
            ]}
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="person-add" size={40} color={Colors.primary.main} />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to start your journey</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputBox}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={22} color={Colors.primary.main} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={Colors.text.light}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError("");
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputBox}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={22} color={Colors.primary.main} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.text.light}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputBox}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={22} color={Colors.primary.main} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.text.light}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError("");
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setPasswordVisible(!isPasswordVisible)} 
                  disabled={isLoading}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color={Colors.text.tertiary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputBox}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={22} color={Colors.primary.main} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.text.light}
                  secureTextEntry={!isConfirmVisible}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError("");
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity 
                  onPress={() => setConfirmVisible(!isConfirmVisible)} 
                  disabled={isLoading}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={isConfirmVisible ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color={Colors.text.tertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => router.push("/(auth)/login")} 
              style={styles.linkBox}
              disabled={isLoading}
            >
              <Text style={styles.link}>Already have an account? Sign in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.9}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              <LinearGradient 
                colors={Colors.gradients.accent as any} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonInner}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={Colors.background.white} size="small" />
                    <Text style={styles.buttonText}>Creating account...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>By signing up, you agree to our Terms & Privacy Policy</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {error && (
        <Animated.View
          style={[
            styles.errorContainer,
            {
              opacity: errorOpacity,
              transform: [{ translateY: errorSlide }],
            },
          ]}
        >
          <BlurView intensity={90} tint="light" style={styles.errorBlur}>
            <View style={styles.errorBox}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle" size={28} color={Colors.status.error} />
              </View>
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setError("")} 
                style={styles.closeError}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={24} color={Colors.text.light} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { ...StyleSheet.absoluteFillObject },
  keyboardView: { 
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.opacity.white08,
    borderWidth: 1,
    borderColor: Colors.opacity.white15,
  },
  particle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.opacity.white40,
  },
  formContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 28,
    padding: 32,
    elevation: 15,
    shadowColor: Colors.opacity.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.pale,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.primary.ultraLight,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 15, 
    color: Colors.text.tertiary, 
    textAlign: "center",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginVertical: 10,
    height: 58,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: Colors.text.secondary, 
    paddingVertical: 12, 
    marginLeft: 12,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
  },
  button: { 
    marginTop: 24, 
    borderRadius: 16, 
    overflow: "hidden",
    elevation: 5,
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInner: { 
    paddingVertical: 18, 
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  buttonText: { 
    color: Colors.background.white, 
    fontWeight: "700", 
    fontSize: 16,
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkBox: { 
    alignSelf: "center", 
    marginTop: 16,
    padding: 8,
  },
  link: { 
    color: Colors.primary.main, 
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: Colors.text.light,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  errorContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
  },
  errorBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.opacity.white95,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.status.errorLight,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.status.errorLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  errorText: { 
    color: Colors.text.tertiary, 
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  closeError: {
    padding: 4,
    marginLeft: 8,
  },
});