// app/screens/client/_layout.tsx

import { Stack } from 'expo-router';

export default function ClientLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}