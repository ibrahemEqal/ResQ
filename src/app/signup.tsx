import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
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
import CustomInput from "../components/CustomInput";
import { auth, db } from "../config/firebaseConfig";
import { COLORS } from "../constants/colors";
import { Theme } from "../constants/theme";

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
    if (validate()) {
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: "student",
          createdAt: new Date().toISOString(),
        });

        Alert.alert("Success", "Account created successfully");

        router.replace("/home");
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
            />

            <CustomInput
              label="Password"
              iconName="lock-closed-outline"
              placeholder="Create password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <CustomInput
              label="Confirm Password"
              iconName="lock-closed-outline"
              placeholder="Re-enter password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
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
  buttonText: {
    color: COLORS.surface,
    fontSize: RFValue(16),
    fontWeight: "700",
  },
});
