import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Smart Kitchen' }} />
        <Stack.Screen name="recipes/index" options={{ title: '食谱列表' }} />
        <Stack.Screen name="fridge/index" options={{ title: '我的冰箱' }} />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
