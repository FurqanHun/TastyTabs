import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StatusBar,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../api/fetchcategories";
import { MealCard } from "../../components/MealCard";
import {
  addPersonalRecipe,
  deletePersonalRecipe,
  updatePersonalRecipe,
} from "../../store/Slices/personalrecipesSlice";

const REGIONS = [
  "American",
  "British",
  "Canadian",
  "Chinese",
  "Croatian",
  "Dutch",
  "Egyptian",
  "Filipino",
  "French",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Kenyan",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Russian",
  "Saudi Arabian",
  "Slovakian",
  "Spanish",
  "Syrian",
  "Thai",
  "Tunisian",
  "Turkish",
  "Ukrainian",
  "Uruguayan",
  "Venezuelan",
  "Vietnamese",
].sort();

export default function Mypersonalrecipe() {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const myRecipes = useSelector((state) => state.personalrecipes.allmyrecipes);

  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;
  const topPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 20 : 60;

  const { data: categoriesData } = useQuery({
    queryKey: ["mealCategories"],
    queryFn: fetchCategories,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [recipeImage, setRecipeImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  // Ingredient States
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientQty, setIngredientQty] = useState("");
  const [ingredientImage, setIngredientImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);

  const getThemeColor = (light, dark, amoled) =>
    isDark ? (isAmoled ? amoled : dark) : light;

  const theme = {
    bg: getThemeColor("#fff", "#121212", "#000000"), // Main BG
    text: isDark ? "#fff" : "#1a1a1a",
    subText: isDark ? "#aaa" : "#666",
    modalBg: getThemeColor("#fff", "#1E1E1E", "#121212"),
    inputBg: getThemeColor("#F9F9F9", "#2C2C2E", "#1E1E1E"),
    border: getThemeColor("#F0F0F0", "#333", "#222"),
    chipBg: getThemeColor("#F5F5F5", "#2C2C2E", "#1E1E1E"),
    chipBorder: getThemeColor("#EEE", "#333", "#222"),
    placeholder: isDark ? "#888" : "#999",
    actionOverlay: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.6)",
    closeBtn: getThemeColor("#F5F5F5", "#333", "#222"),
    imgPlaceholder: getThemeColor("#FFF0ED", "#2C2C2E", "#121212"),
    imgBorder: getThemeColor("#FF6347", "#333", "#333"),
  };

  const pickImage = async (selectionType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      const tempUri = result.assets[0].uri;

      // Generate a permanent home for this file
      // We grab the filename (e.g., "img-pikapika.jpg") and append it to the Document Directory
      const fileName = tempUri.split("/").pop();
      const permanentUri = FileSystem.documentDirectory + fileName;

      try {
        // Move the file from Cache -> Document Directory
        await FileSystem.moveAsync({
          from: tempUri,
          to: permanentUri,
        });

        // Save the SAFE URI to state
        if (selectionType === "recipe") setRecipeImage(permanentUri);
        else setIngredientImage(permanentUri);

        // console.log("Image secured at:", permanentUri);
      } catch (_) {
        // console.error("falling back to temp uri:", error);
        // Fallback: If moving fails, use the temp one so the UI doesn't break immediately
        if (selectionType === "recipe") setRecipeImage(tempUri);
        else setIngredientImage(tempUri);
      }
    }
  };

  const addIngredient = () => {
    if (ingredientName.trim() && ingredientQty.trim()) {
      setIngredients([
        ...ingredients,
        {
          id: Date.now().toString(),
          name: ingredientName.trim(),
          measure: ingredientQty.trim(),
          image: ingredientImage,
        },
      ]);
      setIngredientName("");
      setIngredientQty("");
      setIngredientImage(null);
    } else {
      Alert.alert("Error", "Please add both name and quantity");
    }
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleEdit = (item) => {
    setEditingId(item.idMeal);
    setTitle(item.strMeal);
    setInstructions(item.strInstructions);
    setYtLink(item.strYoutube || "");
    setRecipeImage(item.strMealThumb);
    setIngredients(item.ingredients || []);
    setSelectedCategory(item.strCategory || "");
    setSelectedRegion(item.strArea || "");
    setModalVisible(true);
  };

  const confirmDelete = (id) => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this recipe?"))
        dispatch(deletePersonalRecipe(id));
    } else {
      Alert.alert("Delete Recipe", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deletePersonalRecipe(id)),
        },
      ]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return Alert.alert("Error", "Title is required");

    const recipeId = editingId || Date.now().toString();

    const recipeData = {
      idMeal: recipeId,
      strMeal: title.trim(),
      strInstructions: instructions,
      strYoutube: ytLink,
      strMealThumb: recipeImage,
      ingredients,
      strCategory: selectedCategory,
      strArea: selectedRegion.trim() || "Unknown",
      isPersonal: true,
      recipeLink: `/recipe/${recipeId}`,
      createdAt: new Date().toLocaleDateString(),
    };

    if (editingId) {
      dispatch(updatePersonalRecipe(recipeData));
    } else {
      dispatch(addPersonalRecipe(recipeData));
    }
    closeAndReset();
  };

  const closeAndReset = () => {
    setModalVisible(false);
    setEditingId(null);
    setTitle("");
    setInstructions("");
    setYtLink("");
    setRecipeImage(null);
    setIngredients([]);
    setSelectedCategory("");
    setSelectedRegion("");
    setIngredientName("");
    setIngredientQty("");
    setIngredientImage(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        data={myRecipes}
        keyExtractor={(item, index) => (item.idMeal || index).toString()}
        numColumns={numColumns}
        key={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: topPadding,
          paddingHorizontal: 5,
        }}
        renderItem={({ item }) => (
          <View style={{ width: `${100 / numColumns}%`, padding: 5 }}>
            <View style={styles.actionOverlay}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.actionCircle}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => confirmDelete(item.idMeal)}
                style={[styles.actionCircle, { backgroundColor: "#FF6347" }]}
              >
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <MealCard meal={item} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                My Creations
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.subText }]}>
                {myRecipes.length}{" "}
                {myRecipes.length === 1 ? "recipe" : "recipes"} cooked up
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={60}
              color={isDark ? "#333" : "#ddd"}
            />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No recipes yet.
            </Text>
            <Text style={[styles.emptySubText, { color: theme.subText }]}>
              Tap the + button to be a chef!
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAndReset}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={closeAndReset}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[styles.modalContent, { backgroundColor: theme.modalBg }]}
          >
            <View
              style={[styles.dragHandle, { backgroundColor: theme.border }]}
            />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingId ? "Edit Recipe" : "New Recipe"}
              </Text>
              <TouchableOpacity
                onPress={closeAndReset}
                style={[styles.closeBtn, { backgroundColor: theme.closeBtn }]}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <TouchableOpacity
                style={[
                  styles.imagePlaceholder,
                  {
                    backgroundColor: theme.imgPlaceholder,
                    borderColor: theme.imgBorder,
                  },
                ]}
                onPress={() => pickImage("recipe")}
                activeOpacity={0.8}
              >
                {recipeImage ? (
                  <Image
                    source={{ uri: recipeImage }}
                    style={styles.pickedImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderInner}>
                    <Ionicons name="camera" size={32} color="#FF6347" />
                    <Text style={styles.placeholderText}>Tap to Upload</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* 🦍 FIX: ADDED URL INPUT WITH CLEAR BUTTON */}
              <View
                style={[
                  styles.ytInputRow,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    marginBottom: 20,
                  },
                ]}
              >
                <Ionicons
                  name="link"
                  size={20}
                  color={isDark ? "#aaa" : "#666"}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Or paste Image URL..."
                  // 🦍 Logic: Show text only if it's NOT a local file. Allows typing.
                  value={
                    !recipeImage?.startsWith("file://") ? recipeImage || "" : ""
                  }
                  onChangeText={setRecipeImage}
                  placeholderTextColor={theme.placeholder}
                />
                {/* 🦍 Clear Button Logic: Show if it's a URL/Text (not a file) and not empty */}
                {recipeImage && !recipeImage.startsWith("file://") && (
                  <TouchableOpacity onPress={() => setRecipeImage(null)}>
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.subText}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Title</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="E.g., Grandma's Spicy Curry"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={theme.placeholder}
              />

              <Text style={[styles.label, { color: theme.text }]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipContainer}
              >
                {categoriesData?.map((cat) => (
                  <TouchableOpacity
                    key={cat.idCategory}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: theme.chipBg,
                        borderColor: theme.chipBorder,
                      },
                      selectedCategory === cat.strCategory && styles.chipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.strCategory)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isDark ? "#ccc" : "#666" },
                        selectedCategory === cat.strCategory &&
                          styles.chipTextActive,
                      ]}
                    >
                      {cat.strCategory}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.text }]}>
                Region (Select or Type)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    marginBottom: 10,
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="E.g. Pakistani, Asian, Home..."
                value={selectedRegion}
                onChangeText={setSelectedRegion}
                placeholderTextColor={theme.placeholder}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipContainer}
              >
                {REGIONS.map((reg) => (
                  <TouchableOpacity
                    key={reg}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: theme.chipBg,
                        borderColor: theme.chipBorder,
                      },
                      selectedRegion === reg && styles.chipActive,
                    ]}
                    onPress={() => setSelectedRegion(reg)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isDark ? "#ccc" : "#666" },
                        selectedRegion === reg && styles.chipTextActive,
                      ]}
                    >
                      {reg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.text }]}>
                Video Tutorial
              </Text>
              <View
                style={[
                  styles.ytInputRow,
                  { backgroundColor: theme.inputBg, borderColor: theme.border },
                ]}
              >
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Paste YouTube URL"
                  value={ytLink}
                  onChangeText={setYtLink}
                  placeholderTextColor={theme.placeholder}
                />
              </View>

              <Text
                style={[styles.label, { marginTop: 15, color: theme.text }]}
              >
                Ingredients
              </Text>
              <View
                style={[
                  styles.ingredientBoxOuter,
                  { backgroundColor: theme.inputBg },
                ]}
              >
                <View style={styles.ingredientRow}>
                  <TouchableOpacity
                    style={[
                      styles.ingImageBtn,
                      {
                        backgroundColor: isDark ? "#333" : "#fff",
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => pickImage("ingredient")}
                  >
                    {ingredientImage ? (
                      <Image
                        source={{ uri: ingredientImage }}
                        style={styles.ingImgPreview}
                      />
                    ) : (
                      <Ionicons
                        name="camera-outline"
                        size={20}
                        color={isDark ? "#aaa" : "#666"}
                      />
                    )}
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.miniInput,
                      {
                        flex: 2,
                        backgroundColor: isDark ? "#333" : "#fff",
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    placeholder="Item (e.g. Rice)"
                    value={ingredientName}
                    onChangeText={setIngredientName}
                    placeholderTextColor={theme.placeholder}
                  />
                  <TextInput
                    style={[
                      styles.miniInput,
                      {
                        flex: 1,
                        backgroundColor: isDark ? "#333" : "#fff",
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    placeholder="Qty"
                    value={ingredientQty}
                    onChangeText={setIngredientQty}
                    placeholderTextColor={theme.placeholder}
                  />
                  <TouchableOpacity
                    style={[
                      styles.plusBtn,
                      { backgroundColor: isDark ? "#444" : "#1a1a1a" },
                    ]}
                    onPress={addIngredient}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.ingListPreview}>
                {ingredients.map((ing) => (
                  <View
                    key={ing.id}
                    style={[
                      styles.ingItem,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    {ing.image && (
                      <Image
                        source={{ uri: ing.image }}
                        style={styles.miniIngImg}
                      />
                    )}
                    <Text style={[styles.ingText, { color: theme.text }]}>
                      {ing.name}{" "}
                      <Text style={{ fontWeight: "400", color: theme.subText }}>
                        ({ing.measure})
                      </Text>
                    </Text>
                    <TouchableOpacity onPress={() => removeIngredient(ing.id)}>
                      <Ionicons name="close-circle" size={18} color="#FF6347" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text
                style={[styles.label, { marginTop: 15, color: theme.text }]}
              >
                Instructions
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    height: 120,
                    paddingTop: 12,
                    textAlignVertical: "top",
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                multiline
                placeholder="Step 1: Chop the onions..."
                value={instructions}
                onChangeText={setInstructions}
                placeholderTextColor={theme.placeholder}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {editingId ? "Update Recipe" : "Save Recipe"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  addBtn: {
    backgroundColor: "#FF6347",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionOverlay: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 30,
    flexDirection: "row",
    gap: 8,
  },
  actionCircle: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
    marginTop: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 24, fontWeight: "800" },
  closeBtn: {
    padding: 5,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  placeholderInner: { alignItems: "center" },
  placeholderText: { color: "#FF6347", fontWeight: "600", marginTop: 8 },
  pickedImg: { width: "100%", height: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  miniInput: {
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  chipContainer: { flexDirection: "row", marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: "#FF6347", borderColor: "#FF6347" },
  chipText: { fontSize: 14, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  ytInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    height: 55,
  },
  ingredientBoxOuter: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ingImageBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  ingImgPreview: { width: "100%", height: "100%" },
  plusBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  ingListPreview: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  miniIngImg: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  ingText: { fontSize: 13, fontWeight: "600", marginRight: 8 },
  saveBtn: {
    backgroundColor: "#FF6347",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#FF6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  emptyContainer: { alignItems: "center", marginTop: 80, padding: 20 },
  emptyText: { marginTop: 15, fontSize: 18, fontWeight: "700" },
  emptySubText: { marginTop: 5, fontSize: 14 },
});
