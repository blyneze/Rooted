import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { MotiView } from 'moti';
import theme from '@/theme';

const { width } = Dimensions.get('window');

interface LoadingSplashProps {
  onAnimationComplete?: () => void;
  isLoading: boolean;
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({
  onAnimationComplete,
  isLoading,
}) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    if (!isLoading && phase !== 'exit') {
      // Data is ready — brief hold then exit
      const timer = setTimeout(() => setPhase('exit'), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    // After the logo animates in, move to "hold"
    const timer = setTimeout(() => {
      if (phase === 'enter') setPhase('hold');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MotiView
      pointerEvents={phase === 'exit' ? 'none' : 'auto'}
      animate={{
        opacity: phase === 'exit' ? 0 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 350,
      }}
      onDidAnimate={(prop, finished) => {
        if (phase === 'exit' && prop === 'opacity') {
          onAnimationComplete?.();
        }
      }}
      style={styles.container}
    >
      {/* Logo — scales and fades in */}
      <MotiView
        from={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 600,
        }}
        style={styles.logoWrapper}
      >
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    zIndex: 9999,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
});
