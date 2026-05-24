import { useAuth, useUser } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import theme from '@/theme';

export default function AuthLayout() {
  const { isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  if (!isAuthLoaded || !isUserLoaded) {
    // Return nothing while loading so root layout handles splash
    return null;
  }

  if (user) {
    const hasCompletedOnboarding = user.unsafeMetadata?.onboardingComplete === true;
    if (hasCompletedOnboarding) {
      return <Redirect href="/(tabs)" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
      <Stack.Screen name="sign-in" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="sign-up" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
