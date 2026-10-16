import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

export function TaskErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <Text style={styles.message}>{message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" hitSlop={8} onPress={onDismiss}>
        <Text style={styles.close}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#F9E7E5', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  message: { flex: 1, color: colors.danger, lineHeight: 20, fontSize: 13 },
  close: { color: colors.danger, fontSize: 24, fontWeight: '600' },
});
