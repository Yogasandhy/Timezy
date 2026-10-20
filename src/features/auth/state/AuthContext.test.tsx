import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { GoogleOneTapSignIn } from 'react-native-nitro-google-signin';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ name: 'test-auth' })),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  GoogleAuthProvider: { credential: jest.fn(() => ({ providerId: 'google.com' })) },
  signInWithCredential: jest.fn(),
}));

jest.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: {
    configure: jest.fn(),
    checkPlayServices: jest.fn(),
    presentExplicitSignIn: jest.fn(),
    signIn: jest.fn(),
    createAccount: jest.fn(),
  },
  isCancelledResponse: (response: { type: string }) => response.type === 'cancelled',
  isNoSavedCredentialFoundResponse: (response: { type: string }) => response.type === 'noSavedCredentialFound',
  isSuccessResponse: (response: { type: string; data: unknown }) => response.type === 'success' && response.data !== null,
}));

describe('Google sign-in', () => {
  let context: ReturnType<typeof useAuth>;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  let info: jest.SpyInstance;
  let warn: jest.SpyInstance;

  function AuthProbe() {
    context = useAuth();
    return null;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    info = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.mocked(GoogleOneTapSignIn.checkPlayServices).mockResolvedValue(undefined);
    jest.mocked(signInWithCredential).mockResolvedValue({} as Awaited<ReturnType<typeof signInWithCredential>>);
    await act(() => {
      renderer = ReactTestRenderer.create(<AuthProvider><AuthProbe /></AuthProvider>);
    });
  });

  afterEach(async () => {
    await act(() => renderer.unmount());
    info.mockRestore();
    warn.mockRestore();
  });

  it('opens the explicit account picker and only sends a returned token to Firebase', async () => {
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockResolvedValue({
      type: 'success',
      data: { idToken: 'private-google-token' } as never,
    });
    await act(() => context.signInWithGoogle());

    expect(GoogleOneTapSignIn.configure).toHaveBeenCalledWith({ webClientId: 'autoDetect' });
    expect(GoogleOneTapSignIn.checkPlayServices).toHaveBeenCalledTimes(1);
    expect(GoogleOneTapSignIn.presentExplicitSignIn).toHaveBeenCalledTimes(1);
    expect(GoogleOneTapSignIn.signIn).not.toHaveBeenCalled();
    expect(GoogleOneTapSignIn.createAccount).not.toHaveBeenCalled();
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('private-google-token');
    expect(signInWithCredential).toHaveBeenCalledWith({ name: 'test-auth' }, { providerId: 'google.com' });
    expect(context.error).toBeNull();
    expect(info.mock.calls.flat().join(' ')).not.toContain('private-google-token');
  });

  it('does not contact Firebase while the account picker is pending', async () => {
    let resolvePicker!: (response: { type: 'cancelled'; data: null }) => void;
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockReturnValue(new Promise(resolve => {
      resolvePicker = resolve;
    }));

    let pending!: Promise<void>;
    await act(() => {
      pending = context.signInWithGoogle();
    });
    expect(GoogleOneTapSignIn.presentExplicitSignIn).toHaveBeenCalledTimes(1);
    expect(signInWithCredential).not.toHaveBeenCalled();

    await act(async () => {
      resolvePicker({ type: 'cancelled', data: null });
      await pending;
    });
    expect(context.error).toBeNull();
  });

  it('treats an account-picker cancellation as cancellation without signing in', async () => {
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockResolvedValue({ type: 'cancelled', data: null });
    await act(() => context.signInWithGoogle());
    expect(signInWithCredential).not.toHaveBeenCalled();
    expect(context.error).toBeNull();
  });

  it.each([
    [{ type: 'noSavedCredentialFound', data: null }, 'No Google account is available.'],
    [{ type: 'success', data: { idToken: '' } }, 'Google did not return a sign-in token.'],
  ])('reports an unusable Google response without signing in: %j', async (response, message) => {
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockResolvedValue(response as never);
    await act(async () => {
      await expect(context.signInWithGoogle()).rejects.toThrow(message);
    });
    expect(context.error).toContain(message);
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('surfaces native picker errors instead of silently hiding them', async () => {
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockRejectedValue(new Error('Credential provider failed'));
    await act(async () => {
      await expect(context.signInWithGoogle()).rejects.toThrow('Credential provider failed');
    });
    expect(context.error).toBe('Credential provider failed');
    expect(warn).toHaveBeenCalledWith('[auth] Operation failed:', 'Credential provider failed');
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('stops before opening the picker when Play services is unavailable', async () => {
    jest.mocked(GoogleOneTapSignIn.checkPlayServices).mockRejectedValue(new Error('Play services unavailable'));
    await act(async () => {
      await expect(context.signInWithGoogle()).rejects.toThrow('Play services unavailable');
    });
    expect(context.error).toBe('Play services unavailable');
    expect(GoogleOneTapSignIn.presentExplicitSignIn).not.toHaveBeenCalled();
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('reports Firebase errors after Google returns a token', async () => {
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockResolvedValue({
      type: 'success', data: { idToken: 'private-google-token' } as never,
    });
    jest.mocked(signInWithCredential).mockRejectedValue({ code: 'auth/network-request-failed' });
    await act(async () => {
      await expect(context.signInWithGoogle()).rejects.toEqual({ code: 'auth/network-request-failed' });
    });
    expect(context.error).toBe('Check your internet connection and try again.');
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
  });
});
