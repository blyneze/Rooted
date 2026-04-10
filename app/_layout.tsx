import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import { View, StyleSheet } from 'react-native';
import theme from '@/theme';
import { AudioController } from '@/api/AudioController';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Clerk token cache using SecureStore
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function RootLayoutInner() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AudioController />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="search"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="message/[id]"
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="series/[id]"
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="playlist/[id]"
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <RootLayoutInner />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
