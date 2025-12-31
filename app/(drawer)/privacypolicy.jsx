import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";

export default function PrivacyPolicy() {
  const router = useRouter();

  // 🦍 1. GET BOTH STATES
  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  // 🦍 2. HELPER
  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  // 🦍 3. DYNAMIC THEME COLORS (Clean Monke Style)
  const theme = {
    bg: getThemeColor("#F8F9FA", "#121212", "#000000"),
    card: getThemeColor("#FFFFFF", "#1E1E1E", "#121212"),
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subText: isDark ? "#AAAAAA" : "#666666",
    border: getThemeColor("#EEEEEE", "#333333", "#222222"),
    accent: "#FF6347",
  };

  const PolicySection = ({ title, content, icon }) => (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={22} color={theme.accent} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.sectionContent, { color: theme.subText }]}>
        {content}
      </Text>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.bg}
      />

      {/* Configure Header for Expo Router */}
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Privacy Policy",
        }}
      />

      {/* CUSTOM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Privacy Policy
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topInfo}>
          {/* 🦍 REMOVED PINK CIRCLE BACKGROUND */}
          <Ionicons
            name="shield-checkmark"
            size={60}
            color={theme.accent}
            style={{ marginBottom: 15 }}
          />
          <Text style={[styles.lastUpdated, { color: theme.subText }]}>
            Effective Date: December 2025
          </Text>
        </View>

        <PolicySection
          icon="lock-closed-outline"
          title="Data Sovereignty"
          content="TastyTabs operates on an offline-first architecture. All your personalized data, including custom recipes, personal notes, and vaulted items, is stored locally on your device. We do not host, store, or have access to your private content on any external servers."
        />

        <PolicySection
          icon="cloud-offline-outline"
          title="Backup & Cloud Services"
          content="The Backup and Restore functionality utilizes your local storage or your personal cloud accounts (such as iCloud or Google Drive). This process is handled directly through your device's native file system; TastyTabs does not intercept or transmit this data to third-party entities."
        />

        <PolicySection
          icon="analytics-outline"
          title="Anonymous Analytics"
          content="To improve application stability and performance, we may collect non-identifiable usage statistics. This data is strictly technical and does not include any information regarding your specific recipes, notes, or dietary preferences."
        />

        <PolicySection
          icon="shield-outline"
          title="System Permissions"
          content="TastyTabs requests access to specific system permissions only when necessary for core features. This includes Camera access for capturing recipe imagery and Storage access for export/import functionality. You may manage these permissions at any time via your device settings."
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.subText }]}>
            For any inquiries regarding this policy or your data privacy, please
            contact:
          </Text>
          <Text style={[styles.email, { color: theme.accent }]}>
            faabswear@protonmail.com
          </Text>
          <Text style={[styles.disclaimer, { color: theme.subText }]}>
            © 2025 TastyTabs. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  topInfo: {
    alignItems: "center",
    marginVertical: 30,
  },
  lastUpdated: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1, // 🦍 ADDED BORDER FOR STRUCTURE
    // 🦍 REMOVED HEAVY SHADOWS
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 10,
  },
  footerText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  email: { fontSize: 16, fontWeight: "800", marginTop: 8 },
  disclaimer: { fontSize: 12, marginTop: 24, fontWeight: "500" },
});
