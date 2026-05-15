import CustomInput from "@/app/ـcomponents/CustomInput";
import { auth, db } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { Theme } from "@/constants/theme";
import {
  registerForPushNotificationsAsync,
  saveToken,
} from "@/services/notificationService";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  GestureResponderEvent,
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

export default function LoginScreen() {
  type FormData = {
    email: string;
    password: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      console.log("USER ROLE:", userData?.role);

      const token = await registerForPushNotificationsAsync();

      console.log("TOKEN:", token);

      if (token) {
        await saveToken(user.uid, token, userData?.role?.trim() || "student");
      }

      if (userData?.role?.trim() === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Login Failed", "Email or password is incorrect");
    }
  };

  function handleForgetPassword(event: GestureResponderEvent): void {
    throw new Error("Function not implemented.");
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to continue</Text>

              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    label="Email"
                    iconName="mail-outline"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    label="Password"
                    iconName="lock-closed-outline"
                    placeholder="Enter your password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgetPassword}>
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("./signup")}>
                <Text style={styles.signupLink}>
                  Don’t have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.lg,
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
  link: {
    marginTop: Theme.spacing.lg,
    textAlign: "center",
    color: COLORS.secondary,
    fontSize: RFValue(13),
    fontWeight: "600",
  },
  signupLink: {
    marginTop: Theme.spacing.md,
    textAlign: "center",
    color: COLORS.primary,
    fontSize: RFValue(13),
    fontWeight: "700",
  },
});
