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

  // Dynamic Colors
  const BG_COLOR = isDark ? (isAmoled ? "#000000" : "#121212") : "#F8F9FA";
  const CARD_COLOR = isDark ? (isAmoled ? "#121212" : "#1C1C1E") : "#FFFFFF";
  const TEXT_COLOR = isDark ? "#FFFFFF" : "#1A1A1A";
  const BORDER_COLOR = isDark ? "#2C2C2E" : "#EEEEEE";

  const dynamicStyles = {
    container: { backgroundColor: BG_COLOR },
    text: { color: TEXT_COLOR },
    sectionBg: { backgroundColor: CARD_COLOR },
    subText: { color: isDark ? "#AAAAAA" : "#666666" },
    border: { borderBottomColor: BORDER_COLOR }
  };

  // --- HANDLERS ---
  const handleBackup = (type) => {
    Alert.alert("Backup", `${type} ka backup cloud/local storage mein save ho gaya hai!`);
  };

  const handleDeleteData = (type) => {
    Alert.alert(
      "Delete Confirmation",
      `Kya aap waqai apna tamam ${type} delete karna chahte hain? Ye wapas nahi ayega.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => console.log(`${type} deleted`) 
        },
      ]
    );
  };

  // Helper component for Setting Rows
  const SettingRow = ({ icon, label, subLabel, onPress, color, isSwitch, value, onValueChange, showBorder = true }) => (
    <TouchableOpacity 
      style={[styles.row, showBorder && { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR }]} 
      onPress={onPress} 
      disabled={isSwitch}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? "#2C2C2E" : "#FFF5F4" }]}>
          <Ionicons name={icon} size={20} color={color || "#FF6347"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowText, dynamicStyles.text]}>{label}</Text>
          {subLabel && <Text style={[styles.subText, { fontSize: 12 }]}>{subLabel}</Text>}
        </View>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: "#FF6347", false: "#767577" }}
          thumbColor={Platform.OS === 'ios' ? undefined : (value ? "#FF6347" : "#f4f3f4")}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
      </View>

      {/* 1. APPEARANCE SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        
        <SettingRow 
          icon={isDark ? "moon" : "moon-outline"} 
          label="Dark Mode" 
          isSwitch 
          value={isDark} 
          onValueChange={() => dispatch(toggleTheme())}
          showBorder={isDark} 
        />

        {isDark && (
          <SettingRow 
            icon="contrast" 
            label="AMOLED Mode" 
            subLabel="Pitch black background"
            isSwitch 
            value={isAmoled} 
            onValueChange={() => dispatch(toggleAmoled())}
            showBorder={false}
          />
        )}
      </View>

      {/* 2. BACKUP & RESTORE SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Backup & Restore</Text>
        <SettingRow icon="cloud-upload-outline" label="Backup All Data" onPress={() => handleBackup("Full Data")} />
        <SettingRow icon="receipt-outline" label="Backup Recipes Only" onPress={() => handleBackup("Recipes")} />
        <SettingRow icon="download-outline" label="Restore from Backup" onPress={() => Alert.alert("Restore", "Latest backup restore kar diya gaya hai.")} showBorder={false} />
      </View>

      {/* 3. DATA MANAGEMENT SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Data Management</Text>
        <SettingRow icon="heart-dislike-outline" label="Clear Favourites" color="#FF3B30" onPress={() => handleDeleteData("Vault")} />
        <SettingRow icon="document-text-outline" label="Clear Personal Notes" color="#FF3B30" onPress={() => handleDeleteData("Notes")} />
        <SettingRow icon="trash-outline" label="Delete All Personal Recipes" color="#FF3B30" onPress={() => handleDeleteData("Personal Recipes")} showBorder={false} />
      </View>

      {/* 4. ABOUT SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.rowText, dynamicStyles.text]}>App Version</Text>
          <Text style={dynamicStyles.subText}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.rowText, dynamicStyles.text]}>Developer</Text>
          <Text style={dynamicStyles.subText}>FAABS (without A)</Text>
        </View>
        <TouchableOpacity style={[styles.aboutRow, { borderBottomWidth: 0 }]} onPress={() => router.push("/privacypolicy")}>
          <Text style={[styles.rowText, dynamicStyles.text]}>Privacy Policy</Text>
          <Ionicons name="open-outline" size={16} color="#888" />
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
  },
  headerTitle: { fontSize: 32, fontWeight: "800" },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    // Shadow for Light Mode
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginTop: 10,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: { fontSize: 16, fontWeight: "500" },
  subText: { fontSize: 14, color: "#666" },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent' // Default
  },
  aboutBox: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 40,
  },
  appName: { fontSize: 24, fontWeight: "800", marginTop: 10 },
});