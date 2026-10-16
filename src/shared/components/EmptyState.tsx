import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { QuietStepsMark } from './QuietStepsMark';

type Props = { title: string; body: string };

export function EmptyState({ title, body }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}><QuietStepsMark size={30} color={colors.primary} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  mark: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, marginBottom: spacing.lg },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  body: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
});
