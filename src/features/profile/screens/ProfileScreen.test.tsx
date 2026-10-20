import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { ProfileScreen } from './ProfileScreen';

const mockSignOut = jest.fn();
const mockAuth = {
  user: {
    displayName: 'Test Planner',
    email: 'planner@example.com',
    photoURL: null,
    providerData: [{ providerId: 'google.com' }],
  },
  error: null,
  clearError: jest.fn(),
  signOut: mockSignOut,
};

jest.mock('../../auth/state/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('../../tasks/state/TaskContext', () => ({
  useTasks: () => ({
    tasks: [{ completedAt: null }, { completedAt: '2026-10-20T09:00:00.000Z' }],
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
}));

describe('ProfileScreen', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  let alert: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await act(() => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });
  });

  afterEach(async () => {
    await act(() => renderer.unmount());
    alert.mockRestore();
  });

  it('shows the signed-in identity and the account provider', () => {
    expect(
      renderer.root.findByProps({ children: 'Test Planner' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ children: 'planner@example.com' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ children: 'Google account' }),
    ).toBeTruthy();
  });

  it('waits for confirmation before signing out', async () => {
    await act(() =>
      renderer.root
        .findByProps({ accessibilityLabel: 'Sign out' })
        .props.onPress(),
    );
    expect(alert).toHaveBeenCalledWith(
      'Sign out of Timezy?',
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ style: 'cancel' })]),
    );
    expect(mockSignOut).not.toHaveBeenCalled();
    const confirm = alert.mock.calls[0][2].find(
      (button: { text: string }) => button.text === 'Sign out',
    );
    await act(async () => {
      confirm.onPress();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('allows another attempt when signing out fails', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('Network unavailable'));
    await act(() =>
      renderer.root
        .findByProps({ accessibilityLabel: 'Sign out' })
        .props.onPress(),
    );
    await act(async () => {
      alert.mock.calls[0][2][1].onPress();
    });
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Sign out' }).props
        .disabled,
    ).toBe(false);
  });
});
