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
import { useSignUp } from '@clerk/expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';

type Step = 'details' | 'verify';

export default function SignUpScreen() {
  // @ts-ignore
  const { signUp, setActive, isLoaded } = useSignUp() as any;
  const [step, setStep] = useState<Step>('details');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');
    try {
      await signUp.create({ firstName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Could not create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Verification failed. Check the code and try again.');
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
            onPress={() => (step === 'verify' ? setStep('details') : router.back())}
            style={styles.back}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          {step === 'details' ? (
            <>
              <View style={styles.header}>
                <Typography variant="heading1">Create your account</Typography>
                <Typography variant="body" color="secondary" style={{ marginTop: 8 }}>
                  Begin your journey. Rooted in the Word.
                </Typography>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Typography variant="label" color="secondary">First name</Typography>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    placeholder="Your first name"
                    placeholderTextColor={theme.colors.textTertiary}
                    selectionColor={theme.colors.accent}
                  />
                </View>

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

                <View style={styles.fieldGroup}>
                  <Typography variant="label" color="secondary">Password</Typography>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Create a password"
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
                label="Create account"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                onPress={handleSignUp}
                style={styles.submitBtn}
              />
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.verifyIcon}>
                  <Ionicons name="mail" size={32} color={theme.colors.accent} />
                </View>
                <Typography variant="heading1" style={{ marginBottom: 8 }}>Check your email</Typography>
                <Typography variant="body" color="secondary">
                  We sent a verification code to{'\n'}
                  <Typography variant="body" style={{ color: theme.colors.textPrimary }}>
                    {email}
                  </Typography>
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
                label="Verify email"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                onPress={handleVerify}
                style={styles.submitBtn}
              />
            </>
          )}

          <View style={styles.switchRow}>
            <Typography variant="body" color="secondary">Already have an account? </Typography>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} hitSlop={8}>
              <Typography variant="body" color="accent">Sign in</Typography>
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
  verifyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
