import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      {/* critical wrapper for the Drawer swipe to work */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          {/* we add this so [id].jsx screen is part of the stack */}
          <Stack.Screen name="recipe/[id]" options={{ headerShown: true }} />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}
