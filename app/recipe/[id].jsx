import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: async () => {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
      );
      return res.data.meals[0];
    },
  });

  // 🦍 Helper to get ingredients and measures
  const getIngredientsList = () => {
    if (!meal) return [];
    let list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const msr = meal[`strMeasure${i}`];
      if (ing && ing.trim()) list.push(`${msr} ${ing}`);
    }
    return list;
  };

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{ title: meal?.strMeal || "Recipe", headerShown: true }}
      />
      <Image source={{ uri: meal?.strMealThumb }} style={styles.heroImage} />

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{meal?.strMeal}</Text>
        </View>

        <Text style={styles.subtitle}>
          {meal?.strCategory} • {meal?.strArea}
        </Text>

        {meal?.strYoutube && (
          <TouchableOpacity
            style={styles.ytBtn}
            onPress={() => Linking.openURL(meal.strYoutube)}
          >
            <Ionicons name="logo-youtube" size={24} color="#fff" />
            <Text style={styles.ytText}>Watch Tutorial</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeader}>Ingredients</Text>
        {getIngredientsList().map((item, idx) => (
          <Text key={idx} style={styles.item}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionHeader}>Instructions</Text>
        <Text style={styles.instructions}>{meal?.strInstructions}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroImage: { width: "100%", height: 350 },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 25,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", flexShrink: 1 },
  subtitle: {
    color: "#ff6347",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  ytBtn: {
    flexDirection: "row",
    backgroundColor: "#FF0000",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  ytText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  item: { fontSize: 16, color: "#555", marginBottom: 6 },
  instructions: {
    fontSize: 16,
    lineHeight: 26,
    color: "#444",
    textAlign: "justify",
    marginBottom: 40,
  },
});
