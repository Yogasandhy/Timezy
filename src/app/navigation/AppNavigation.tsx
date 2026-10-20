import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarScreen } from '../../features/tasks/screens/CalendarScreen';
import { TaskFormScreen } from '../../features/tasks/screens/TaskFormScreen';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { TodayScreen } from '../../features/tasks/screens/TodayScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { InsightsScreen } from '../../features/tasks/screens/InsightsScreen';
import { colors } from '../../shared/theme/tokens';
import { MainTabParamList, RootStackParamList } from './types';
import { NeumorphicTabBar } from './NeumorphicTabBar';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function renderTabBar(props: BottomTabBarProps) {
  return <NeumorphicTabBar {...props} />;
}

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="Today" component={TodayScreen} />
      <Tabs.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Planner' }}
      />
      <Tabs.Screen name="Tasks" component={TasksScreen} />
      <Tabs.Screen name="Insights" component={InsightsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
export function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
