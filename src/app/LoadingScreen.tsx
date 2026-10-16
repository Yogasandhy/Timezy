import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../shared/theme/tokens';
import { QuietStepsMark } from '../shared/components/QuietStepsMark';

export function LoadingScreen({ message = 'Getting your day ready…' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <QuietStepsMark size={52} />
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  spinner: { marginTop: spacing.xl },
  message: { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
});
