import { Stack } from 'expo-router';
import React from 'react';

export default function UserModelLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      {/* Chat with specific user */}
      <Stack.Screen
        name="[userId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
