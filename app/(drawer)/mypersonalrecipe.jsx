import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
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

  const pickImage = async (selectionType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) {
      if (selectionType === "recipe") setRecipeImage(result.assets[0].uri);
      else setIngredientImage(result.assets[0].uri);
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
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
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
              <Text style={styles.headerTitle}>My Creations</Text>
              <Text style={styles.headerSubtitle}>
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
            <Ionicons name="restaurant-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No recipes yet.</Text>
            <Text style={styles.emptySubText}>
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

          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Recipe" : "New Recipe"}
              </Text>
              <TouchableOpacity onPress={closeAndReset} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <TouchableOpacity
                style={styles.imagePlaceholder}
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
                    <Text style={styles.placeholderText}>Add Cover Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Grandma's Spicy Curry"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Category</Text>
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
                      selectedCategory === cat.strCategory && styles.chipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.strCategory)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === cat.strCategory &&
                          styles.chipTextActive,
                      ]}
                    >
                      {cat.strCategory}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Region (Select or Type)</Text>
              <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                placeholder="E.g. Pakistani, Asian, Home..."
                value={selectedRegion}
                onChangeText={setSelectedRegion}
                placeholderTextColor="#999"
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
                      selectedRegion === reg && styles.chipActive,
                    ]}
                    onPress={() => setSelectedRegion(reg)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedRegion === reg && styles.chipTextActive,
                      ]}
                    >
                      {reg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Video Tutorial</Text>
              <View style={styles.ytInputRow}>
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                      backgroundColor: "transparent",
                      borderWidth: 0,
                    },
                  ]}
                  placeholder="Paste YouTube URL"
                  value={ytLink}
                  onChangeText={setYtLink}
                  placeholderTextColor="#999"
                />
              </View>

              <Text style={[styles.label, { marginTop: 15 }]}>Ingredients</Text>
              <View style={styles.ingredientBoxOuter}>
                <View style={styles.ingredientRow}>
                  <TouchableOpacity
                    style={styles.ingImageBtn}
                    onPress={() => pickImage("ingredient")}
                  >
                    {ingredientImage ? (
                      <Image
                        source={{ uri: ingredientImage }}
                        style={styles.ingImgPreview}
                      />
                    ) : (
                      <Ionicons name="camera-outline" size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.miniInput, { flex: 2 }]}
                    placeholder="Item (e.g. Rice)"
                    value={ingredientName}
                    onChangeText={setIngredientName}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.miniInput, { flex: 1 }]}
                    placeholder="Qty"
                    value={ingredientQty}
                    onChangeText={setIngredientQty}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.plusBtn}
                    onPress={addIngredient}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.ingListPreview}>
                {ingredients.map((ing) => (
                  <View key={ing.id} style={styles.ingItem}>
                    {ing.image && (
                      <Image
                        source={{ uri: ing.image }}
                        style={styles.miniIngImg}
                      />
                    )}
                    <Text style={styles.ingText}>
                      {ing.name}{" "}
                      <Text style={{ fontWeight: "400", color: "#666" }}>
                        ({ing.measure})
                      </Text>
                    </Text>
                    <TouchableOpacity onPress={() => removeIngredient(ing.id)}>
                      <Ionicons name="close-circle" size={18} color="#FF6347" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 15 }]}>
                Instructions
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 120, paddingTop: 12, textAlignVertical: "top" },
                ]}
                multiline
                placeholder="Step 1: Chop the onions..."
                value={instructions}
                onChangeText={setInstructions}
                placeholderTextColor="#999"
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
  container: { flex: 1, backgroundColor: "#fff" },

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
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 2 },
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
    backgroundColor: "#fff",
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
    backgroundColor: "#E0E0E0",
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
  modalTitle: { fontSize: 24, fontWeight: "800", color: "#333" },
  closeBtn: {
    padding: 5,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },

  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#FFF0ED",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FF6347",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  placeholderInner: { alignItems: "center" },
  placeholderText: { color: "#FF6347", fontWeight: "600", marginTop: 8 },
  pickedImg: { width: "100%", height: "100%" },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    color: "#333",
  },
  miniInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#333",
  },

  chipContainer: { flexDirection: "row", marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chipActive: { backgroundColor: "#FF6347", borderColor: "#FF6347" },
  chipText: { fontSize: 14, color: "#666", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  ytInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    height: 55,
  },

  ingredientBoxOuter: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  ingredientRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ingImageBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  ingImgPreview: { width: "100%", height: "100%" },
  plusBtn: {
    backgroundColor: "#1a1a1a",
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
    backgroundColor: "#FFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  miniIngImg: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  ingText: { color: "#333", fontSize: 13, fontWeight: "600", marginRight: 8 },

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
  emptyText: { marginTop: 15, fontSize: 18, fontWeight: "700", color: "#333" },
  emptySubText: { marginTop: 5, fontSize: 14, color: "#999" },
});
