import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import YouTube from "react-native-youtube-iframe";
import { useDispatch, useSelector } from "react-redux";

import { fetchMealById } from "../../api/mealdetail";
import { clearNote, saveNote } from "../../store/Slices/personalNotesSlice";
import { toggleVaultItem } from "../../store/Slices/vaultSlice";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { width } = useWindowDimensions();
  // Standard 16:9 aspect ratio
  const VIDEO_HEIGHT = width * (9 / 16);
  // Calculate status bar height for the "Spacer"
  const STATUS_BAR_HEIGHT =
    Platform.OS === "ios" ? 48 : StatusBar.currentHeight || 24;

  const modalInputRef = useRef(null);
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMealById(id),
  });

  const isVaulted = useSelector((state) => {
    const items = Array.isArray(state.vault)
      ? state.vault
      : state.vault.items || [];
    return items.some((item) => item.idMeal === id);
  });

  const personalNote = useSelector(
    (state) => state.personalNotes.notes[id] || "",
  );
  const [note, setNote] = useState(personalNote);
  const [tempNote, setTempNote] = useState(personalNote);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    if (isNoteModalVisible) {
      const timer = setTimeout(() => modalInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isNoteModalVisible]);

  const openNoteModal = () => {
    setTempNote(note);
    setNoteModalVisible(true);
  };
  const saveAndCloseModal = () => {
    setNote(tempNote);
    dispatch(saveNote({ recipeId: id, text: tempNote }));
    setNoteModalVisible(false);
  };
  const handleToggleVault = () => {
    if (meal) dispatch(toggleVaultItem(meal));
  };

  const getIngredientsList = () => {
    if (!meal) return [];
    let list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const msr = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        list.push({ name: ing.trim(), measure: msr ? msr.trim() : "" });
      }
    }
    return list;
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    try {
      const arr = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      return undefined !== arr[2] ? arr[2].split(/[^0-9a-z_\-]/i)[0] : arr[0];
    } catch (_) {
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  const videoId = getYouTubeId(meal?.strYoutube);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      {/* 🦍 Use Dark Background for StatusBar when playing video */}
      <StatusBar
        barStyle={playVideo ? "light-content" : "dark-content"}
        backgroundColor={playVideo ? "#fff" : "#fff"}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {/* 🦍 THE FIX: Invisible Spacer View (pushes video down) */}
      {playVideo && (
        <View
          style={{
            height: STATUS_BAR_HEIGHT,
            backgroundColor: "#fff",
            width: "100%",
          }}
        />
      )}

      {/* Floating Header (Only when NOT playing) */}
      {!playVideo && (
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleToggleVault}>
            <Ionicons
              name={isVaulted ? "heart" : "heart-outline"}
              size={24}
              color={isVaulted ? "#FF6347" : "#333"}
            />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.container}
        // 🦍 FIX: Keep background white so corners look clean
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        {/* HERO WRAPPER */}
        <View
          style={[
            styles.heroWrapper,
            {
              // 🦍 LOGIC: If playing video, add 30px to the height.
              // This 30px is the "sacrifice" area that the card will cover up.
              height: playVideo ? VIDEO_HEIGHT + 30 : 350,
            },
          ]}
        >
          {playVideo && videoId ? (
            <View style={{ flex: 1, backgroundColor: "#000" }}>
              <YouTube
                height={VIDEO_HEIGHT}
                play={true}
                videoId={videoId}
                width={width}
                webViewProps={{
                  allowsFullscreenVideo: true,
                  androidLayerType: "hardware",
                }}
              />
              {/* The bottom 30px here is empty black space, which gets covered by the card */}
            </View>
          ) : (
            <Image
              source={{ uri: meal?.strMealThumb }}
              style={styles.heroImage}
            />
          )}
        </View>

        {/* CARD CONTENT */}
        <View
          style={[
            styles.card,
            // 🦍 FIX: MARGIN IS ALWAYS -30.
            // This ensures the rounded "sheet" look never breaks.
            { marginTop: -30 },
          ]}
        >
          {/* Close Button Inside Card */}
          {playVideo && (
            <TouchableOpacity
              style={styles.inlineCloseBtn}
              onPress={() => setPlayVideo(false)}
            >
              <Ionicons name="close-circle" size={20} color="#FF6347" />
              <Text style={styles.inlineCloseText}>Close Video</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>{meal?.strMeal}</Text>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{meal?.strCategory}</Text>
            </View>
            <View style={[styles.tag, { marginLeft: 10 }]}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={[styles.tagText, { marginLeft: 4 }]}>
                {meal?.strArea}
              </Text>
            </View>
          </View>

          {meal?.strYoutube && !playVideo && (
            <TouchableOpacity
              style={styles.ytBtn}
              onPress={() => setPlayVideo(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-youtube" size={20} color="#fff" />
              <Text style={styles.ytText}>Watch Tutorial</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {getIngredientsList().map((item, idx) => {
              const ingUrl = `https://www.themealdb.com/images/ingredients/${item.name.replace(/ /g, "_")}-small.png`;
              return (
                <View key={idx} style={styles.ingredientItem}>
                  <View style={styles.ingredientImageContainer}>
                    <Image
                      source={{ uri: ingUrl }}
                      style={styles.ingredientImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientMeasure}>{item.measure}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Instructions</Text>
          <Text style={styles.instructions}>{meal?.strInstructions}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>My Personal Note</Text>
          <TouchableOpacity
            style={styles.notePreviewWrapper}
            onPress={openNoteModal}
            activeOpacity={0.9}
          >
            {note.length > 0 ? (
              <Text style={styles.notePreviewText}>{note}</Text>
            ) : (
              <Text style={styles.notePlaceholderText}>
                Tap to add a personal note...
              </Text>
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          {note.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                dispatch(clearNote(id));
                setNote("");
                setTempNote("");
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#FF6347" />
              <Text style={styles.clearText}>Clear Note</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* MODAL (UNCHANGED) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isNoteModalVisible}
        onRequestClose={saveAndCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={saveAndCloseModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.popOutBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Note</Text>
              <TouchableOpacity onPress={saveAndCloseModal}>
                <Ionicons name="checkmark-circle" size={30} color="#FF6347" />
              </TouchableOpacity>
            </View>
            <TextInput
              ref={modalInputRef}
              style={styles.modalInput}
              multiline
              value={tempNote}
              onChangeText={setTempNote}
              placeholder="Type your thoughts here..."
              placeholderTextColor="#999"
            />
            <Text style={styles.modalHint}>Tap checkmark to save</Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  inlineCloseBtn: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFF0ED",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inlineCloseText: {
    color: "#FF6347",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },

  floatingHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    right: 20,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  heroWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    // zIndex is important here to make sure video layer is below the card layer
    zIndex: 1,
  },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },

  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500,
    // Ensure card is above the video/hero
    zIndex: 2,
  },

  title: { fontSize: 26, fontWeight: "800", color: "#333", marginBottom: 10 },
  tagRow: { flexDirection: "row", marginBottom: 20 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 14, color: "#555", fontWeight: "600" },

  ytBtn: {
    flexDirection: "row",
    backgroundColor: "#FF6347",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#FF6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ytText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 10,
    marginBottom: 15,
  },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 24 },

  ingredientsList: { gap: 12 },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 10,
    borderRadius: 12,
  },
  ingredientImageContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  ingredientImage: { width: 35, height: 35 },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  ingredientMeasure: { fontSize: 14, color: "#888", marginTop: 2 },

  instructions: {
    fontSize: 16,
    lineHeight: 28,
    color: "#444",
    textAlign: "left",
  },

  notePreviewWrapper: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 16,
    minHeight: 80,
    justifyContent: "center",
  },
  notePreviewText: { fontSize: 15, color: "#333", lineHeight: 22 },
  notePlaceholderText: { fontSize: 15, color: "#999", fontStyle: "italic" },
  editIconBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FF6347",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  clearBtn: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  clearText: {
    color: "#FF6347",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  popOutBox: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#333" },
  modalInput: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalHint: { textAlign: "right", color: "#CCC", fontSize: 12, marginTop: 10 },
});
