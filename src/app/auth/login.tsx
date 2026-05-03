import CustomInput from '@/app/ـcomponents/CustomInput';
import { auth, db } from '@/config/firebaseConfig';
import { COLORS } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validate = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
    };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userUid = userCredential.user.uid;

        const userDocRef = doc(db, "users", userUid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          if (userData.role === 'security' || userData.role === 'admin') {
            router.replace('/(tabs)/dashboard');
          } else {
            router.replace('/(tabs)/home');
          }
        } else {
          router.replace('/(tabs)/home');
        }

      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          Alert.alert('خطأ', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('خطأ', 'صيغة البريد الإلكتروني غير صحيحة');
        } else {
          Alert.alert('حدث خطأ', error.message);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to continue</Text>

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
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
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
    justifyContent: 'center',
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
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  link: {
    marginTop: Theme.spacing.lg,
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  signupLink: {
    marginTop: Theme.spacing.md,
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: RFValue(13),
    fontWeight: '700',
  },

});