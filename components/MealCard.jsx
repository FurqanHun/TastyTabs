import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

export const MealCard = ({ meal, isHero }) => {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const cardWidth = isHero
    ? width - 24
    : width > 900
      ? width / 3 - 24
      : width > 600
        ? width / 2 - 18
        : width - 24;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/recipe/${meal.idMeal}`)}
      style={[styles.card, { width: cardWidth }]}
    >
      <Image
        source={{ uri: meal.strMealThumb }}
        style={[styles.image, { height: isHero ? 220 : 150 }]}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { fontSize: isHero ? 20 : 16 }]}>
          {meal.strMeal}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.badgeText}>{meal.strCategory}</Text>
          </View>
          <Text style={styles.areaText}>{meal.strArea}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 6,
    borderRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  image: { width: "100%" },
  info: { padding: 12 },
  name: { fontWeight: "700", color: "#333", marginBottom: 6 },
  badgeRow: { flexDirection: "row", alignItems: "center" },
  categoryBadge: {
    backgroundColor: "#FF634715",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: { color: "#FF6347", fontSize: 10, fontWeight: "bold" },
  areaText: { color: "#888", fontSize: 12 },
});
