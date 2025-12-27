import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Custom Header Component ---
function CustomVVIPHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.floatingHeaderContainer}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconButton}
        >
          <Ionicons name="menu-outline" size={26} color="#ff6347" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#ff6347" />
        </TouchableOpacity>
      </View>

      <View style={styles.logoCircleContainer}>
        <Image
          source={require("../../assets/images/applogo.png")}
          style={styles.vvipLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// --- Side Drawer Content ---
function CustomDrawerContent(props) {
  const { state, navigation, descriptors } = props;

  // Check karna ke is waqt kaunsi screen active hai
  const activeRouteName = state.routes[state.index].name;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoOuterCircle}>
          <Image
            source={require("../../assets/images/shortlogo.png")}
            style={styles.drawerLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.drawerBrandName}>TastyTabs</Text>
        <Text style={styles.drawerSubText}>Premium Recipe Guide</Text>
      </View>

      {/* Top Section (Home, My Recipes etc.) */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        {state.routes.map((route, index) => {
          const { drawerLabel, drawerIcon, drawerItemStyle } =
            descriptors[route.key].options;

          if (
            route.name === "settings" ||
            drawerItemStyle?.display === "none"
          ) {
            return null;
          }

          const focused = activeRouteName === route.name;

          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.customDrawerItem,
                focused && styles.activeDrawerItem,
              ]}
              onPress={() => navigation.navigate(route.name)}
            >
              <View style={styles.itemContent}>
                {drawerIcon &&
                  drawerIcon({ color: focused ? "#fff" : "#333", size: 22 })}
                <Text
                  style={[
                    styles.itemLabel,
                    { color: focused ? "#fff" : "#333" },
                  ]}
                >
                  {typeof drawerLabel === "function"
                    ? drawerLabel({ color: "red" })
                    : drawerLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* --- Bottom Section (Settings) --- */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.customDrawerItem,
            activeRouteName === "settings" && styles.activeDrawerItem,
          ]}
          onPress={() => navigation.navigate("settings")}
        >
          <View style={styles.itemContent}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={activeRouteName === "settings" ? "#fff" : "#333"}
            />
            <Text
              style={[
                styles.itemLabel,
                { color: activeRouteName === "settings" ? "#fff" : "#333" },
              ]}
            >
              Settings
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.drawerFooter}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <CustomVVIPHeader />,
        drawerStyle: {
          width: 300,
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
          overflow: "hidden",
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color }) => (
            <Ionicons name="fast-food-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="mypersonalrecipe"
        options={{
          drawerLabel: "My Recipes",
          drawerIcon: ({ color }) => (
            <Ionicons name="restaurant-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Settings",
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />

      {/* 🦍 CONFLICT RESOLVED: recipe/[id] IS GONE.
          This route lives in app/_layout.jsx (Root Stack).
          We do not want it here. */}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    height: Platform.OS === "ios" ? 130 : 100,
    zIndex: 1000,
    backgroundColor: "#fff",
  },
  floatingHeaderContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 15,
    right: 15,
    marginTop: 14,
    height: 65,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 99, 71, 0.1)",
    zIndex: 10,
  },
  logoCircleContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 35 : 33,
    alignSelf: "center",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    zIndex: 11,
    borderWidth: 3,
    borderColor: "#fff5f4",
  },
  vvipLogo: { width: 60, height: 60 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff5f4",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerHeader: {
    height: 180,
    backgroundColor: "#ff6347",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: 60,
    marginBottom: 10,
  },
  logoOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerLogo: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#fff",
  },
  drawerBrandName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },
  drawerSubText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  // Custom Drawer Items Styling
  customDrawerItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    padding: 12,
  },
  activeDrawerItem: {
    backgroundColor: "#ff6347",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 15,
  },

  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: "#f4f4f4",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  drawerFooter: {
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: { color: "#bbb", fontSize: 11 },
});
