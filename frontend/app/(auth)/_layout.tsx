import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import theme from '@/theme';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    // Return the stack but don't redirect yet. Root layout handles the splash screen holding.
  } else if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="welcome" />
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
