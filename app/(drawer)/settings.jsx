// import { Ionicons } from "@expo/vector-icons";
// import {
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { toggleTheme } from "../../store/Slices/preferencesSlice";

// export default function SettingsScreen() {
//   const dispatch = useDispatch();

//   const isDark = useSelector((state) => state.preferences.darkMode);

//   //DYNAMIC STYLES
//   const dynamicStyles = {
//     // Container: Dark Grey vs Light Grey
//     container: { backgroundColor: isDark ? "#121212" : "#F8F9FA" },
//     // Text: White vs Black
//     text: { color: isDark ? "#FFFFFF" : "#1A1A1A" },
//     // Cards: Lighter Grey vs White
//     sectionBg: { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
//     // Subtext: Light Grey vs Dark Grey
//     subText: { color: isDark ? "#AAAAAA" : "#666666" },
//   };

//   return (
//     <ScrollView
//       style={[styles.container, dynamicStyles.container]}
//       contentContainerStyle={{ paddingBottom: 50 }}
//     >
//       {/* HEADER */}
//       <View
//         style={[
//           styles.header,
//           { backgroundColor: dynamicStyles.container.backgroundColor },
//         ]}
//       >
//         <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
//       </View>

//       {/* APPEARANCE SECTION */}
//       <View style={[styles.section, dynamicStyles.sectionBg]}>
//         <Text style={styles.sectionLabel}>Appearance</Text>

//         <View style={styles.row}>
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
//             <Ionicons
//               name={isDark ? "moon" : "moon-outline"}
//               size={22}
//               color={dynamicStyles.text.color}
//             />
//             <Text style={[styles.rowText, dynamicStyles.text]}>Dark Mode</Text>
//           </View>

//           {/*THE TOGGLE */}
//           <Switch
//             value={isDark}
//             onValueChange={() => dispatch(toggleTheme())}
//             trackColor={{ true: "#FF6347", false: "#767577" }}
//             thumbColor={isDark ? "#fff" : "#f4f3f4"}
//           />
//         </View>
//       </View>

//       {/* ABOUT SECTION */}
//       <View style={styles.aboutBox}>
//         <Ionicons name="fast-food" size={40} color="#FF6347" />
//         <Text style={[styles.appName, dynamicStyles.text]}>TastyTabs</Text>
//         <Text style={styles.version}>v1.0.0</Text>
//         <Text style={[styles.credits, dynamicStyles.subText]}>
//           Developed by FAABS (without A).
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === "ios" ? 60 : 40,
//     paddingBottom: 15,
//     marginBottom: 10,
//   },
//   headerTitle: { fontSize: 30, fontWeight: "800" },

//   section: {
//     marginTop: 10,
//     marginHorizontal: 16,
//     borderRadius: 16,
//     padding: 16,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   sectionLabel: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#888",
//     marginBottom: 10,
//     textTransform: "uppercase",
//   },

//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//   },
//   rowText: { fontSize: 16, fontWeight: "500" },

//   aboutBox: {
//     alignItems: "center",
//     marginTop: 40,
//     paddingBottom: 20,
//   },
//   appName: { fontSize: 24, fontWeight: "800", marginTop: 10 },
//   version: { fontSize: 14, color: "#888", marginTop: 4 },
//   credits: { fontSize: 14, marginTop: 4 },
// });



import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { toggleTheme } from "../../store/Slices/preferencesSlice";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const BG_COLOR = isDark ? (isAmoled ? "#000000" : "#121212") : "#F8F9FA";
  const CARD_COLOR = isDark ? (isAmoled ? "#121212" : "#1C1C1E") : "#FFFFFF";
  const TEXT_COLOR = isDark ? "#FFFFFF" : "#1A1A1A";

  //DYNAMIC STYLES
  const dynamicStyles = {
    // Container: Dark Grey vs Light Grey
    container: { backgroundColor: isDark ? "#121212" : "#F8F9FA" },
    // Text: White vs Black
    text: { color: isDark ? "#FFFFFF" : "#1A1A1A" },
    // Cards: Lighter Grey vs White
    sectionBg: { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
    // Subtext: Light Grey vs Dark Grey
    subText: { color: isDark ? "#AAAAAA" : "#666666" },
    border: { borderColor: isDark ? "#333" : "#F0F0F0" }
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
          onPress: () => {
             // Yahan aap dispatch(clearVault()) waghaira call karenge
             console.log(`${type} deleted`);
          } 
        },
      ]
    );
  };

  // Helper component for Setting Rows
  const SettingRow = ({ icon, label, onPress, color, isSwitch, value, onValueChange }) => (
    <TouchableOpacity 
      style={[styles.row, dynamicStyles.border]} 
      onPress={onPress} 
      disabled={isSwitch}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? "#2C2C2E" : "#FFF5F4" }]}>
          <Ionicons name={icon} size={20} color={color || "#FF6347"} />
        </View>
        <Text style={[styles.rowText, dynamicStyles.text]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: "#FF6347", false: "#767577" }}
          thumbColor={isDark ? "#fff" : "#f4f3f4"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
      </View>

      {/* 1. APPEARANCE SECTION */}
      <View style={[styles.section, dynamicStyles.sectionBg]}>
        <Text style={styles.sectionLabel}>Appearance</Text>

        <View style={styles.row}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons
              name={isDark ? "moon" : "moon-outline"}
              size={22}
              color={dynamicStyles.text.color}
            />
            <Text style={[styles.rowText, dynamicStyles.text]}>Dark Mode</Text>
          </View>

          {/*THE TOGGLE */}
          <Switch
            value={isDark}
            onValueChange={() => dispatch(toggleTheme())}
            trackColor={{ true: "#FF6347", false: "#767577" }}
            thumbColor={isDark ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* APP LOGO AT BOTTOM */}
      <View style={styles.aboutBox}>
        <Ionicons name="fast-food" size={40} color="#FF6347" />
        <Text style={[styles.appName, dynamicStyles.text]}>TastyTabs</Text>
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={[styles.credits, dynamicStyles.subText]}>
          Developed by FAABS (without A).
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
  },
  headerTitle: { fontSize: 30, fontWeight: "800" },

  section: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6347",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: { fontSize: 16, fontWeight: "600" },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowText: { fontSize: 16, fontWeight: "500" },

  aboutBox: {
    alignItems: "center",
    marginTop: 30,
    paddingBottom: 20,
  },
  appName: { fontSize: 20, fontWeight: "800", marginTop: 10, letterSpacing: 1 },
});