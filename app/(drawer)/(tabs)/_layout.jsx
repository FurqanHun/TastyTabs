import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import IndexScreen from "./index";
import SearchScreen from "./search";
import VaultScreen from "./vault";

const Tab = createMaterialTopTabNavigator();

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const theme = {
    bg: isDark ? (isAmoled ? "#000000" : "#121212") : "white",
    inactive: isDark ? "#888" : "gray",
    borderTop: isDark ? (isAmoled ? "#222" : "#333") : "#eee",
  };

  return (
    <Tab.Navigator
      initialRouteName="index"
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#FF6347",
        tabBarInactiveTintColor: theme.inactive,
        tabBarIndicatorStyle: { backgroundColor: "#FF6347", top: 0 },
        tabBarStyle: {
          backgroundColor: theme.bg,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: theme.borderTop,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
          textTransform: "none",
        },
        tabBarShowIcon: true,
        swipeEnabled: true,
      })}
    >
      <Tab.Screen
        name="index"
        component={IndexScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant" size={20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="search"
        component={SearchScreen}
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="vault"
        component={VaultScreen}
        options={{
          title: "My Vault",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
