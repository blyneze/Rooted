import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Background image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Top section — brand */}
        <View style={styles.topSection}>
          <View style={styles.brandmark}>
            <View style={styles.rootIcon}>
              <View style={styles.rootLine} />
              <View style={styles.rootBranch} />
              <View style={styles.rootBranchRight} />
            </View>
          </View>
          <Typography variant="display" style={styles.wordmark}>
            Rooted
          </Typography>
          <Typography variant="body" style={styles.tagline} color="secondary">
            Grounded in the Word.{'\n'}Rooted in truth.
          </Typography>
        </View>

        {/* Bottom section — CTAs */}
        <View style={styles.bottomSection}>
          <Button
            label="Get started"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/sign-up')}
            style={styles.primaryBtn}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.secondaryBtn}
          />
          <Typography variant="caption" color="tertiary" align="center" style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Typography>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
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
  brandmark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  rootIcon: {
    alignItems: 'center',
    width: 30,
    height: 30,
    justifyContent: 'flex-end',
  },
  rootLine: {
    width: 2,
    height: 18,
    backgroundColor: '#FFF',
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
  },
  rootBranch: {
    width: 16,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
    position: 'absolute',
    bottom: 8,
    left: 0,
    transform: [{ rotate: '45deg' }],
  },
  rootBranchRight: {
    width: 16,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
    position: 'absolute',
    bottom: 8,
    right: 0,
    transform: [{ rotate: '-45deg' }],
  },
  wordmark: {
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: theme.spacing.base,
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  primaryBtn: {
    marginBottom: 4,
  },
  secondaryBtn: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  legal: {
    marginTop: theme.spacing.base,
    paddingHorizontal: theme.spacing.base,
  },
});
