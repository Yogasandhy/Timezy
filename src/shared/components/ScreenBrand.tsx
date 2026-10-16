import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { QuietStepsMark } from './QuietStepsMark';

export function ScreenBrand({ eyebrow, title, onSignOut }: { eyebrow: string; title: string; onSignOut?: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandLine}>
        <QuietStepsMark size={25} />
        <Text style={styles.brand}>Timezy</Text>
        {onSignOut ? <Pressable accessibilityRole="button" onPress={onSignOut} hitSlop={8}><Text style={styles.signOut}>Sign out</Text></Pressable> : null}
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brand: { color: colors.primary, fontWeight: '800', fontSize: 16, flex: 1 },
  signOut: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  eyebrow: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: spacing.md },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.6, marginTop: spacing.xs },
});
