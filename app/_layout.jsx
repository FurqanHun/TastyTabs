import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { persistor, store } from "../store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>

        {/* critical wrapper for the Drawer swipe to work */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" />
            {/* we add this so [id].jsx screen is part of the stack */}
            <Stack.Screen name="recipe/[id]" options={{ headerShown: true }} />
          </Stack>
        </GestureHandlerRootView>
          </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
