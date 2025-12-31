import { QueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../store/store";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { StatusBar } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

SplashScreen.preventAutoHideAsync();

// Configure Client to actually keep data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 30, // 30 Days
    },
  },
});

// Create the Bridge to Disk
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const AmoledTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#000000", // Pure Black
    card: "#121212", // Dark Grey Cards
    border: "#222",
  },
};

//WRAPPER COMPONENT
// We need this because we can't use 'useSelector' directly in RootLayout
// (because RootLayout is what *provides* the store, it's not *inside* it yet)
function MainLayout() {
  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const activeTheme = isDark
    ? isAmoled
      ? AmoledTheme
      : DarkTheme
    : DefaultTheme;

  return (
    <ThemeProvider value={activeTheme}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        // StatusBar Background: Black vs Dark Grey
        backgroundColor={
          isDark ? (isAmoled ? "#000000" : "#121212") : "transparent"
        }
        translucent={true}
      />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          {/* 🦍 NOTE: We hide the default header for recipe/[id]
              because we built a custom floating header inside that file.
          */}
          <Stack.Screen
            name="recipe/[id]"
            options={{ headerShown: false, presentation: "card" }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MainLayout />
        </PersistGate>
      </Provider>
    </PersistQueryClientProvider>
  );
}
