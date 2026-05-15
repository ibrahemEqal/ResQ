import CustomInput from '@/app/ـcomponents/CustomInput';
import { auth, db } from '@/config/firebaseConfig';
import { COLORS } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SignupScreen() {
 
const {
  control,
  handleSubmit,
  watch,
  formState: { errors },
} = useForm({
  defaultValues: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
});

const password = watch('password');

const onSubmit = async (data: any) => {
  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    await setDoc(doc(db, 'users', userCredential.user.uid), {
  fullName:data.fullName,
  email: data.email,
  role: 'student',
  createdAt: new Date(),
  uid: userCredential.user.uid,
});

    Alert.alert('Success', 'Account created successfully');

    router.replace('/home');

  } catch (error) {
    Alert.alert('Error', 'Something went wrong');
  }
};
 

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <Controller
              control={control}
              name="fullName"
              rules={{
                required: 'Full name is required',
              }}
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  label="Full Name"
                  iconName="person-outline"
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email',
                },
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
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  label="Password"
                  iconName="lock-closed-outline"
                  placeholder="Create password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              }}
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  label="Confirm Password"
                  iconName="lock-closed-outline"
                  placeholder="Re-enter password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
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
    justifyContent: 'center',
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
});
              