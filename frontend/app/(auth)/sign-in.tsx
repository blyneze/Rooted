import React from 'react';
import { Redirect } from 'expo-router';

// Sign-in is now handled directly on the Welcome screen via Google OAuth.
// This redirect ensures any deep-links or old navigation to /(auth)/sign-in still work.
export default function SignInScreen() {
  return <Redirect href="/(auth)/welcome" />;
}
