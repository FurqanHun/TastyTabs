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
  Modal,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { MealCard } from "../../components/MealCard";
import { appendMeals } from "../../store/Slices/recipeSlice";

// Stable Constants
const CACHE_KEY = "TASTYTABS_LUCKY_PICK_OBJ";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 Hours
// const CACHE_DURATION = 10 * 1000; // 🦍 10 Sec Test Mode

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
};

// --- Custom Header Component ---
function CustomVVIPHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  // LUCKY MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [luckyMeal, setLuckyMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isReadyToRoll, setIsReadyToRoll] = useState(false);

  const fetchNewLuckyMeal = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://www.themealdb.com/api/json/v1/1/random.php",
      );

      if (response.data.meals) {
        const meal = response.data.meals[0];
        const now = Date.now();

        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            meal: meal,
            timestamp: now,
          }),
        );

        //feed Redux immediately upon fetch
        dispatch(appendMeals([meal]));

        setLuckyMeal(meal);
        setTimeLeft(formatTime(CACHE_DURATION));
        setIsReadyToRoll(false);
        setLoading(false);
        return true;
      }
    } catch (_) {
      setLoading(false);
      Alert.alert(
        "Connection Error",
        "Could not fetch a lucky recipe. Check your internet!",
      );
      return false;
    }
  };

  const handleSurprise = async () => {
    setModalVisible(true);
    setLoading(true);

    const now = Date.now();
    const cached = await AsyncStorage.getItem(CACHE_KEY);

    if (cached) {
      const { meal, timestamp } = JSON.parse(cached);
      if (now - timestamp < CACHE_DURATION) {
        //feed Redux immediately upon Cache Hit
        dispatch(appendMeals([meal]));

        setLuckyMeal(meal);
        const diff = timestamp + CACHE_DURATION - now;
        setTimeLeft(formatTime(diff));
        setIsReadyToRoll(false);
        setLoading(false);
        return;
      }
    }

    await fetchNewLuckyMeal();
  };

  useEffect(() => {
    let interval;
    if (modalVisible && luckyMeal && !loading) {
      const checkTimer = async () => {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          const now = Date.now();
          const diff = timestamp + CACHE_DURATION - now;

          if (diff <= 0) {
            setTimeLeft("Ready to Roll!");
            setIsReadyToRoll(true);
            if (interval) clearInterval(interval);
          } else {
            setTimeLeft(formatTime(diff));
            setIsReadyToRoll(false);
          }
        }
      };

      checkTimer();
      interval = setInterval(checkTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [modalVisible, luckyMeal, loading]);

  const isRestricted =
    pathname.includes("settings") || pathname.includes("personal");

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

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

  const modalBg = getThemeColor("white", "#1e1e1e", "#121212");
  const modalText = getThemeColor("#333", "#fff", "#fff");

  return (
    <View style={[styles.headerWrapper, bgStyle]}>
      <View style={[styles.floatingHeaderContainer, floatStyle]}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={[styles.iconButton, btnStyle]}
        >
          <Ionicons name="menu-outline" size={26} color="#ff6347" />
        </TouchableOpacity>

        {/* THE DICE BUTTON */}
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

      {/* LUCKY RECIPE MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
                {/* HEADER */}
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 24, marginRight: 5 }}>🍀</Text>
                    <Text style={[styles.modalTitle, { color: modalText }]}>
                      Lucky Pick
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#ff6347" />
                  </TouchableOpacity>
                </View>

                {/* LOADING */}
                {loading ? (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#ff6347" />
                    <Text
                      style={{
                        color: "#888",
                        marginTop: 15,
                        fontWeight: "600",
                      }}
                    >
                      Rolling the dice...
                    </Text>
                  </View>
                ) : (
                  // CONTENT
                  luckyMeal && (
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{
                        alignItems: "center",
                        paddingBottom: 20,
                      }}
                      style={{ width: "100%" }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.cardWrapper}
                        onPress={() => {
                          // Safety Dispatch before Nav (Card Press)
                          dispatch(appendMeals([luckyMeal]));
                          setModalVisible(false);
                          router.push(`/recipe/${luckyMeal.idMeal}`);
                        }}
                      >
                        <View pointerEvents="none">
                          <MealCard
                            meal={luckyMeal}
                            style={{ width: "100%" }}
                          />
                        </View>
                      </TouchableOpacity>

                      <View style={styles.timerContainer}>
                        <Ionicons
                          name={isReadyToRoll ? "sparkles" : "time-outline"}
                          size={18}
                          color={isReadyToRoll ? "#ff6347" : "#888"}
                        />
                        <Text
                          style={[
                            styles.timerLabel,
                            { color: isReadyToRoll ? "#ff6347" : "#888" },
                          ]}
                        >
                          {isReadyToRoll ? "Cooldown Over!" : "Next roll in: "}{" "}
                          <Text
                            style={{ color: "#ff6347", fontWeight: "bold" }}
                          >
                            {!isReadyToRoll && timeLeft}
                          </Text>
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.visitBtn,
                          isReadyToRoll && { backgroundColor: "#32CD32" },
                        ]}
                        onPress={() => {
                          if (isReadyToRoll) {
                            fetchNewLuckyMeal();
                          } else {
                            // Safety Dispatch before Nav (Button Press)
                            dispatch(appendMeals([luckyMeal]));
                            setModalVisible(false);
                            router.push(`/recipe/${luckyMeal.idMeal}`);
                          }
                        }}
                      >
                        <Text style={styles.visitBtnText}>
                          {isReadyToRoll ? "Roll Again !" : "Cook This Now!"}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  )
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
      <Drawer.Screen
        name="privacypolicy"
        options={{
          drawerItemStyle: { display: "none" },
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

  //MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "85%",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 5,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timerLabel: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  visitBtn: {
    backgroundColor: "#ff6347",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#ff6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  visitBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
