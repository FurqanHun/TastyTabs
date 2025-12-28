import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
// 🦍 IMPORT NEW ACTION
import { toggleTheme, toggleAmoled } from "../../store/Slices/preferencesSlice";

export default function SettingsScreen() {
  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const BG_COLOR = isDark ? (isAmoled ? "#000000" : "#121212") : "#F8F9FA";
  const CARD_COLOR = isDark ? (isAmoled ? "#121212" : "#1C1C1E") : "#FFFFFF";
  const TEXT_COLOR = isDark ? "#FFFFFF" : "#1A1A1A";

  const dynamicStyles = {
    container: { backgroundColor: BG_COLOR },
    text: { color: TEXT_COLOR },
    sectionBg: { backgroundColor: CARD_COLOR },
    subText: { color: isDark ? "#AAAAAA" : "#666666" },
  };

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: dynamicStyles.container.backgroundColor },
        ]}
      >
        <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
      </View>

      {/* APPEARANCE SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Appearance</Text>

        {/* DARK MODE TOGGLE */}
        <View style={styles.row}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons
              name={isDark ? "moon" : "moon-outline"}
              size={22}
              color={dynamicStyles.text.color}
            />
            <Text style={[styles.rowText, dynamicStyles.text]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => dispatch(toggleTheme())}
            trackColor={{ true: "#FF6347", false: "#767577" }}
            thumbColor={isDark ? "#fff" : "#f4f3f4"}
          />
        </View>

        {/*AMOLED TOGGLE (Only visible if Dark Mode is ON) */}
        {isDark && (
          <View
            style={[
              styles.row,
              {
                borderTopWidth: 1,
                borderTopColor: isAmoled ? "#333" : "#2c2c2e",
                marginTop: 10,
                paddingTop: 10,
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons
                name="contrast"
                size={22}
                color={dynamicStyles.text.color}
              />
              <View>
                <Text style={[styles.rowText, dynamicStyles.text]}>
                  AMOLED Mode
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Pitch black background
                </Text>
              </View>
            </View>
            <Switch
              value={isAmoled}
              onValueChange={() => dispatch(toggleAmoled())}
              trackColor={{ true: "#FF6347", false: "#767577" }}
              thumbColor={isAmoled ? "#fff" : "#f4f3f4"}
            />
          </View>
        )}
      </View>

      {/* ABOUT SECTION */}
      <View style={styles.aboutBox}>
        <Ionicons name="fast-food" size={40} color="#FF6347" />
        <Text style={[styles.appName, dynamicStyles.text]}>TastyTabs</Text>
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={[styles.credits, dynamicStyles.subText]}>
          FAABS (without A)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 30, fontWeight: "800" },
  section: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowText: { fontSize: 16, fontWeight: "500" },
  aboutBox: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 20,
  },
  appName: { fontSize: 24, fontWeight: "800", marginTop: 10 },
  version: { fontSize: 14, color: "#888", marginTop: 4 },
  credits: { fontSize: 14, marginTop: 4 },
});
