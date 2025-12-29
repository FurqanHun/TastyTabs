import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter, usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🦍 IMPORT THIS

// --- Custom Header Component ---
function CustomVVIPHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  // THE SMART "LUCKY" HANDLER
  const handleSurprise = async () => {
    const CACHE_KEY = "TASTYTABS_LUCKY_PICK";
    const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 Hours in milliseconds

    try {
      const now = Date.now();
      const cached = await AsyncStorage.getItem(CACHE_KEY);

      //chek if we have a saved pick
      if (cached) {
        const { id, timestamp } = JSON.parse(cached);

        // freshness check (less than 4 hours old)
        if (now - timestamp < CACHE_DURATION) {
          // console.log("Using Cached Lucky Pick:", id);
          router.push(`/recipe/${id}`);
          return;
        }
      }

      // no cache or expired, fetch a new one
      // console.log("Fetching New Lucky Pick...");
      const response = await axios.get(
        "https://www.themealdb.com/api/json/v1/1/random.php",
      );

      if (response.data.meals) {
        const randomId = response.data.meals[0].idMeal;

        //save for next time
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            id: randomId,
            timestamp: now,
          }),
        );

        router.push(`/recipe/${randomId}`);
      }
    } catch (_) {
      // console.log("No banana found:", e);
    }
  };

  // Hide on settings screens
  const isRestricted =
    pathname.includes("settings") || pathname.includes("personal");

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  // Dynamic Styles
  const bgStyle = {
    backgroundColor: getThemeColor("#fff", "#121212", "#000000"),
  };

  const floatStyle = {
    backgroundColor: getThemeColor(
      "rgba(255, 255, 255, 0.98)",
      "rgba(30,30,30,0.98)",
      "#000000",
    ),
    borderColor: getThemeColor("rgba(255, 99, 71, 0.1)", "#333", "#222"),
  };

  const circleStyle = {
    backgroundColor: getThemeColor("#fff", "#121212", "#000000"),
    borderColor: getThemeColor("#fff5f4", "#333", "#222"),
  };

  const btnStyle = {
    backgroundColor: getThemeColor("#fff5f4", "#2c2c2e", "#121212"),
  };

  return (
    <View style={[styles.headerWrapper, bgStyle]}>
      <View style={[styles.floatingHeaderContainer, floatStyle]}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={[styles.iconButton, btnStyle]}
        >
          <Ionicons name="menu-outline" size={26} color="#ff6347" />
        </TouchableOpacity>

        {/* 🦍 THE DICE BUTTON */}
        {!isRestricted ? (
          <TouchableOpacity
            style={[styles.iconButton, btnStyle]}
            onPress={handleSurprise}
          >
            <Ionicons name="dice-outline" size={24} color="#ff6347" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={[styles.logoCircleContainer, circleStyle]}>
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
  const activeRouteName = state.routes[state.index].name;

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  // Dynamic Styles
  const containerStyle = {
    backgroundColor: getThemeColor("#fff", "#121212", "#000000"),
  };

  const bottomSectionStyle = {
    borderTopColor: getThemeColor("#f4f4f4", "#333", "#222"),
  };

  const textIconColor = isDark ? "#eee" : "#333";
  const iconInactiveColor = isDark ? "#ccc" : "#333";

  return (
    <View style={[{ flex: 1 }, containerStyle]}>
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

      {/* Top Section */}
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
                  drawerIcon({
                    color: focused ? "#fff" : iconInactiveColor,
                    size: 22,
                  })}

                <Text
                  style={[
                    styles.itemLabel,
                    { color: focused ? "#fff" : textIconColor },
                  ]}
                >
                  {typeof drawerLabel === "function"
                    ? drawerLabel({
                        color: focused ? "#fff" : textIconColor,
                      })
                    : drawerLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* --- Bottom Section (Settings) --- */}
      <View style={[styles.bottomSection, bottomSectionStyle]}>
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
              color={
                activeRouteName === "settings" ? "#fff" : iconInactiveColor
              }
            />
            <Text
              style={[
                styles.itemLabel,
                {
                  color:
                    activeRouteName === "settings" ? "#fff" : textIconColor,
                },
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
          backgroundColor: "transparent",
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
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    height: Platform.OS === "ios" ? 130 : 100,
    zIndex: 1000,
  },
  floatingHeaderContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 15,
    right: 15,
    marginTop: 14,
    height: 65,
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
    zIndex: 10,
  },
  logoCircleContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 35 : 33,
    alignSelf: "center",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    zIndex: 11,
    borderWidth: 3,
  },
  vvipLogo: { width: 60, height: 60 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  drawerFooter: {
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: { color: "#bbb", fontSize: 11 },
});
