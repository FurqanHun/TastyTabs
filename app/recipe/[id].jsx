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

// API aur Store Imports
import { fetchMealById } from "../../api/mealdetail";
import { clearNote, saveNote } from "../../store/Slices/personalNotesSlice";
import { toggleVaultItem } from "../../store/Slices/vaultSlice";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { width } = useWindowDimensions();
  const VIDEO_HEIGHT = width * (9 / 16);
  const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 48 : StatusBar.currentHeight || 24;

  const modalInputRef = useRef(null);
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  const personalRecipes = useSelector((state) => state.personalrecipes?.allmyrecipes || []);
  const personalMeal = personalRecipes.find((r) => String(r.idMeal) === String(id));

  const { data: apiMeal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMealById(id),
    enabled: !personalMeal, // Optimization: Agar personal mil jaye to fetch na karein
  });

  const meal = personalMeal || apiMeal;

  

  // --- Other Selectors ---
  const isVaulted = useSelector((state) => {
    const items = Array.isArray(state.vault) ? state.vault : state.vault.items || [];
    return items.some((item) => String(item.idMeal) === String(id));
  });

  const personalNote = useSelector((state) => state.personalNotes.notes[id] || "");
  const [note, setNote] = useState(personalNote);
  const [tempNote, setTempNote] = useState(personalNote);

  // Sync internal note state with redux when it changes
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

  // --- Handlers ---
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
    
    // 1. Agar ye Personal Recipe hai aur isme 'ingredients' ka direct array hai
    if (personalMeal && Array.isArray(meal.ingredients)) {
    
      return meal.ingredients.map(item => ({
        name: item.name || item, // Agar object hai to name property, warna string
        measure: item.measure || "",
        image:item.image
      }));
    }

    // 2. Agar API wala format hai (strIngredient1...20)
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
    } catch (_) { return null; }
  };

  if (isLoading && !personalMeal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text>Recipe not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 10}}>
            <Text style={{color: '#FF6347'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const videoId = getYouTubeId(meal?.strYoutube);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <StatusBar
        barStyle={playVideo ? "light-content" : "dark-content"}
        backgroundColor={playVideo ? "#000" : "#fff"}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {playVideo && (
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: "#000", width: "100%" }} />
      )}

      {!playVideo && (
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
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

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        <View style={[styles.heroWrapper, { height: playVideo ? VIDEO_HEIGHT + 30 : 350 }]}>
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
            <Image source={{ uri: meal?.strMealThumb }} style={styles.heroImage} />
          )}
        </View>

        <View style={[styles.card, { marginTop: -30 }]}>
          {playVideo && (
            <TouchableOpacity style={styles.inlineCloseBtn} onPress={() => setPlayVideo(false)}>
              <Ionicons name="close-circle" size={20} color="#FF6347" />
              <Text style={styles.inlineCloseText}>Close Video</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>{meal?.strMeal}</Text>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{meal?.strCategory || "Custom"}</Text>
            </View>
            <View style={[styles.tag, { marginLeft: 10 }]}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={[styles.tagText, { marginLeft: 4 }]}>{meal?.strArea || "Personal"}</Text>
            </View>
            {personalMeal && (
               <View style={[styles.tag, { marginLeft: 10, backgroundColor: '#E3F2FD' }]}>
                 <Text style={[styles.tagText, { color: '#1E88E5' }]}>My Recipe</Text>
               </View>
            )}
          </View>

          {meal?.strYoutube && !playVideo && (
            <TouchableOpacity style={styles.ytBtn} onPress={() => setPlayVideo(true)}>
              <Ionicons name="logo-youtube" size={20} color="#fff" />
              <Text style={styles.ytText}>Watch Tutorial</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />


          <Text style={styles.sectionHeader}>Ingredients</Text>
<View style={styles.ingredientsList}>
  {getIngredientsList().map((item, idx) => {
    const isApiIngredient = !personalMeal;
    const ingUrl = isApiIngredient 
      ? `https://www.themealdb.com/images/ingredients/${item.name.replace(/ /g, "_")}-small.png`
      : item?.image;

    return (
      <View key={idx} style={styles.ingredientItem}>
        <View style={styles.ingredientImageContainer}>
          {ingUrl ? (
            <Image
              source={{ uri: ingUrl }}
              style={styles.ingredientImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="restaurant-outline" size={20} color="#CCC" />
          )}
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
          <TouchableOpacity style={styles.notePreviewWrapper} onPress={openNoteModal}>
            {note.length > 0 ? (
              <Text style={styles.notePreviewText}>{note}</Text>
            ) : (
              <Text style={styles.notePlaceholderText}>Tap to add a personal note...</Text>
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          {note.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => dispatch(clearNote(id))}>
              <Ionicons name="trash-outline" size={16} color="#FF6347" />
              <Text style={styles.clearText}>Clear Note</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Note Modal */}
      <Modal visible={isNoteModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={saveAndCloseModal}><View style={styles.modalBackdrop} /></TouchableWithoutFeedback>
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
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ... Styles (Wahi hain jo aapne diye thay)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    inlineCloseBtn: { flexDirection: "row", alignSelf: "flex-start", alignItems: "center", marginBottom: 10, backgroundColor: "#FFF0ED", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    inlineCloseText: { color: "#FF6347", fontWeight: "600", fontSize: 14, marginLeft: 6 },
    floatingHeader: { position: "absolute", top: Platform.OS === "ios" ? 50 : 40, left: 20, right: 20, zIndex: 100, flexDirection: "row", justifyContent: "space-between" },
    iconBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.95)", justifyContent: "center", alignItems: "center", elevation: 5 },
    heroWrapper: { width: "100%", backgroundColor: "#fff", zIndex: 1 },
    heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
    card: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 500, zIndex: 2 },
    title: { fontSize: 26, fontWeight: "800", color: "#333", marginBottom: 10 },
    tagRow: { flexDirection: "row", marginBottom: 20 },
    tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F0F0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    tagText: { fontSize: 14, color: "#555", fontWeight: "600" },
    ytBtn: { flexDirection: "row", backgroundColor: "#FF6347", paddingVertical: 14, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 10, elevation: 6 },
    ytText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
    sectionHeader: { fontSize: 20, fontWeight: "700", color: "#333", marginTop: 10, marginBottom: 15 },
    divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 24 },
    ingredientsList: { gap: 12 },
    ingredientItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FAFAFA", padding: 10, borderRadius: 12 },
    ingredientImageContainer: { width: 50, height: 50, backgroundColor: "#FFF", borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 15, borderWidth: 1, borderColor: "#F0F0F0" },
    ingredientImage: { width: 35, height: 35 },
    ingredientName: { fontSize: 16, fontWeight: "600", color: "#333", textTransform: "capitalize" },
    ingredientMeasure: { fontSize: 14, color: "#888", marginTop: 2 },
    instructions: { fontSize: 16, lineHeight: 28, color: "#444", textAlign: "left" },
    notePreviewWrapper: { backgroundColor: "#FAFAFA", borderRadius: 16, borderWidth: 1, borderColor: "#E0E0E0", padding: 16, minHeight: 80, justifyContent: "center" },
    notePreviewText: { fontSize: 15, color: "#333", lineHeight: 22 },
    notePlaceholderText: { fontSize: 15, color: "#999", fontStyle: "italic" },
    editIconBadge: { position: "absolute", bottom: 10, right: 10, backgroundColor: "#FF6347", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    clearBtn: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "flex-end", marginTop: 5 },
    clearText: { color: "#FF6347", marginLeft: 6, fontWeight: "600", fontSize: 13 },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", padding: 20 },
    modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    popOutBox: { width: "100%", backgroundColor: "#FFF", borderRadius: 20, padding: 20, elevation: 10, maxHeight: 300 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: "800", color: "#333" },
    modalInput: { fontSize: 16, color: "#333", lineHeight: 24, minHeight: 100, textAlignVertical: "top" },
});