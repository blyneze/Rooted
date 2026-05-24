import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';
import { useApiClient } from '@/api/apiClient';
import { StatusBar } from 'expo-status-bar';

type Step = 0 | 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4; // steps 1-3 are form, 4 is done

export default function OnboardingScreen() {
  const { user, isLoaded } = useUser();
  const api = useApiClient();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Auto-skip if user has already completed onboarding
  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.onboardingComplete === true) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, user]);

  // Animate progress bar
  useEffect(() => {
    if (step >= 1 && step <= 3) {
      Animated.spring(progressAnim, {
        toValue: step / TOTAL_STEPS,
        useNativeDriver: false,
        tension: 60,
        friction: 8,
      }).start();
    }
  }, [step]);

  const handleComplete = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const trimmedName = name.trim();
      const parts = trimmedName.split(/\s+/);
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ');

      // Update Clerk user profile and metadata
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          onboardingComplete: true,
          age: parseInt(age, 10) || null,
          isPistisPlaceMember: isMember,
        },
      });

      // Sync to backend — creates/updates the user record in the DB
      await api.post('/me/sync', {
        email: user.primaryEmailAddress?.emailAddress,
        firstName,
        lastName,
      });

      // Show the welcome screen (step 4)
      setStep(4);

      // Auto-navigate to app after 2.5s
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2500);
    } catch (err: any) {
      console.error('[Onboarding Error]', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = name.trim().length >= 2;
  const canProceedStep2 = age.trim().length > 0 && parseInt(age, 10) > 0;
  const canProceedStep3 = isMember !== null;

  // ─── Step 0: Welcome splash ───────────────────────────────────────────────
  if (step === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.centerFlex} edges={['top', 'bottom']}>
          <MotiView
            from={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 700 }}
            style={styles.welcomeCard}
          >
            <View style={styles.welcomeIconRing}>
              <Ionicons name="leaf" size={40} color={theme.colors.accent} />
            </View>

            <Typography variant="heading1" align="center" style={styles.welcomeTitle}>
              Welcome to Rooted
            </Typography>

            <Typography variant="body" color="secondary" align="center" style={styles.welcomeBody}>
              Before you dive in, we'd love to get to know you a little better.
              It'll only take a moment.
            </Typography>

            <Button
              label="Let's go →"
              variant="primary"
              size="lg"
              fullWidth
              style={styles.welcomeBtn}
              onPress={() => setStep(1)}
            />
          </MotiView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Step 4: Done / Welcome ───────────────────────────────────────────────
  if (step === 4) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.centerFlex} edges={['top', 'bottom']}>
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            style={styles.doneCard}
          >
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 200, damping: 12 }}
              style={styles.doneIconRing}
            >
              <Ionicons name="checkmark" size={44} color="#fff" />
            </MotiView>

            <Typography variant="heading1" align="center" style={{ marginBottom: 12 }}>
              You're all set! 🌱
            </Typography>

            <Typography variant="body" color="secondary" align="center">
              Welcome to the Rooted community.{'\n'}
              May you grow deeper in faith every day.
            </Typography>

            <ActivityIndicator
              size="small"
              color={theme.colors.accent}
              style={{ marginTop: theme.spacing['2xl'] }}
            />
          </MotiView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Steps 1-3: Form steps ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Step counter */}
            <Typography variant="caption" color="tertiary" style={styles.stepCounter}>
              Step {step} of {TOTAL_STEPS}
            </Typography>

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <MotiView
                key="step1"
                from={{ opacity: 0, translateX: 40 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 350 }}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="person-outline" size={24} color={theme.colors.accent} />
                  </View>
                  <Typography variant="heading1" style={styles.stepTitle}>
                    What's your name?
                  </Typography>
                  <Typography variant="body" color="secondary" style={styles.stepSubtitle}>
                    This is how we'll greet you in the app.
                  </Typography>
                </View>

                <View style={styles.fieldGroup}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholder="Your full name"
                    placeholderTextColor={theme.colors.textTertiary}
                    selectionColor={theme.colors.accent}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => canProceedStep1 && setStep(2)}
                  />
                </View>

                {error ? <Typography variant="caption" color="accent" style={styles.errorText}>{error}</Typography> : null}

                <Button
                  label="Continue"
                  variant="primary"
                  size="lg"
                  fullWidth
                  style={styles.ctaBtn}
                  onPress={() => { setError(''); setStep(2); }}
                  disabled={!canProceedStep1}
                />
              </MotiView>
            )}

            {/* ── Step 2: Age ── */}
            {step === 2 && (
              <MotiView
                key="step2"
                from={{ opacity: 0, translateX: 40 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 350 }}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="calendar-outline" size={24} color={theme.colors.accent} />
                  </View>
                  <Typography variant="heading1" style={styles.stepTitle}>
                    How old are you?
                  </Typography>
                  <Typography variant="body" color="secondary" style={styles.stepSubtitle}>
                    This helps us tailor your experience.
                  </Typography>
                </View>

                <View style={styles.fieldGroup}>
                  <TextInput
                    style={[styles.input, styles.ageInput]}
                    value={age}
                    onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="e.g. 25"
                    placeholderTextColor={theme.colors.textTertiary}
                    selectionColor={theme.colors.accent}
                    maxLength={3}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => canProceedStep2 && setStep(3)}
                  />
                </View>

                <View style={styles.rowBtns}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)} hitSlop={8}>
                    <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
                    <Typography variant="label" color="secondary"> Back</Typography>
                  </TouchableOpacity>
                  <Button
                    label="Continue"
                    variant="primary"
                    size="lg"
                    style={styles.ctaBtnFlex}
                    onPress={() => { setError(''); setStep(3); }}
                    disabled={!canProceedStep2}
                  />
                </View>
              </MotiView>
            )}

            {/* ── Step 3: Pistis Place Membership ── */}
            {step === 3 && (
              <MotiView
                key="step3"
                from={{ opacity: 0, translateX: 40 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 350 }}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="people-outline" size={24} color={theme.colors.accent} />
                  </View>
                  <Typography variant="heading1" style={styles.stepTitle}>
                    Are you a member of{'\n'}The Pistis Place Global?
                  </Typography>
                  <Typography variant="body" color="secondary" style={styles.stepSubtitle}>
                    Select the option that applies to you.
                  </Typography>
                </View>

                <View style={styles.membershipOptions}>
                  <TouchableOpacity
                    style={[
                      styles.membershipCard,
                      isMember === true && styles.membershipCardSelected,
                    ]}
                    onPress={() => setIsMember(true)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.membershipRadio, isMember === true && styles.membershipRadioSelected]}>
                      {isMember === true && <View style={styles.membershipRadioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="label"
                        style={[
                          styles.membershipLabel,
                          isMember === true && { color: theme.colors.accent },
                        ]}
                      >
                        Yes, I'm a member
                      </Typography>
                      <Typography variant="caption" color="tertiary">
                        I attend or am connected to The Pistis Place Global
                      </Typography>
                    </View>
                    {isMember === true && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.membershipCard,
                      isMember === false && styles.membershipCardSelected,
                    ]}
                    onPress={() => setIsMember(false)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.membershipRadio, isMember === false && styles.membershipRadioSelected]}>
                      {isMember === false && <View style={styles.membershipRadioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="label"
                        style={[
                          styles.membershipLabel,
                          isMember === false && { color: theme.colors.accent },
                        ]}
                      >
                        No, I'm not a member
                      </Typography>
                      <Typography variant="caption" color="tertiary">
                        I'm here to grow in faith on my own
                      </Typography>
                    </View>
                    {isMember === false && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} />
                    )}
                  </TouchableOpacity>
                </View>

                {error ? <Typography variant="caption" color="accent" style={styles.errorText}>{error}</Typography> : null}

                <View style={styles.rowBtns}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)} hitSlop={8}>
                    <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
                    <Typography variant="label" color="secondary"> Back</Typography>
                  </TouchableOpacity>
                  <Button
                    label={isLoading ? '' : 'Finish'}
                    variant="primary"
                    size="lg"
                    style={styles.ctaBtnFlex}
                    onPress={handleComplete}
                    disabled={!canProceedStep3 || isLoading}
                    isLoading={isLoading}
                  />
                </View>
              </MotiView>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerFlex: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },

  // ── Welcome (step 0) ──
  welcomeCard: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  welcomeIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeBody: {
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeBtn: {
    marginTop: theme.spacing.md,
  },

  // ── Progress bar ──
  progressTrack: {
    height: 3,
    backgroundColor: theme.colors.surfaceBorder,
    marginHorizontal: 0,
  },
  progressFill: {
    height: 3,
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },

  // ── Form steps ──
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  stepCounter: {
    marginBottom: theme.spacing.xl,
    opacity: 0.6,
  },
  stepHeader: {
    marginBottom: theme.spacing['2xl'],
    gap: theme.spacing.sm,
  },
  stepIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepTitle: {
    lineHeight: 36,
  },
  stepSubtitle: {
    lineHeight: 22,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 18,
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPrimary,
  },
  ageInput: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    paddingVertical: 20,
  },
  errorText: {
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  ctaBtn: {
    marginBottom: theme.spacing.sm,
  },
  ctaBtnFlex: {
    flex: 1,
  },
  rowBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.sm,
  },

  // ── Membership cards ──
  membershipOptions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    padding: theme.spacing.base,
  },
  membershipCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  membershipRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipRadioSelected: {
    borderColor: theme.colors.accent,
  },
  membershipRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  membershipLabel: {
    marginBottom: 2,
  },

  // ── Done (step 4) ──
  doneCard: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  doneIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
});
