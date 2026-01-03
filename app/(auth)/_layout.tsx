import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // If authenticated, redirect to tabs
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
