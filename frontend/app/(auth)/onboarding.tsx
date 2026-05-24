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
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useUser, useAuth } from '@clerk/expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';
import { useApiClient } from '@/api/apiClient';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

type Step = 0 | 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4; // steps 1-3 are form, 4 is done

export default function OnboardingScreen() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
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

      // Force a fresh token so the backend recognizes the new user session
      const token = await getToken({ skipCache: true });

      // Sync to backend — creates/updates the user record in the DB
      await api.post('/me/sync', {
        email: user.primaryEmailAddress?.emailAddress,
        firstName,
        lastName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
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

  // Common background wrapper for premium dark feel
  const Background = () => (
    <>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1507499036636-f716246c2c23?w=800&q=80' }} // A beautiful subtle dark texture/nature
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
        style={StyleSheet.absoluteFillObject}
      />
    </>
  );

  // ─── Step 0: Welcome splash ───────────────────────────────────────────────
  if (step === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Background />
        <SafeAreaView style={styles.centerFlex} edges={['top', 'bottom']}>
          <MotiView
            from={{ opacity: 0, scale: 0.85, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.welcomeCard}
          >
            <View style={styles.welcomeIconRing}>
              <Ionicons name="leaf" size={44} color="#FFF" />
            </View>

            <Typography variant="display" align="center" style={styles.welcomeTitle}>
              Welcome to Rooted
            </Typography>

            <Typography variant="body" align="center" style={styles.welcomeBody}>
              Before you dive in, we'd love to get to know you a little better.
              It'll only take a moment.
            </Typography>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setStep(1)}
              activeOpacity={0.8}
            >
              <Typography variant="label" style={styles.primaryBtnText}>
                Let's go
              </Typography>
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </TouchableOpacity>
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
        <Background />
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
              <Ionicons name="checkmark" size={50} color="#000" />
            </MotiView>

            <Typography variant="display" align="center" style={{ marginBottom: 16, color: '#fff' }}>
              You're all set! 🌱
            </Typography>

            <Typography variant="body" align="center" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 24 }}>
              Welcome to the Rooted community.{'\n'}
              May you grow deeper in faith every day.
            </Typography>

            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ marginTop: 40 }}
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
      <Background />
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
            <Typography variant="caption" style={styles.stepCounter}>
              Step {step} of {TOTAL_STEPS - 1}
            </Typography>

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <MotiView
                key="step1"
                from={{ opacity: 0, translateX: 30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="person-outline" size={28} color="#FFF" />
                  </View>
                  <Typography variant="heading1" style={styles.stepTitle}>
                    What's your name?
                  </Typography>
                  <Typography variant="body" style={styles.stepSubtitle}>
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
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    selectionColor="#FFF"
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => canProceedStep1 && setStep(2)}
                  />
                </View>

                {error ? <Typography variant="caption" style={styles.errorText}>{error}</Typography> : null}

                <TouchableOpacity
                  style={[styles.primaryBtn, !canProceedStep1 && styles.primaryBtnDisabled]}
                  onPress={() => { setError(''); setStep(2); }}
                  disabled={!canProceedStep1}
                  activeOpacity={0.8}
                >
                  <Typography variant="label" style={styles.primaryBtnText}>Continue</Typography>
                </TouchableOpacity>
              </MotiView>
            )}

            {/* ── Step 2: Age ── */}
            {step === 2 && (
              <MotiView
                key="step2"
                from={{ opacity: 0, translateX: 30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="calendar-outline" size={28} color="#FFF" />
                  </View>
                  <Typography variant="heading1" style={styles.stepTitle}>
                    How old are you?
                  </Typography>
                  <Typography variant="body" style={styles.stepSubtitle}>
                    This helps us tailor your experience.
                  </Typography>
                </View>

                <View style={styles.fieldGroup}>
                  <TextInput
                    style={[styles.input, styles.ageInput]}
                    value={age}
                    onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    selectionColor="#FFF"
                    maxLength={3}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => canProceedStep2 && setStep(3)}
                  />
                </View>

                <View style={styles.rowBtns}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)} hitSlop={12}>
                    <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, styles.ctaBtnFlex, !canProceedStep2 && styles.primaryBtnDisabled]}
                    onPress={() => { setError(''); setStep(3); }}
                    disabled={!canProceedStep2}
                    activeOpacity={0.8}
                  >
                    <Typography variant="label" style={styles.primaryBtnText}>Continue</Typography>
                  </TouchableOpacity>
                </View>
              </MotiView>
            )}

            {/* ── Step 3: Pistis Place Membership ── */}
            {step === 3 && (
              <MotiView
                key="step3"
                from={{ opacity: 0, translateX: 30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="people-outline" size={28} color="#FFF" />
                  </View>
                  <Typography variant="heading1" style={styles.stepTitle}>
                    Are you a member of{'\n'}The Pistis Place Global?
                  </Typography>
                  <Typography variant="body" style={styles.stepSubtitle}>
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
                    activeOpacity={0.8}
                  >
                    <View style={styles.membershipTextGroup}>
                      <Typography variant="label" style={styles.membershipLabel}>
                        Yes, I'm a member
                      </Typography>
                      <Typography variant="caption" style={styles.membershipDesc}>
                        I attend or am connected to The Pistis Place Global
                      </Typography>
                    </View>
                    <View style={[styles.membershipRadio, isMember === true && styles.membershipRadioSelected]}>
                      {isMember === true && <View style={styles.membershipRadioDot} />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.membershipCard,
                      isMember === false && styles.membershipCardSelected,
                    ]}
                    onPress={() => setIsMember(false)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.membershipTextGroup}>
                      <Typography variant="label" style={styles.membershipLabel}>
                        No, I'm not a member
                      </Typography>
                      <Typography variant="caption" style={styles.membershipDesc}>
                        I'm here to grow in faith on my own
                      </Typography>
                    </View>
                    <View style={[styles.membershipRadio, isMember === false && styles.membershipRadioSelected]}>
                      {isMember === false && <View style={styles.membershipRadioDot} />}
                    </View>
                  </TouchableOpacity>
                </View>

                {error ? <Typography variant="caption" style={styles.errorText}>{error}</Typography> : null}

                <View style={styles.rowBtns}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)} hitSlop={12}>
                    <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, styles.ctaBtnFlex, (!canProceedStep3 || isLoading) && styles.primaryBtnDisabled]}
                    onPress={handleComplete}
                    disabled={!canProceedStep3 || isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Typography variant="label" style={styles.primaryBtnText}>Finish</Typography>
                    )}
                  </TouchableOpacity>
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
    backgroundColor: '#000',
  },
  centerFlex: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },

  // ── Buttons ──
  primaryBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Welcome (step 0) ──
  welcomeCard: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  welcomeIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  welcomeBody: {
    textAlign: 'center',
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },

  // ── Progress bar ──
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 0,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FFF',
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
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  stepHeader: {
    marginBottom: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  stepIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepTitle: {
    lineHeight: 40,
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    lineHeight: 24,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  fieldGroup: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 18,
    color: '#FFF',
    fontWeight: '500',
  },
  ageInput: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 4,
    paddingVertical: 24,
  },
  errorText: {
    marginBottom: theme.spacing.lg,
    color: '#FF3B30',
    fontWeight: '600',
  },
  ctaBtnFlex: {
    flex: 1,
  },
  rowBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  backBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // ── Membership cards ──
  membershipOptions: {
    gap: 16,
    marginBottom: 32,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
  },
  membershipCardSelected: {
    borderColor: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  membershipTextGroup: {
    flex: 1,
    paddingRight: 16,
  },
  membershipRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipRadioSelected: {
    borderColor: '#FFF',
  },
  membershipRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  membershipLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  membershipDesc: {
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },

  // ── Done (step 4) ──
  doneCard: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  doneIconRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
