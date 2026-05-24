import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { StatusBar } from 'expo-status-bar';
import { useOAuth } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';

// Required for OAuth redirect to complete on Android
WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive, signUp } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // Always route through onboarding — it auto-skips for returning users
        if (signUp?.status === 'complete') {
          // Brand new Google account
          router.replace('/(auth)/onboarding');
        } else {
          // Returning user — onboarding screen will check metadata & skip if done
          router.replace('/(auth)/onboarding');
        }
      }
    } catch (err: any) {
      console.error('[Google Auth Error]', err);
      const message =
        err?.errors?.[0]?.message ??
        err?.message ??
        'Could not sign in with Google. Please try again.';
      Alert.alert('Sign In Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Premium Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.92)']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']} pointerEvents="box-none">
        {/* Top section — brand */}
        <View style={styles.topSection}>
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000, delay: 200 }}
          >
            <ExpoImage
              source={require('../../assets/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800, delay: 500 }}
          >
            <Typography variant="display" style={styles.wordmark}>
              Rooted
            </Typography>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800, delay: 700 }}
          >
            <Typography variant="body" style={styles.tagline}>
              Grounded in the Word.{'\n'}Rooted in truth.
            </Typography>
          </MotiView>
        </View>

        {/* Bottom section — CTA */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000, delay: 900 }}
          style={styles.bottomSection}
        >
          <TouchableOpacity
            style={[styles.googleBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleGoogleAuth}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#1a1a1a" />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://www.google.com/favicon.ico' }}
                  style={styles.googleIcon}
                />
                <Typography variant="label" style={styles.googleBtnText}>
                  Continue with Google
                </Typography>
              </>
            )}
          </TouchableOpacity>

          <Typography variant="caption" align="center" style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Typography>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  logo: {
    width: 84,
    height: 84,
    marginBottom: theme.spacing.sm,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  wordmark: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '500',
    color: '#E5E5EA',
    marginTop: theme.spacing.sm,
    opacity: 0.9,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 2,
  },
  googleBtnText: {
    color: '#1a1a1a',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  legal: {
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 18,
    opacity: 0.6,
    color: '#ffffff',
    fontSize: 12,
  },
});
