import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleAmoled, toggleTheme } from "../../store/Slices/preferencesSlice";

export default function SettingsScreen() {
  const dispatch = useDispatch();

  // Redux States
  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  const BG_COLOR = getThemeColor("#F8F9FA", "#121212", "#000000");
  const CARD_COLOR = getThemeColor("#FFFFFF", "#1E1E1E", "#121212"); // Card slightly lighter than black in Amoled
  const TEXT_COLOR = isDark ? "#FFFFFF" : "#1A1A1A";
  const SUBTEXT_COLOR = isDark ? "#AAAAAA" : "#666666";
  const ICON_COLOR = isDark ? "#FFFFFF" : "#333333";

  const dynamicStyles = {
    container: { backgroundColor: BG_COLOR },
    text: { color: TEXT_COLOR },
    sectionBg: { backgroundColor: CARD_COLOR },
    subText: { color: SUBTEXT_COLOR },
  };

  // --- HANDLERS ---
  const handleBackup = (type) => {
    Alert.alert("Backup", `${type} backup functionality coming soon!`);
  };

  const handleDeleteData = (type) => {
    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete all ${type}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log(`${type} deleted (placeholder)`),
        },
      ],
    );
  };

  const SettingRow = ({
    icon,
    label,
    subLabel,
    onPress,
    color,
    isSwitch,
    value,
    onValueChange,
    isLast,
  }) => (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333" : "#f0f0f0",
        },
      ]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
      >
        <Ionicons name={icon} size={22} color={color || ICON_COLOR} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowText, dynamicStyles.text]}>{label}</Text>
          {subLabel && (
            <Text
              style={[styles.subText, { fontSize: 12, color: SUBTEXT_COLOR }]}
            >
              {subLabel}
            </Text>
          )}
        </View>
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: "#FF6347", false: "#767577" }}
          thumbColor={
            Platform.OS === "ios" ? undefined : value ? "#FF6347" : "#f4f3f4"
          }
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? "#555" : "#CCC"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: BG_COLOR }]}>
        <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
      </View>

      {/* APPEARANCE SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Appearance</Text>

        <SettingRow
          icon={isDark ? "moon" : "moon-outline"}
          label="Dark Mode"
          isSwitch
          value={isDark}
          onValueChange={() => dispatch(toggleTheme())}
          isLast={!isDark} // If dark mode is off, this is the last item
        />

        {isDark && (
          <SettingRow
            icon="contrast"
            label="AMOLED Mode"
            subLabel="Pitch black background"
            isSwitch
            value={isAmoled}
            onValueChange={() => dispatch(toggleAmoled())}
            isLast={true}
          />
        )}
      </View>

      {/* BACKUP & RESTORE SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Backup & Restore</Text>
        <SettingRow
          icon="cloud-upload-outline"
          label="Backup All Data"
          onPress={() => handleBackup("Full Data")}
        />
        <SettingRow
          icon="receipt-outline"
          label="Backup Recipes Only"
          onPress={() => handleBackup("Recipes")}
        />
        <SettingRow
          icon="download-outline"
          label="Restore from Backup"
          onPress={() => Alert.alert("Restore", "Coming soon.")}
          isLast={true}
        />
      </View>

      {/* DATA MANAGEMENT SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Data Management</Text>
        <SettingRow
          icon="heart-dislike-outline"
          label="Clear Favourites"
          color="#FF3B30"
          onPress={() => handleDeleteData("Vault")}
        />
        <SettingRow
          icon="document-text-outline"
          label="Clear Personal Notes"
          color="#FF3B30"
          onPress={() => handleDeleteData("Notes")}
        />
        <SettingRow
          icon="trash-outline"
          label="Delete All Personal Recipes"
          color="#FF3B30"
          onPress={() => handleDeleteData("Personal Recipes")}
          isLast={true}
        />
      </View>

      {/* ABOUT SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>About</Text>

        <View
          style={[
            styles.row,
            {
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#333" : "#f0f0f0",
            },
          ]}
        >
          <Text style={[styles.rowText, dynamicStyles.text]}>App Version</Text>
          <Text style={[styles.subText, { color: SUBTEXT_COLOR }]}>1.0.0</Text>
        </View>

        <View
          style={[
            styles.row,
            {
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#333" : "#f0f0f0",
            },
          ]}
        >
          <Text style={[styles.rowText, dynamicStyles.text]}>Developer</Text>
          <Text style={[styles.subText, { color: SUBTEXT_COLOR }]}>FAABS</Text>
        </View>

        <TouchableOpacity
          style={[styles.row, { paddingVertical: 14 }]}
          onPress={() => router.push("/privacypolicy")}
        >
          <Text style={[styles.rowText, dynamicStyles.text]}>
            Privacy Policy
          </Text>
          <Ionicons name="open-outline" size={16} color={SUBTEXT_COLOR} />
        </TouchableOpacity>
      </View>

      <View style={styles.aboutBox}>
        <Ionicons name="fast-food" size={40} color="#FF6347" />
        <Text style={[styles.appName, dynamicStyles.text]}>TastyTabs</Text>
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
    paddingVertical: 14,
  },
  rowText: { fontSize: 16, fontWeight: "500" },
  subText: { fontSize: 14 },
  aboutBox: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 20,
  },
  appName: { fontSize: 24, fontWeight: "800", marginTop: 10 },
  version: { fontSize: 14, marginTop: 4 },
  credits: { fontSize: 14, marginTop: 4 },
});
