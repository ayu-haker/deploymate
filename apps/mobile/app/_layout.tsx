import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0f19' },
          headerTintColor: '#38bdf8',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#090d16' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Project Overview' }} />
        <Stack.Screen name="deployment/[id]" options={{ title: 'Live Terminal' }} />
        <Stack.Screen name="ai-fix/[id]" options={{ title: 'AI Fix & Patch Review' }} />
      </Stack>
    </QueryClientProvider>
  );
}
