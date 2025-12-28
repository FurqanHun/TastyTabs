import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
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

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const { width } = useWindowDimensions();
  const VIDEO_HEIGHT = width * (9 / 16);
  const STATUS_BAR_HEIGHT =
    Platform.OS === "ios" ? 48 : StatusBar.currentHeight || 24;

  const modalInputRef = useRef(null);
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  const personalRecipes = useSelector(
    (state) => state.personalrecipes?.allmyrecipes || [],
  );
  const personalMeal = personalRecipes.find(
    (r) => String(r.idMeal) === String(id),
  );

  const { data: apiMeal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMealById(id),
    enabled: !personalMeal,
  });

  const meal = personalMeal || apiMeal;

  const isVaulted = useSelector((state) => {
    const items = Array.isArray(state.vault)
      ? state.vault
      : state.vault.items || [];
    return items.some((item) => String(item.idMeal) === String(id));
  });

  const personalNote = useSelector(
    (state) => state.personalNotes.notes[id] || "",
  );
  const [note, setNote] = useState(personalNote);
  const [tempNote, setTempNote] = useState(personalNote);

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  const theme = {
    bg: getThemeColor("#fff", "#121212", "#000000"),
    cardBg: getThemeColor("#fff", "#1E1E1E", "#000000"),
    text: isDark ? "#fff" : "#333",
    subText: isDark ? "#aaa" : "#555",
    border: getThemeColor("#F0F0F0", "#333", "#222"),
    tagBg: getThemeColor("#F0F0F0", "#333", "#222"),
    tagText: isDark ? "#ccc" : "#555",
    ingBg: getThemeColor("#FAFAFA", "#2C2C2E", "#121212"),
    noteBg: getThemeColor("#FAFAFA", "#252525", "#121212"),
    modalBg: getThemeColor("#fff", "#1E1E1E", "#121212"),
    inputColor: isDark ? "#fff" : "#333",
    iconBtnBg: isDark ? "rgba(30,30,30,0.8)" : "rgba(255,255,255,0.95)",
    iconBtnBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    iconColor: isDark ? "#fff" : "#333",
  };

  useEffect(() => {
    setNote(personalNote);
    setTempNote(personalNote);
  }, [personalNote]);

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
    if (personalMeal && Array.isArray(meal.ingredients)) {
      return meal.ingredients.map((item) => ({
        name: item.name || item,
        measure: item.measure || "",
        image: item.image,
      }));
    }

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

  if (isLoading && !personalMeal) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Recipe not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 10 }}
        >
          <Text style={{ color: "#FF6347" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const videoId = getYouTubeId(meal?.strYoutube);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar
        barStyle={
          playVideo
            ? "light-content"
            : isDark
              ? "light-content"
              : "dark-content"
        }
        backgroundColor={
          playVideo
            ? "#000"
            : isDark
              ? isAmoled
                ? "#000000"
                : "#121212"
              : "#fff"
        }
      />
      <Stack.Screen options={{ headerShown: false }} />

      {playVideo && (
        <View
          style={{
            height: STATUS_BAR_HEIGHT,
            backgroundColor: "#000",
            width: "100%",
          }}
        />
      )}

      {!playVideo && (
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.iconBtnBg }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.iconBtnBg }]}
            onPress={handleToggleVault}
          >
            <Ionicons
              name={isVaulted ? "heart" : "heart-outline"}
              size={24}
              color={isVaulted ? "#FF6347" : theme.iconColor}
            />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
        bounces={false}
      >
        <View
          style={[
            styles.heroWrapper,
            {
              height: playVideo ? VIDEO_HEIGHT + 30 : 350,
              backgroundColor: theme.bg,
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
              />
            </View>
          ) : (
            <Image
              source={{ uri: meal?.strMealThumb }}
              style={styles.heroImage}
            />
          )}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBg, marginTop: -30 },
          ]}
        >
          {playVideo && (
            <TouchableOpacity
              style={[
                styles.inlineCloseBtn,
                { backgroundColor: isDark ? "#331111" : "#FFF0ED" },
              ]}
              onPress={() => setPlayVideo(false)}
            >
              <Ionicons name="close-circle" size={20} color="#FF6347" />
              <Text style={styles.inlineCloseText}>Close Video</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.title, { color: theme.text }]}>
            {meal?.strMeal}
          </Text>

          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: theme.tagBg }]}>
              <Text style={[styles.tagText, { color: theme.tagText }]}>
                {meal?.strCategory || "Custom"}
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { marginLeft: 10, backgroundColor: theme.tagBg },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.subText}
              />
              <Text
                style={[
                  styles.tagText,
                  { marginLeft: 4, color: theme.tagText },
                ]}
              >
                {meal?.strArea || "Personal"}
              </Text>
            </View>
            {personalMeal && (
              <View
                style={[
                  styles.tag,
                  {
                    marginLeft: 10,
                    backgroundColor: isDark ? "#102a44" : "#E3F2FD",
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: "#1E88E5" }]}>
                  My Recipe
                </Text>
              </View>
            )}
          </View>

          {meal?.strYoutube && !playVideo && (
            <TouchableOpacity
              style={styles.ytBtn}
              onPress={() => setPlayVideo(true)}
            >
              <Ionicons name="logo-youtube" size={20} color="#fff" />
              <Text style={styles.ytText}>Watch Tutorial</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionHeader, { color: theme.text }]}>
            Ingredients
          </Text>
          <View style={styles.ingredientsList}>
            {getIngredientsList().map((item, idx) => {
              const isApiIngredient = !personalMeal;
              const ingUrl = isApiIngredient
                ? `https://www.themealdb.com/images/ingredients/${item.name.replace(/ /g, "_")}-small.png`
                : item?.image;

              return (
                <View
                  key={idx}
                  style={[
                    styles.ingredientItem,
                    { backgroundColor: theme.ingBg },
                  ]}
                >
                  <View
                    style={[
                      styles.ingredientImageContainer,
                      {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    {ingUrl ? (
                      <Image
                        source={{ uri: ingUrl }}
                        style={styles.ingredientImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name="restaurant-outline"
                        size={20}
                        color={isDark ? "#555" : "#CCC"}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.ingredientName, { color: theme.text }]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.ingredientMeasure,
                        { color: theme.subText },
                      ]}
                    >
                      {item.measure}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.sectionHeader, { color: theme.text }]}>
            Instructions
          </Text>
          <Text
            style={[styles.instructions, { color: isDark ? "#DDD" : "#444" }]}
          >
            {meal?.strInstructions}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.sectionHeader, { color: theme.text }]}>
            My Personal Note
          </Text>
          <TouchableOpacity
            style={[
              styles.notePreviewWrapper,
              { backgroundColor: theme.noteBg, borderColor: theme.border },
            ]}
            onPress={openNoteModal}
          >
            {note.length > 0 ? (
              <Text style={[styles.notePreviewText, { color: theme.text }]}>
                {note}
              </Text>
            ) : (
              <Text
                style={[styles.notePlaceholderText, { color: theme.subText }]}
              >
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
              onPress={() => dispatch(clearNote(id))}
            >
              <Ionicons name="trash-outline" size={16} color="#FF6347" />
              <Text style={styles.clearText}>Clear Note</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Note Modal */}
      <Modal visible={isNoteModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={saveAndCloseModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={[styles.popOutBox, { backgroundColor: theme.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Personal Note
              </Text>
              <TouchableOpacity onPress={saveAndCloseModal}>
                <Ionicons name="checkmark-circle" size={30} color="#FF6347" />
              </TouchableOpacity>
            </View>
            <TextInput
              ref={modalInputRef}
              style={[styles.modalInput, { color: theme.inputColor }]}
              multiline
              value={tempNote}
              onChangeText={setTempNote}
              placeholder="Type your thoughts here..."
              placeholderTextColor={theme.subText}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  inlineCloseBtn: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    marginBottom: 10,
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
    justifyContent: "center",
    alignItems: "center",
    // elevation: 5,
  },
  heroWrapper: { width: "100%", zIndex: 1 },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  card: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500,
    zIndex: 2,
  },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  tagRow: { flexDirection: "row", marginBottom: 20 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 14, fontWeight: "600" },
  ytBtn: {
    flexDirection: "row",
    backgroundColor: "#FF6347",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 6,
  },
  ytText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 15,
  },
  divider: { height: 1, marginVertical: 24 },
  ingredientsList: { gap: 12 },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
  },
  ingredientImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
  },
  ingredientImage: { width: 35, height: 35 },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  ingredientMeasure: { fontSize: 14, marginTop: 2 },
  instructions: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "left",
  },
  notePreviewWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 80,
    justifyContent: "center",
  },
  notePreviewText: { fontSize: 15, lineHeight: 22 },
  notePlaceholderText: { fontSize: 15, fontStyle: "italic" },
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
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    maxHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: "top",
  },
});
