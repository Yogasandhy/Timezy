import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, AppIconName } from '../../shared/components/AppIcon';
import { colors, shadows, spacing } from '../../shared/theme/tokens';

const icons: Record<string, AppIconName> = {
  Today: 'today',
  Calendar: 'calendar',
  Tasks: 'tasks',
  Insights: 'insights',
  Profile: 'profile',
};

export function NeumorphicTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.dock,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityState={{ selected: focused }}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <View
                style={[styles.indicator, focused && styles.indicatorActive]}
              >
                <AppIcon
                  name={icons[route.name] ?? 'tasks'}
                  color={focused ? colors.primary : colors.textSecondary}
                  size={22}
                />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: colors.canvas,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.white,
    ...shadows.raised,
    boxShadow:
      '5px 5px 16px rgba(115, 133, 107, 0.17), -4px -4px 12px rgba(255, 255, 255, 0.85)',
  },
  tab: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 26,
    paddingVertical: 4,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  indicator: {
    width: '100%',
    maxWidth: 64,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    overflow: 'hidden',
  },
  indicatorActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#D0E1CB',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  labelActive: { color: colors.primary, fontWeight: '800' },
});
