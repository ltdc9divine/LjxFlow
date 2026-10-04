import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { initializeDatabase } from '@/db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeDatabase();
      } catch (e) {
        console.error('[db] Failed to initialize database:', e);
      } finally {
        setIsDbReady(true);
      }
    }
    prepare();
  }, []);

  // Don't render the app until the database is initialized
  if (!isDbReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: 'modal',
                        title: 'Thêm giao dịch',
          }}
        />
      </Stack>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}



