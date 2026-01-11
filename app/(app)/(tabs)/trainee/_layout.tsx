import { Stack } from "expo-router";
import React from "react";

export default function TraineeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tasks"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
