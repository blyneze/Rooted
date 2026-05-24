import React from 'react';
import { Redirect } from 'expo-router';

// Sign-up is now handled directly on the Welcome screen via Google OAuth.
// This redirect ensures any deep-links or old navigation to /(auth)/sign-up still work.
export default function SignUpScreen() {
  return <Redirect href="/(auth)/welcome" />;
}
