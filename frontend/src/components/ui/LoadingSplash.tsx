import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { MotiView, MotiImage } from 'moti';
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

  useEffect(() => {
    if (!isLoading && !isExiting) {
      // Delay exit slightly to let entrance finish if app loads too fast
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <MotiView
      animate={{
        opacity: isExiting ? 0 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 500,
      }}
      onDidAnimate={(prop, value) => {
        if (isExiting && prop === 'opacity' && (value as any) === 0) {
          onAnimationComplete?.();
        }
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={[theme.colors.background, '#1A1A1A', theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background Glow Effect */}
      <MotiView
        from={{ scale: 0.6, opacity: 0.2 }}
        animate={{ scale: 1.2, opacity: 0.4 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
          repeatReverse: true,
        }}
        style={styles.glow}
      >
        <LinearGradient
          colors={[theme.colors.accent + '40', 'transparent']}
          style={styles.glowGradient}
        />
      </MotiView>

      <View style={styles.content}>
        <MotiImage
          source={require('../../../assets/whitebglogo.png')}
          from={{ 
            scale: 0.4, 
            opacity: 0,
            translateY: 20 
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            translateY: 0 
          }}
          transition={{
            type: 'spring',
            damping: 12,
            stiffness: 100,
            delay: 100,
          }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 400,
          }}
          style={styles.textContainer}
        >
          <Image 
            source={require('../../../assets/logotext.png')}
            style={styles.logoText}
            resizeMode="contain"
          />
        </MotiView>
      </View>

      {/* Subtle indicator */}
      <MotiView
        from={{ width: 0 }}
        animate={{ width: width * 0.4 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
        }}
        style={styles.progressBar}
      />
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
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.8) / 2,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.2,
    height: width * 0.2,
    marginBottom: 24,
  },
  textContainer: {
    height: 40,
    width: width * 0.4,
  },
  logoText: {
    width: '100%',
    height: '100%',
    tintColor: theme.colors.textPrimary,
  },
  progressBar: {
    position: 'absolute',
    bottom: height * 0.15,
    height: 2,
    backgroundColor: theme.colors.accent,
    borderRadius: 1,
    opacity: 0.5,
  },
});
