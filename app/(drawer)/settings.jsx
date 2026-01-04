import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { toggleAmoled, toggleTheme } from "../../store/Slices/preferencesSlice";
import {
  clearAllNotes,
  setAllNotes,
} from "../../store/Slices/personalNotesSlice";
import {
  clearAllPersonalRecipes,
  setAllPersonalRecipes,
} from "../../store/Slices/personalrecipesSlice";
import { clearVault, setVaultItems } from "../../store/Slices/vaultSlice";
import { getAllMeals } from "../../store/Slices/recipeSlice";
import { File, Directory, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

// --- HELPER FUNCTIONS FOR IMAGE CONVERSION ---

const convertImagesToBase64 = async (recipes) => {
  // console.log("Starting Backup Conversion...");

  return Promise.all(
    recipes.map(async (recipe) => {
      let newRecipe = { ...recipe };

      const imagePath = newRecipe.image || newRecipe.strMealThumb;

      if (imagePath && !imagePath.startsWith("http")) {
        // console.log("Found local image to convert:", imagePath);

        try {
          const base64 = await FileSystemLegacy.readAsStringAsync(imagePath, {
            encoding: FileSystemLegacy.EncodingType.Base64,
          });

          const dataString = `data:image/jpeg;base64,${base64}`;

          newRecipe.image = dataString;
          newRecipe.strMealThumb = dataString;

          console.log("Success: Converted image for", newRecipe.strMeal);
        } catch (_) {
          // console.error("Backup Conversion Failed for:", newRecipe.strMeal, e);
          // We don't null it here, we leave the path so at least the text backup works
        }
      } else {
        // console.log("Skipping (No image or Web URL):", newRecipe.strMeal);
      }
      return newRecipe;
    }),
  );
};

const restoreImagesFromBase64 = async (recipes) => {
  return Promise.all(
    recipes.map(async (recipe) => {
      let newRecipe = { ...recipe };

      // Check if image is encoded data
      if (newRecipe.image && newRecipe.image.startsWith("data:image")) {
        try {
          // console.log("Found backup image for:", newRecipe.strMeal);

          const fileName = `restored_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

          if (!FileSystemLegacy.documentDirectory) {
            throw new Error("Document Directory is invalid");
          }

          const newPath = FileSystemLegacy.documentDirectory + fileName;

          // Extract raw base64 string
          const parts = newRecipe.image.split(",");
          if (parts.length < 2) throw new Error("Invalid Base64 format");
          const base64Data = parts[1];

          // Write to file system
          await FileSystemLegacy.writeAsStringAsync(newPath, base64Data, {
            encoding: FileSystemLegacy.EncodingType.Base64,
          });

          // Verify file exists immediately
          const info = await FileSystemLegacy.getInfoAsync(newPath);
          if (!info.exists) throw new Error("File write verification failed");

          newRecipe.image = newPath;
        } catch (e) {
          Alert.alert(
            "Image Restore Failed",
            `Could not restore image for ${newRecipe.strMeal}\n${e.message}`,
          );
          // console.log("Restore Error:", e);
          // Keep the old string so we don't lose data, or set null?
          // we keeping the null for now to prevent app crash on render
          newRecipe.image = null;
        }
      } else if (newRecipe.image && newRecipe.image.startsWith("file://")) {
        // If we see file:// here after a Clear Data, it means it's a broken link.
        // Alert the user that they restored a Text-Only backup.
        // (Optional: remove the broken link)
        // console.log(
        //   "Found broken link (Text-Only backup restored):",
        //   newRecipe.image,
        // );
        newRecipe.image = null;
      }

      return newRecipe;
    }),
  );
};

const cleanupRecipeImages = async (recipes) => {
  if (!recipes || recipes.length === 0) return;
  // console.log("Starting physical cleanup of images...");

  for (const recipe of recipes) {
    const imagePath = recipe.image || recipe.strMealThumb;

    // Check if it's a local file (not http and not base64 data)
    if (
      imagePath &&
      !imagePath.startsWith("http") &&
      !imagePath.startsWith("data:")
    ) {
      try {
        // idempotent: true means "don't crash if file is already gone"
        await FileSystemLegacy.deleteAsync(imagePath, { idempotent: true });
        // console.log("Deleted physical file:", imagePath);
      } catch (_) {
        // console.log("Could not delete file (might be system restricted):", e);
      }
    }
  }
};

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Redux States
  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const allRecipes = useSelector((state) => state.personalrecipes.allmyrecipes);
  const allNotes = useSelector((state) => state.personalNotes.notes);
  const allVault = useSelector((state) => state.vault.items);

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  const BG_COLOR = getThemeColor("#F8F9FA", "#121212", "#000000");
  const CARD_COLOR = getThemeColor("#FFFFFF", "#1E1E1E", "#121212");
  const MODAL_BG = getThemeColor("#FFFFFF", "#1E1E1E", "#121212");
  const TEXT_COLOR = isDark ? "#FFFFFF" : "#1A1A1A";
  const SUBTEXT_COLOR = isDark ? "#AAAAAA" : "#666666";
  const ICON_COLOR = isDark ? "#FFFFFF" : "#333333";
  const BORDER_COLOR = isDark ? "#333333" : "#F0F0F0";

  const dynamicStyles = {
    container: { backgroundColor: BG_COLOR },
    text: { color: TEXT_COLOR },
    sectionBg: { backgroundColor: CARD_COLOR },
    subText: { color: SUBTEXT_COLOR },
  };

  // --- DATA MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selection, setSelection] = useState({
    recipes: false,
    vault: false,
    notes: false,
    cache: false,
  });

  // --- HANDLERS ---
  const openDataModal = (type) => {
    setActionType(type);
    const defaultState = type === "BACKUP";
    setSelection({
      recipes: defaultState,
      vault: defaultState,
      notes: defaultState,
      cache: false,
    });
    setModalVisible(true);
  };

  const toggleSelection = (key) => {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveBackupFile = async (dataString) => {
    const fileName = `TastyTabs_Backup_${
      new Date().toISOString().split("T")[0]
    }.json`;

    try {
      if (Platform.OS === "android") {
        // ANDROID MODERN: Pick Directory -> Create File -> Write
        const directory = await Directory.pickDirectoryAsync();
        if (directory) {
          // Create the file in the chosen folder
          // The second argument 'application/json' is the MIME type
          const file = directory.createFile(fileName, "application/json");
          file.write(dataString);
          Alert.alert("Success", "Backup saved securely!");
        }
      } else {
        // iOS MODERN: Create in Docs -> Share
        // Paths.document gives us the app's document folder
        const file = new File(Paths.document, fileName);
        file.create();
        file.write(dataString);

        // Share Sheet (Save to Files)
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            UTI: "public.json",
            mimeType: "application/json",
            dialogTitle: "Save Backup File",
          });
        } else {
          Alert.alert("Error", "Sharing not available");
        }
      }
    } catch (e) {
      // console.error(e);
      if (e.message?.includes("cancelled")) {
        return;
      }
      Alert.alert("Error", "Failed to save backup.");
    }
  };

  // THE MASTER BACKUP FUNCTION
  const proceedWithBackup = async (includeImages) => {
    try {
      const backupData = {};

      if (selection.recipes) {
        if (includeImages) {
          // Heavy mode: Convert files to string
          backupData.recipes = await convertImagesToBase64(allRecipes);
        } else {
          // Light mode: Just raw data
          backupData.recipes = allRecipes;
        }
      }

      if (selection.vault) backupData.vault = allVault;
      if (selection.notes) backupData.notes = allNotes;

      const backupString = JSON.stringify(backupData, null, 2);
      await saveBackupFile(backupString);
    } catch (_) {
      // console.error(error);
      Alert.alert("Backup Error", "Could not generate backup file.");
    }
  };

  const executeAction = async () => {
    const selectedKeys = Object.keys(selection).filter((k) => selection[k]);

    if (selectedKeys.length === 0) {
      return Alert.alert("Wait!", "Please select at least one item.");
    }

    // --- BACKUP FLOW ---
    if (actionType === "BACKUP") {
      if (selection.recipes) {
        // Ask about images
        Alert.alert(
          "Include Local Images?",
          "Backing up images makes the file much larger but lets you restore photos on other devices.\n\n(Web images are always saved).",
          [
            {
              text: "Text Only (Small)",
              onPress: () => proceedWithBackup(false),
            },
            {
              text: "Include Images",
              onPress: () => proceedWithBackup(true),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
        );
      } else {
        // No recipes selected, just proceed
        await proceedWithBackup(false);
      }
    }
    // --- DELETE FLOW ---
    else {
      const itemsText = selectedKeys
        .map((k) =>
          k === "cache"
            ? "Offline Cache"
            : k.charAt(0).toUpperCase() + k.slice(1),
        )
        .join(", ");

      Alert.alert("Final Warning", `Permanently delete: ${itemsText}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            if (selection.recipes) {
              await cleanupRecipeImages(allRecipes);
              dispatch(clearAllPersonalRecipes());
            }
            if (selection.vault) dispatch(clearVault());
            if (selection.notes) dispatch(clearAllNotes());
            if (selection.cache) {
              dispatch(getAllMeals([]));
              queryClient.removeQueries();
            }

            Alert.alert("Deleted", "Selected data has been wiped.");
          },
        },
      ]);
    }
    setModalVisible(false);
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const fileContent = await response.text();
      const parsedData = JSON.parse(fileContent);

      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Invalid backup file format.");
      }

      Alert.alert(
        "Confirm Restore",
        "This will overwrite your current data with the backup. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Restore",
            onPress: () => processRestore(parsedData),
          },
        ],
      );
    } catch (_) {
      // console.error(error);
      Alert.alert("Error", "Failed to restore backup. Invalid JSON.");
    }
  };

  const processRestore = async (data) => {
    let restoreCount = 0;

    if (data.recipes && Array.isArray(data.recipes)) {
      // RESTORE IMAGES: Convert strings back to files
      const fixedRecipes = await restoreImagesFromBase64(data.recipes);
      dispatch(setAllPersonalRecipes(fixedRecipes));
      restoreCount++;
    }
    if (data.vault && Array.isArray(data.vault)) {
      dispatch(setVaultItems(data.vault));
      restoreCount++;
    }
    if (data.notes && typeof data.notes === "object") {
      dispatch(setAllNotes(data.notes));
      restoreCount++;
    }

    if (restoreCount > 0) {
      Alert.alert("Success", "Data restored successfully!");
    } else {
      Alert.alert("Warning", "No valid data found in this backup file.");
    }
  };

  // --- UI COMPONENTS ---
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
        !isLast && { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
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

  // DYNAMIC TOGGLE LIST
  const toggleItems = [
    { key: "recipes", label: "My Recipes", icon: "restaurant" },
    { key: "vault", label: "Favorites / Vault", icon: "heart" },
    { key: "notes", label: "Personal Notes", icon: "document-text" },
  ];

  if (actionType === "DELETE") {
    toggleItems.push({
      key: "cache",
      label: "Offline Cache",
      icon: "cloud-offline",
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View style={[styles.header, { backgroundColor: BG_COLOR }]}>
          <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
        </View>

        {/* APPEARANCE */}
        <View style={[styles.section, dynamicStyles.sectionBg]}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <SettingRow
            icon={isDark ? "moon" : "moon-outline"}
            label="Dark Mode"
            isSwitch
            value={isDark}
            onValueChange={() => dispatch(toggleTheme())}
            isLast={!isDark}
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

        {/* DATA CONTROL (Opens Custom Modal) */}
        <View style={[styles.section, dynamicStyles.sectionBg]}>
          <Text style={styles.sectionLabel}>Data Control</Text>

          <SettingRow
            icon="cloud-upload-outline"
            label="Backup Data"
            subLabel="Select items to backup"
            onPress={() => openDataModal("BACKUP")}
          />

          <SettingRow
            icon="download-outline"
            label="Restore Data"
            subLabel="Restore from file"
            onPress={() => handleRestore()}
          />

          <SettingRow
            icon="trash-outline"
            label="Manage Storage"
            subLabel="Select items to clear"
            color="#FF3B30"
            onPress={() => openDataModal("DELETE")}
            isLast={true}
          />
        </View>

        {/* ABOUT */}
        <View style={[styles.section, dynamicStyles.sectionBg]}>
          <Text style={styles.sectionLabel}>About</Text>
          <View
            style={[
              styles.row,
              { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
            ]}
          >
            <Text style={[styles.rowText, dynamicStyles.text]}>
              App Version
            </Text>
            <Text style={[styles.subText, { color: SUBTEXT_COLOR }]}>
              1.0.0
            </Text>
          </View>
          <View
            style={[
              styles.row,
              { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
            ]}
          >
            <Text style={[styles.rowText, dynamicStyles.text]}>Developer</Text>
            <Text style={[styles.subText, { color: SUBTEXT_COLOR }]}>
              FAABS
            </Text>
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
          <Text style={[styles.version, { color: SUBTEXT_COLOR }]}>
            the only one
          </Text>
        </View>
      </ScrollView>

      {/* CUSTOM DATA ACTION MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[styles.modalContent, { backgroundColor: MODAL_BG }]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, dynamicStyles.text]}>
                    {actionType === "BACKUP"
                      ? "Backup Selection"
                      : "Delete Selection"}
                  </Text>
                  <Text
                    style={[styles.modalSubtitle, { color: SUBTEXT_COLOR }]}
                  >
                    {actionType === "BACKUP"
                      ? "Choose what to save."
                      : "Choose what to remove forever."}
                  </Text>
                </View>

                {/* Toggles */}
                <View style={styles.toggleContainer}>
                  {toggleItems.map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.toggleRow, { borderColor: BORDER_COLOR }]}
                      onPress={() => toggleSelection(item.key)}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={
                            selection[item.key] ? "#FF6347" : SUBTEXT_COLOR
                          }
                        />
                        <Text style={[styles.toggleLabel, dynamicStyles.text]}>
                          {item.label}
                        </Text>
                      </View>
                      <Switch
                        value={selection[item.key]}
                        onValueChange={() => toggleSelection(item.key)}
                        trackColor={{ true: "#FF6347", false: "#767577" }}
                        thumbColor={
                          Platform.OS === "ios"
                            ? undefined
                            : selection[item.key]
                              ? "#FF6347"
                              : "#f4f3f4"
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      styles.cancelBtn,
                      { borderColor: BORDER_COLOR },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: SUBTEXT_COLOR, fontWeight: "600" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      {
                        backgroundColor:
                          actionType === "DELETE" ? "#FF3B30" : "#FF6347",
                      },
                    ]}
                    onPress={executeAction}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                      {actionType === "DELETE"
                        ? "Delete Selected"
                        : "Backup Selected"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalSubtitle: { fontSize: 14, marginTop: 4 },
  toggleContainer: { gap: 10, marginBottom: 25 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleLabel: { fontSize: 16, fontWeight: "500" },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
});
