import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '@/theme';

const { width, height } = Dimensions.get('window');

interface LoadingSplashProps {
  onAnimationComplete?: () => void;
  isLoading: boolean;
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({ 
  onAnimationComplete,
  isLoading 
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    // Smoothly animate progress bar locally to give high-fidelity responsive feel
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgressWidth(prev => {
          if (prev >= 0.85) return prev + 0.005; // slow down near the end
          return prev + 0.05;
        });
      }, 80);
    } else {
      setProgressWidth(1);
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, 400);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <MotiView
      animate={{
        opacity: isExiting ? 0 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 400,
      }}
      onDidAnimate={(prop, value) => {
        if (isExiting && prop === 'opacity' && (value as any) === 0) {
          onAnimationComplete?.();
        }
      }}
      style={styles.container}
    >
      {/* Soft, premium off-white radial-like gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#F5F5F9']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Soft Breathing Ambient Red Aura behind the logo */}
      <MotiView
        from={{ scale: 0.8, opacity: 0.3 }}
        animate={{ scale: 1.25, opacity: 0.6 }}
        transition={{
          type: 'timing',
          duration: 3000,
          loop: true,
          repeatReverse: true,
        }}
        style={styles.ambientAura}
      />

      <View style={styles.content}>
        {/* Floating Brand Badge */}
        <MotiView
          from={{ 
            scale: 0.7, 
            opacity: 0,
            translateY: 30 
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            translateY: 0 
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 110,
          }}
          style={styles.logoCard}
        >
          <Image
            source={require('../../../assets/whitebglogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </MotiView>
        
        {/* Brand Text & Tagline Container */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 350,
          }}
          style={styles.textContainer}
        >
          <Image 
            source={require('../../../assets/logotext.png')}
            style={styles.logoText}
            resizeMode="contain"
          />
          
          <Text style={styles.tagline}>
            ROOTED IN FAITH  ·  GROWING IN GRACE
          </Text>
        </MotiView>
      </View>

      {/* Premium Minimalist Progress Loader */}
      <View style={styles.loaderContainer}>
        <View style={styles.progressTrack}>
          <MotiView
            animate={{
              width: width * 0.45 * progressWidth,
            }}
            transition={{
              type: 'timing',
              duration: 250,
            }}
            style={styles.progressBar}
          />
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  ambientAura: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(255, 59, 48, 0.05)', // Extremely soft red brand bloom
    filter: 'blur(30px)', // Beautiful soft blur
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoCard: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    // Premium multi-layered shadow for 3D elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoText: {
    width: width * 0.42,
    height: 38,
    tintColor: '#000000', // Crisp branding contrast
  },
  tagline: {
    fontFamily: theme.fonts.medium,
    fontSize: 9,
    letterSpacing: 2,
    color: '#8E8E93', // Muted gray subheading
    marginTop: 14,
    fontWeight: '500',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: height * 0.12,
    alignItems: 'center',
  },
  progressTrack: {
    width: width * 0.45,
    height: 2.5,
    backgroundColor: '#E5E5EA', // Thin light grey track
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3B30', // Vibrant brand accent fill
    borderRadius: 99,
  },
});
