import { Stack } from 'expo-router';
import React from 'react';

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      {/* Tasks List Screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      {/* Task Details Screen */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
