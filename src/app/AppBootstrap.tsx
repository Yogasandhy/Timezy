import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppNavigation } from './navigation/AppNavigation';
import { LoadingScreen } from './LoadingScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { preferenceStorage } from '../features/tasks/data/localTaskRepository';
import { useTasks } from '../features/tasks/state/TaskContext';
import { colors, spacing } from '../shared/theme/tokens';
import { PrimaryButton } from '../shared/components/PrimaryButton';
import { useAuth } from '../features/auth/state/AuthContext';
import { AuthScreen } from '../features/auth/screens/AuthScreen';

const WELCOME_KEY = 'timezy.welcome.v1';

export function AppBootstrap() {
  const { user, initializing: authInitializing } = useAuth();
  const { loading, loaded, error, refresh } = useTasks();
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    preferenceStorage.getItem(WELCOME_KEY)
      .then(value => { if (active) setWelcomeSeen(value === 'done'); })
      .catch(() => { if (active) setWelcomeSeen(false); });
    return () => { active = false; };
  }, []);

  if (authInitializing || welcomeSeen === null || (user !== null && loading)) return <LoadingScreen />;

  if (!welcomeSeen) {
    return <WelcomeScreen onStart={() => {
      setWelcomeSeen(true);
      preferenceStorage.setItem(WELCOME_KEY, 'done').catch(() => undefined);
    }} />;
  }

  if (!user) return <AuthScreen />;

  if (!loaded || error) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>Your tasks are safe</Text>
        <Text style={styles.errorBody}>{error ?? 'We could not load your saved tasks.'}</Text>
        <Text style={styles.errorHint}>Nothing was overwritten. Try reading the saved data again.</Text>
        <PrimaryButton label="Try again" onPress={() => refresh()} style={styles.retry} />
      </View>
    );
  }

  return <AppNavigation />;
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, backgroundColor: colors.canvas, justifyContent: 'center', padding: spacing.xl },
  errorTitle: { color: colors.textPrimary, fontSize: 25, fontWeight: '800' },
  errorBody: { color: colors.danger, lineHeight: 22, marginTop: spacing.lg },
  errorHint: { color: colors.textSecondary, lineHeight: 21, marginTop: spacing.sm },
  retry: { marginTop: spacing.xl },
});
