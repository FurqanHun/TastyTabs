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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Components & API
import { fetchCategories } from "../../api/fetchcategories";
import { MealCard } from "../../components/MealCard";
import { addPersonalRecipe, deletePersonalRecipe, updatePersonalRecipe } from "../../store/Slices/personalrecipesSlice";

const REGIONS = ["American", "British", "Canadian", "Croatian", "Malaysian", "Norwegian", "Filipino", "Greek", "Irish", "Italian", "Polish", "Portuguese", "Turkish"];

export default function Mypersonalrecipe() {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const myRecipes = useSelector((state) => state.personalrecipes.allmyrecipes);
  
  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

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
  const [ingredientQty, setIngredientQty] = useState(""); // 2nd field: 20ml / 20gram
  const [ingredientImage, setIngredientImage] = useState(null); // 3rd field: Image
  const [ingredients, setIngredients] = useState([]);

  const pickImage = async (selectionType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) {
      if (selectionType === 'recipe') setRecipeImage(result.assets[0].uri);
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
          image: ingredientImage 
        }
      ]);
      setIngredientName("");
      setIngredientQty("");
      setIngredientImage(null);
    } else {
      Alert.alert("Error", "Please add both name and quantity");
    }
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
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
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this recipe?")) dispatch(deletePersonalRecipe(id));
    } else {
      Alert.alert("Delete Recipe", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => dispatch(deletePersonalRecipe(id)) }
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
      strArea: selectedRegion,
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
    setTitle(""); setInstructions(""); setYtLink(""); setRecipeImage(null); setIngredients([]);
    setSelectedCategory(""); setSelectedRegion("");
    setIngredientName(""); setIngredientQty(""); setIngredientImage(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Creations</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myRecipes}
        keyExtractor={(item, index) => (item.idMeal || index).toString()}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <View style={{ width: `${100 / numColumns}%`, padding: 5 }}>
            <View style={styles.actionOverlay}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionCircle}>
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item.idMeal)} style={[styles.actionCircle, {backgroundColor: '#FF6347'}]}>
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <MealCard meal={item} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No recipes yet. Tap + to create!</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Recipe" : "New Recipe"}</Text>
              <TouchableOpacity onPress={closeAndReset}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
              
              <TouchableOpacity style={styles.imagePlaceholder} onPress={() => pickImage('recipe')}>
                {recipeImage ? <Image source={{ uri: recipeImage }} style={styles.pickedImg} /> : <Ionicons name="camera" size={40} color="#999" />}
              </TouchableOpacity>

              <TextInput style={styles.input} placeholder="Recipe Title" value={title} onChangeText={setTitle} />
              
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {categoriesData?.map((cat) => (
                  <TouchableOpacity key={cat.idCategory} style={[styles.chip, selectedCategory === cat.strCategory && styles.chipActive]} onPress={() => setSelectedCategory(cat.strCategory)}>
                    <Text style={[styles.chipText, selectedCategory === cat.strCategory && styles.chipTextActive]}>{cat.strCategory}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Region</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {REGIONS.map((reg) => (
                  <TouchableOpacity key={reg} style={[styles.chip, selectedRegion === reg && styles.chipActive]} onPress={() => setSelectedRegion(reg)}>
                    <Text style={[styles.chipText, selectedRegion === reg && styles.chipTextActive]}>{reg}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>YouTube Link</Text>
              <View style={styles.ytInputRow}>
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: 'transparent' }]} placeholder="Paste YouTube URL" value={ytLink} onChangeText={setYtLink} />
              </View>

              <Text style={[styles.label, {marginTop: 15}]}>Ingredients</Text>
              <View style={styles.ingredientBoxOuter}>
                <View style={styles.ingredientRow}>
                  <TouchableOpacity style={styles.ingImageBtn} onPress={() => pickImage('ingredient')}>
                    {ingredientImage ? <Image source={{ uri: ingredientImage }} style={styles.ingImgPreview} /> : <Ionicons name="camera" size={20} color="#666" />}
                  </TouchableOpacity>
                  <TextInput style={[styles.input, { flex: 2, marginBottom: 0 }]} placeholder="Name" value={ingredientName} onChangeText={setIngredientName} />
                  <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Qty" value={ingredientQty} onChangeText={setIngredientQty} />
                  <TouchableOpacity style={styles.plusBtn} onPress={addIngredient}><Ionicons name="add" size={24} color="#fff" /></TouchableOpacity>
                </View>
              </View>

              <View style={styles.ingListPreview}>
                {ingredients.map((ing) => (
                  <View key={ing.id} style={styles.ingItem}>
                    {ing.image && <Image source={{ uri: ing.image }} style={styles.miniIngImg} />}
                    <Text style={styles.ingText}>{ing.name} ({ing.measure})</Text>
                    <TouchableOpacity onPress={() => removeIngredient(ing.id)}><Ionicons name="close-circle" size={16} color="#FF6347" /></TouchableOpacity>
                  </View>
                ))}
              </View>

              <TextInput style={[styles.input, { height: 100, marginTop: 15, textAlignVertical: 'top' }]} multiline placeholder="Instructions..." value={instructions} onChangeText={setInstructions} />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>{editingId ? "Update Changes" : "Save Recipe"}</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#1a1a1a" },
  addBtn: { backgroundColor: "#FF6347", padding: 10, borderRadius: 14, elevation: 5 },
  actionOverlay: { position: 'absolute', top: 15, left: 15, zIndex: 30, flexDirection: 'row', gap: 8 },
  actionCircle: { backgroundColor: '#4A90E2', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: "92%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#FF6347" },
  imagePlaceholder: { width: '100%', height: 180, backgroundColor: '#F5F5F5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  pickedImg: { width: '100%', height: '100%', borderRadius: 20 },
  input: { backgroundColor: "#F5F5F5", padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 15 },
  label: { fontWeight: '800', marginBottom: 10, color: '#333', fontSize: 15 },
  chipContainer: { flexDirection: 'row', marginBottom: 15 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  chipActive: { backgroundColor: '#FF6347' },
  chipText: { fontSize: 13, color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  ytInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, marginBottom: 15 },
  ingredientBoxOuter: { backgroundColor: '#F9F9F9', padding: 10, borderRadius: 15, marginBottom: 10 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingImageBtn: { width: 45, height: 45, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  ingImgPreview: { width: '100%', height: '100%' },
  plusBtn: { backgroundColor: "#1a1a1a", padding: 10, borderRadius: 10 },
  ingListPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF634715', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FF6347' },
  miniIngImg: { width: 22, height: 22, borderRadius: 5, marginRight: 6 },
  ingText: { color: '#FF6347', fontSize: 12, fontWeight: '700', marginRight: 5 },
  saveBtn: { backgroundColor: "#FF6347", padding: 18, borderRadius: 18, alignItems: "center", marginTop: 25 },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 100, color: "#999", fontSize: 16 },
});