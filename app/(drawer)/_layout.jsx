import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  // Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// const { width } = Dimensions.get("window");

function CustomVVIPHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.floatingHeaderContainer}>
        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconButton}
        >
          <Ionicons name="menu-outline" size={26} color="#ff6347" />
        </TouchableOpacity>

        {/* Right Side Icon (Balance ke liye) */}
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
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        {/* <TouchableOpacity style={styles.logoutBtn}>
           <Ionicons name="log-out-outline" size={20} color="#ff6347" />
           <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>*/}
        <Text style={styles.footerText}>Version 1.0.0</Text>
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
        header: () => <CustomVVIPHeader />, // Default header hata kar custom component lagaya
        drawerStyle: {
          width: 300,
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
          overflow: "hidden",
        },
        drawerActiveBackgroundColor: "#ff6347",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { fontSize: 16, fontWeight: "700" },
        drawerItemStyle: { borderRadius: 12, marginHorizontal: 12 },
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

      {/* <Drawer.Screen
        name="recipe/[id]"
        options={{
          drawerLabel: () => null,
          drawerItemStyle: { display: "none" }, // Menu list se hide ho jayega
          title: "Recipe Detail",
        }}
      />*/}
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
    marginTop: Platform.OS === "ios" ? 14 : 14,
    height: 65,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 11,
    borderWidth: 3,
    borderColor: "#fff5f4",
  },
  vvipLogo: {
    width: 60,
    height: 60,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff5f4",
    justifyContent: "center",
    alignItems: "center",
  },

  drawerHeader: {
    height: 200,
    backgroundColor: "#ff6347",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: 60,
  },
  logoOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
  drawerBrandName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
  },
  drawerSubText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  drawerFooter: {
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  logoutText: {
    marginLeft: 10,
    color: "#ff6347",
    fontWeight: "800",
  },
  footerText: {
    color: "#bbb",
    fontSize: 11,
    textAlign: "center",
  },
});
