import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inset?: boolean;
};

export function Surface({ children, style, inset = false }: Props) {
  return <View style={[styles.base, inset ? styles.inset : styles.raised, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1 },
  raised: { backgroundColor: colors.surface, borderColor: colors.white, ...shadows.raised },
  inset: { backgroundColor: colors.surfaceMuted, borderColor: colors.outline },
});
