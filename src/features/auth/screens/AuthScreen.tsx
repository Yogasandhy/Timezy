import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../state/AuthContext';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { QuietStepsMark } from '../../../shared/components/QuietStepsMark';
import { Surface } from '../../../shared/components/Surface';
import { KeyboardAwareScrollView } from '../../../shared/components/KeyboardAwareScrollView';
import { colors, radii, spacing } from '../../../shared/theme/tokens';

export function AuthScreen() {
  const {
    error,
    clearError,
    createAccount,
    signIn,
    signInWithGoogle,
    sendPasswordReset,
  } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (operation: () => Promise<void>) => {
    setNotice(null);
    setBusy(true);
    try {
      await operation();
    } catch {
      // AuthProvider exposes a user-facing message.
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(() =>
      mode === 'sign-up'
        ? createAccount(email, password)
        : signIn(email, password),
    );

  const resetPassword = () =>
    run(async () => {
      await sendPasswordReset(email);
      setNotice('Password reset link sent. Check your inbox.');
    });

  const changeMode = () => {
    clearError();
    setNotice(null);
    setMode(current => (current === 'sign-in' ? 'sign-up' : 'sign-in'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <QuietStepsMark size={38} />
          <Text style={styles.brandName}>Timezy</Text>
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>YOUR TASKS, WHEREVER YOU ARE</Text>
          <Text style={styles.title}>
            {mode === 'sign-in' ? 'Welcome back.' : 'Create your account.'}
          </Text>
          <Text style={styles.subtitle}>
            Sign in to keep your plans safely in sync across devices.
          </Text>
        </View>

        <Surface style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={value => {
              setEmail(value);
              clearError();
            }}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
            style={styles.input}
          />

          <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete={
              mode === 'sign-up' ? 'new-password' : 'current-password'
            }
            onChangeText={value => {
              setPassword(value);
              clearError();
            }}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
            value={password}
            style={styles.input}
            onSubmitEditing={submit}
          />

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {notice ? (
            <Text accessibilityRole="status" style={styles.notice}>
              {notice}
            </Text>
          ) : null}

          <PrimaryButton
            label={mode === 'sign-up' ? 'Create account' : 'Sign in'}
            loading={busy}
            disabled={busy || !email.trim() || password.length < 6}
            onPress={submit}
            style={styles.primary}
          />

          {mode === 'sign-in' ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy || !email.trim()}
              onPress={resetPassword}
              style={styles.forgotButton}
            >
              <Text
                style={[
                  styles.link,
                  (busy || !email.trim()) && styles.disabledLink,
                ]}
              >
                Forgot password?
              </Text>
            </Pressable>
          ) : null}

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            onPress={() => run(signInWithGoogle)}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googlePressed,
              busy && styles.disabledButton,
            ]}
          >
            <Text style={styles.googleMark}>G</Text>
            <Text style={styles.googleLabel}>Continue with Google</Text>
          </Pressable>
        </Surface>

        <View style={styles.modeRow}>
          <Text style={styles.modeCopy}>
            {mode === 'sign-in'
              ? "Don't have an account?"
              : 'Already have an account?'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={changeMode}
          >
            <Text style={styles.link}>
              {mode === 'sign-in' ? 'Create one' : 'Sign in'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  brandName: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  intro: { marginBottom: spacing.xl },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  card: { padding: spacing.xl },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  passwordLabel: { marginTop: spacing.lg },
  input: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  notice: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  primary: { marginTop: spacing.xl },
  forgotButton: { alignSelf: 'flex-end', paddingVertical: spacing.md },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  disabledLink: { opacity: 0.45 },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outline,
  },
  separatorText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  googleButton: {
    minHeight: 50,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  googlePressed: { opacity: 0.8 },
  disabledButton: { opacity: 0.55 },
  googleMark: { color: '#4285F4', fontSize: 18, fontWeight: '800' },
  googleLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  modeCopy: { color: colors.textSecondary, fontSize: 14 },
});
