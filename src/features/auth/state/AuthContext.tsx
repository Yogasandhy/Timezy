import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from '@react-native-firebase/auth';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  error: string | null;
  clearError: () => void;
  createAccount: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const auth = getAuth();

function readableAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/email-already-in-use': return 'This email already has an account. Try signing in instead.';
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/weak-password': return 'Choose a stronger password with at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'The email or password is incorrect.';
    case 'auth/operation-not-allowed': return 'This sign-in method is not enabled in Firebase yet.';
    case 'auth/network-request-failed': return 'Check your internet connection and try again.';
    case 'auth/account-exists-with-different-credential': return 'An account already exists with this email. Sign in using its original method.';
    default: return error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, nextUser => {
    setUser(nextUser);
    setInitializing(false);
    setError(null);
  }), []);

  const run = useCallback(async (operation: () => Promise<unknown>) => {
    setError(null);
    try {
      await operation();
    } catch (cause) {
      setError(readableAuthError(cause));
      throw cause;
    }
  }, []);

  const createAccount = useCallback((email: string, password: string) => run(
    () => createUserWithEmailAndPassword(auth, email.trim(), password),
  ), [run]);

  const signIn = useCallback((email: string, password: string) => run(
    () => signInWithEmailAndPassword(auth, email.trim(), password),
  ), [run]);

  const signInWithGoogle = useCallback(() => run(async () => {
    GoogleOneTapSignIn.configure({ webClientId: 'autoDetect' });
    await GoogleOneTapSignIn.checkPlayServices();
    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) response = await GoogleOneTapSignIn.createAccount();
    if (isNoSavedCredentialFoundResponse(response)) response = await GoogleOneTapSignIn.presentExplicitSignIn();
    if (isCancelledResponse(response)) return;
    if (!isSuccessResponse(response) || !response.data.idToken) {
      throw new Error('Google did not return a sign-in token. Check your OAuth setup and try again.');
    }
    await signInWithCredential(auth, GoogleAuthProvider.credential(response.data.idToken));
  }), [run]);

  const sendPasswordReset = useCallback((email: string) => run(
    () => sendPasswordResetEmail(auth, email.trim()),
  ), [run]);

  const signOut = useCallback(() => run(async () => {
    await firebaseSignOut(auth);
    await GoogleOneTapSignIn.signOut().catch(() => undefined);
  }), [run]);

  const value = useMemo<AuthContextValue>(() => ({
    user, initializing, error, clearError: () => setError(null),
    createAccount, signIn, signInWithGoogle, sendPasswordReset, signOut,
  }), [user, initializing, error, createAccount, signIn, signInWithGoogle, sendPasswordReset, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
