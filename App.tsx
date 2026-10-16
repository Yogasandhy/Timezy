/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppBootstrap } from './src/app/AppBootstrap';
import { TaskProvider } from './src/features/tasks/state/TaskContext';
import { AuthProvider } from './src/features/auth/state/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <TaskProvider>
          <AppBootstrap />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
