import { Stack } from 'expo-router';
import React from 'react';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      {/* Chat Conversations List Screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      {/* Chat Messages Screen */}
      <Stack.Screen
        name="[userModel]"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
