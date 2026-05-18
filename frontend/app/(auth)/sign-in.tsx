import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSignIn, useClerk, useAuth } from '@clerk/expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';

export default function SignInScreen() {
  const { client, setActive } = useClerk();
  const { isLoaded } = useAuth();
  const signIn = client.signIn;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) {
      Alert.alert("Error", "Clerk is not fully loaded yet. Please wait a moment.");
      return;
    }
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error("[SignIn Error]", JSON.stringify(err, null, 2));
      const message = err?.errors?.[0]?.message ?? err?.message ?? 'Sign in failed. Please try again.';
      setError(message);
      Alert.alert("Sign In Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity onPress={router.back} style={styles.back} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Typography variant="heading1">Welcome back</Typography>
            <Typography variant="body" color="secondary" style={{ marginTop: 8 }}>
              Sign in to your Rooted account
            </Typography>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Typography variant="label" color="secondary" style={styles.fieldLabel}>
                Email
              </Typography>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textTertiary}
                selectionColor={theme.colors.accent}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Typography variant="label" color="secondary" style={styles.fieldLabel}>
                Password
              </Typography>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  placeholder="Your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  selectionColor={theme.colors.accent}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.accent} />
                <Typography variant="caption" color="accent" style={{ marginLeft: 6, flex: 1 }}>
                  {error}
                </Typography>
              </View>
            ) : null}

            {/* Forgot */}
            <TouchableOpacity 
              style={styles.forgotRow} 
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={8}
            >
              <Typography variant="label" color="accent">
                Forgot password?
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <Button
            label="Sign in"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            onPress={handleSignIn}
            style={styles.submitBtn}
          />

          {/* Switch to sign up */}
          <View style={styles.switchRow}>
            <Typography variant="body" color="secondary">
              Don't have an account?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')} hitSlop={8}>
              <Typography variant="body" color="accent">
                Sign up
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'],
  },
  back: {
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.xl,
    alignSelf: 'flex-start',
    padding: 4,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  form: {
    gap: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  fieldLabel: {},
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 16,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentMuted,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.accent,
  },
  forgotRow: {
    alignSelf: 'flex-end',
  },
  submitBtn: {
    marginBottom: theme.spacing.xl,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
