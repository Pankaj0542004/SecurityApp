import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import LockScreen from '@/components/LockScreen';
import { AppLockService } from '@/services/AppLockService';
import { useColorScheme, View, Text } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1929' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Something went wrong:</Text>
      <Text style={{ color: '#EF4444', marginTop: 10 }}>{error.message}</Text>
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [isLocked, setIsLocked] = useState(false);
  const appLockService = new AppLockService();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const checkAppLock = async () => {
      const isEnabled = await appLockService.isAppLockEnabled();
      if (isEnabled) {
        setIsLocked(true);
      }
    };

    checkAppLock();
    appLockService.startAutoLock();

    return () => {
      appLockService.stopAutoLock();
    };
  }, []);

  const handleUnlock = async (password: string) => {
    const success = await appLockService.unlockApp(password);
    if (success) {
      setIsLocked(false);
      appLockService.startAutoLock();
    }
    return success;
  };

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#0A1929' : '#FFFFFF',
          },
        }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'none'
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{
            animation: 'none'
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ErrorBoundary>
  );
}
