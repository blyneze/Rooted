import { Redirect } from 'expo-router';
import { useUser } from '@clerk/expo';

export default function Index() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (user) {
    const hasCompletedOnboarding = user.unsafeMetadata?.onboardingComplete === true;
    if (!hasCompletedOnboarding) {
      return <Redirect href="/(auth)/onboarding" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
