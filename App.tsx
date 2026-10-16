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

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <TaskProvider>
        <AppBootstrap />
      </TaskProvider>
    </SafeAreaProvider>
  );
}
