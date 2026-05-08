import CustomInput from "@/components/CustomInput";
import { auth, db } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { Theme } from "@/constants/theme";
import { saveUserLocally } from "@/services/authService";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    let valid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (loading) return;
    if (validate()) {
      setLoading(true);
      try {
        const normalizedEmail = email.trim();
        const normalizedFullName = fullName.trim();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );
        const user = userCredential.user;
        try {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: normalizedFullName,
            email: normalizedEmail,
            role: "student",
            createdAt: new Date().toISOString(),
          });
        } catch {
          // إذا قواعد Firestore تمنع الكتابة، نكمل لأن الحساب انعمل في Auth
        }

        await saveUserLocally({
          uid: user.uid,
          email: normalizedEmail,
          fullName: normalizedFullName,
          role: "student",
          createdAt: new Date().toISOString(),
        });

        Alert.alert("Success", "Account created successfully");

        router.replace("/(tabs)/home");
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("Error", "هذا البريد الإلكتروني مستخدم مسبقاً");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert("Error", "صيغة البريد الإلكتروني غير صحيحة");
        } else {
          Alert.alert("Error", error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <CustomInput
              label="Full Name"
              iconName="person-outline"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              editable={!loading}
            />

            <CustomInput
              label="Email"
              iconName="mail-outline"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              editable={!loading}
            />

            <CustomInput
              label="Password"
              iconName="lock-closed-outline"
              placeholder="Create password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              editable={!loading}
            />

            <CustomInput
              label="Confirm Password"
              iconName="lock-closed-outline"
              placeholder="Re-enter password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.surface} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: Theme.spacing.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: RFValue(24),
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    marginTop: Theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: RFValue(16),
    fontWeight: "700",
  },
});
