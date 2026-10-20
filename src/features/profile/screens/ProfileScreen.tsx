import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../auth/state/AuthContext';
import { useTasks } from '../../tasks/state/TaskContext';
import { AppIcon } from '../../../shared/components/AppIcon';
import { ScreenBrand } from '../../../shared/components/ScreenBrand';
import { ScreenLayout } from '../../../shared/components/ScreenLayout';
import { Surface } from '../../../shared/components/Surface';
import { colors, radii, spacing } from '../../../shared/theme/tokens';

export function ProfileScreen() {
  const { user, error, clearError, signOut } = useAuth();
  const { tasks } = useTasks();
  const [signingOut, setSigningOut] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const name =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Timezy planner';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
  const googleAccount = user?.providerData.some(
    provider => provider.providerId === 'google.com',
  );
  const completed = tasks.filter(task => task.completedAt !== null).length;

  const leaveAccount = async () => {
    if (signingOut) return;
    clearError();
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      // AuthProvider supplies the error, so the user can retry from this screen.
      setSigningOut(false);
    }
  };

  const confirmSignOut = () =>
    Alert.alert(
      'Sign out of Timezy?',
      'Your saved tasks will stay in your account. Sign in again whenever you are ready.',
      [
        { text: 'Stay here', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: () => {
            leaveAccount();
          },
        },
      ],
    );

  return (
    <ScreenLayout>
      <ScreenBrand eyebrow="YOUR OWN LITTLE CORNER" title="Your profile" />

      <Surface style={styles.identityCard}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            {user?.photoURL && !photoFailed ? (
              <Image
                accessibilityLabel="Profile picture"
                source={{ uri: user.photoURL }}
                onError={() => setPhotoFailed(true)}
                style={styles.photo}
              />
            ) : (
              <Text style={styles.initials}>{initials}</Text>
            )}
          </View>
          <View style={styles.avatarBadge}>
            <AppIcon name="check" size={14} color={colors.white} />
          </View>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text selectable style={styles.email}>
          {user?.email ?? 'Your personal account'}
        </Text>
        <View style={styles.accountBadge}>
          <View style={styles.connectionDot} />
          <Text style={styles.accountBadgeText}>
            {googleAccount ? 'Connected with Google' : 'Connected with email'}
          </Text>
        </View>
      </Surface>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your little wins</Text>
        <Text style={styles.sectionHint}>Every step counts</Text>
      </View>
      <Surface style={styles.stats}>
        <ProfileStat value={tasks.length} label="All tasks" />
        <View style={styles.divider} />
        <ProfileStat value={completed} label="Completed" />
        <View style={styles.divider} />
        <ProfileStat value={tasks.length - completed} label="To go" />
      </Surface>

      <Text style={[styles.sectionTitle, styles.accountHeading]}>
        Your account
      </Text>
      <Surface style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <AppIcon name="profile" size={20} />
          </View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Sign-in method</Text>
            <Text style={styles.detailValue}>
              {googleAccount ? 'Google account' : 'Email & password'}
            </Text>
          </View>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <AppIcon name="shield" size={20} />
          </View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>A space that stays yours</Text>
            <Text style={styles.detailHint}>
              Your tasks are private to your account and available across your
              devices.
            </Text>
          </View>
        </View>
      </Surface>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        accessibilityState={{ disabled: signingOut, busy: signingOut }}
        disabled={signingOut}
        onPress={confirmSignOut}
        style={({ pressed }) => [
          styles.signOut,
          pressed && styles.pressed,
          signingOut && styles.disabled,
        ]}
      >
        <View style={styles.signOutIcon}>
          {signingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <AppIcon name="logout" color={colors.danger} />
          )}
        </View>
        <View style={styles.detailCopy}>
          <Text style={styles.signOutTitle}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Text>
          <Text style={styles.detailHint}>
            Your plans will be here when you return.
          </Text>
        </View>
        <AppIcon name="arrow" color={colors.danger} size={20} />
      </Pressable>
      <Text style={styles.footer}>A calmer day, one small step at a time.</Text>
    </ScreenLayout>
  );
}

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    paddingVertical: 28,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#EDF2E7',
    boxShadow:
      '5px 5px 14px rgba(115, 133, 107, 0.16), -4px -4px 12px rgba(255, 255, 255, 0.8)',
  },
  avatarRing: {
    width: 88,
    height: 88,
    padding: 7,
    borderRadius: 44,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.white,
    marginBottom: spacing.lg,
    boxShadow:
      'inset 3px 3px 7px rgba(115, 133, 107, 0.15), inset -3px -3px 7px #FFFFFF',
  },
  avatar: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  initials: { color: colors.primary, fontSize: 27, fontWeight: '800' },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#EDF2E7',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  email: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: '#E0EADB',
    borderRadius: radii.pill,
    marginTop: spacing.lg,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  accountBadgeText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  sectionHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 28,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionHint: { color: colors.textSecondary, fontSize: 11 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  stat: { flex: 1, alignItems: 'center', gap: 5 },
  statNumber: {
    fontSize: 25,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  statLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  divider: { width: 1, height: 30, backgroundColor: colors.outline },
  accountHeading: { marginTop: 28, marginBottom: spacing.md },
  details: { paddingVertical: spacing.sm },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { flex: 1 },
  detailLabel: { color: colors.textSecondary, fontSize: 11, marginBottom: 4 },
  detailValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  detailHint: { color: colors.textSecondary, fontSize: 12, lineHeight: 19 },
  detailDivider: { height: 1, backgroundColor: colors.outline, marginLeft: 52 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: '#F5EEE7',
    borderWidth: 1,
    borderColor: '#E9DCD1',
    padding: spacing.lg,
    marginTop: spacing.xxl,
  },
  signOutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0E1D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutTitle: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.lg,
  },
  footer: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 18,
  },
});
