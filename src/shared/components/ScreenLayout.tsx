import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';

export function ScreenLayout({ children, contentStyle, scroll = true }: {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, contentStyle]}>
          {children}
        </ScrollView>
      ) : <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>}
    </SafeAreaView>
  );
}

export const screenSpacing = spacing;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  fill: { flex: 1 },
});
