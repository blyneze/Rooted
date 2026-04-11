import { useSignIn, useSignUp } from '@clerk/expo';
import { useClerk } from '@clerk/clerk-expo'; // whatever

const test = () => {
  const signInData = useSignIn();
  
  // See what is available:
  const keys = Object.keys(signInData);
}
