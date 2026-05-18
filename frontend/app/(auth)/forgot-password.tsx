import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useClerk, useAuth } from '@clerk/expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';

type Step = 'request' | 'reset';

export default function ForgotPasswordScreen() {
  const { client, setActive } = useClerk();
  const { isLoaded } = useAuth();
  const signIn = client.signIn;

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async () => {
    if (!isLoaded || !email) return;
    setIsLoading(true);
    setError('');
    
    try {
      await signIn.create({
        strategy: 'reset_password_email_code' as any,
        identifier: email,
      });
      setStep('reset');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isLoaded || !code || !password) return;
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code' as any,
        code,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Reset failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? err?.message ?? 'Reset failed. Check the code and try again.');
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
          <TouchableOpacity
            onPress={() => (step === 'reset' ? setStep('request') : router.back())}
            style={styles.back}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          {step === 'request' ? (
            <>
              <View style={styles.header}>
                <Typography variant="heading1">Reset password</Typography>
                <Typography variant="body" color="secondary" style={{ marginTop: 8 }}>
                  Enter your email address and we'll send you a code to reset your password.
                </Typography>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Typography variant="label" color="secondary">Email</Typography>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    selectionColor={theme.colors.accent}
                  />
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={theme.colors.accent} />
                    <Typography variant="caption" color="accent" style={{ marginLeft: 6, flex: 1 }}>
                      {error}
                    </Typography>
                  </View>
                ) : null}
              </View>

              <Button
                label="Send code"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                onPress={handleRequestReset}
                style={styles.submitBtn}
              />
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Typography variant="heading1">Check your email</Typography>
                <Typography variant="body" color="secondary" style={{ marginTop: 8 }}>
                  We've sent a 6-digit code to {email}.
                </Typography>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Typography variant="label" color="secondary">Verification code</Typography>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="000000"
                    placeholderTextColor={theme.colors.textTertiary}
                    selectionColor={theme.colors.accent}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Typography variant="label" color="secondary">New password</Typography>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Create a new password"
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

                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={theme.colors.accent} />
                    <Typography variant="caption" color="accent" style={{ marginLeft: 6, flex: 1 }}>
                      {error}
                    </Typography>
                  </View>
                ) : null}
              </View>

              <Button
                label="Reset password"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                onPress={handleResetPassword}
                style={styles.submitBtn}
              />
            </>
          )}
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
  codeInput: {
    textAlign: 'center',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 8,
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
  submitBtn: {
    marginBottom: theme.spacing.xl,
  },
});
