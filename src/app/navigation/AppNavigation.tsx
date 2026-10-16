import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarScreen } from '../../features/tasks/screens/CalendarScreen';
import { TaskFormScreen } from '../../features/tasks/screens/TaskFormScreen';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { TodayScreen } from '../../features/tasks/screens/TodayScreen';
import { colors } from '../../shared/theme/tokens';
import { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const todayTabIcon = ({ focused }: { focused: boolean }) => <TabGlyph symbol="◷" focused={focused} />;
const calendarTabIcon = ({ focused }: { focused: boolean }) => <TabGlyph symbol="▦" focused={focused} />;
const tasksTabIcon = ({ focused }: { focused: boolean }) => <TabGlyph symbol="≡" focused={focused} />;

function TabGlyph({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View style={[styles.glyphWrap, focused && styles.glyphWrapActive]}>
      <Text style={[styles.glyph, focused && styles.glyphActive]}>{symbol}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen name="Today" component={TodayScreen} options={{ tabBarIcon: todayTabIcon }} />
      <Tabs.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: calendarTabIcon }} />
      <Tabs.Screen name="Tasks" component={TasksScreen} options={{ tabBarIcon: tasksTabIcon }} />
    </Tabs.Navigator>
  );
}

export function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 7,
    paddingBottom: 7,
    backgroundColor: colors.surface,
    borderTopColor: colors.outline,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 12,
  },
  tabLabel: { fontSize: 11, fontWeight: '700', marginTop: -1 },
  tabItem: { paddingTop: 2 },
  glyphWrap: { width: 36, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  glyphWrapActive: { backgroundColor: colors.primarySoft },
  glyph: { fontSize: 19, color: colors.textSecondary, fontWeight: '600' },
  glyphActive: { color: colors.primary },
});
