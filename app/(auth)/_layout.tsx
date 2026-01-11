import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { useMode } from "../../src/context/ModeContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const { mode } = useMode();

  // If authenticated and has mode, redirect to app tabs
  // Otherwise, root layout will handle showing onboarding
  if (isAuthenticated && mode) {
    return <Redirect href={"/(app)/(tabs)/tasks" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
