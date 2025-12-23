
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { fetchMeals } from "../../../api/listallmeals";
import { MealCard } from "../../../components/MealCard";

export default function Index() {
  const {
    data: mealsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["meals"],
    queryFn: fetchMeals,
  });

  const { width } = useWindowDimensions();

  // SAME columns for hero & grid
  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
        <Text style={{ marginTop: 10 }}>Fetching fresh meals...</Text>
      </View>
    );
  }

  if (!mealsData || mealsData.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No meals found</Text>
      </View>
    );
  }

  // HERO MEALS (minimum 3)
  const vegetarianMeals = mealsData.filter(
    (m) => m.strCategory === "Vegetarian"
  );

  const heroMeals =
    vegetarianMeals.length >= 3
      ? vegetarianMeals.slice(0, 3)
      : mealsData.slice(0, 3);

  const heroMealIds = heroMeals.map((m) => m.idMeal);

  // GRID MEALS
 const gridMeals = mealsData
  .filter((m) => !heroMealIds.includes(m.idMeal))
  .slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity onPress={refetch} disabled={isRefetching}>
          <Ionicons
            name="refresh-circle"
            size={32}
            color={isRefetching ? "#ccc" : "#ff6347"}
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={gridMeals}
        keyExtractor={(item) => item.idMeal}
        numColumns={numColumns}
        key={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => <MealCard meal={item} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionLabel}>Featured Dishes</Text>

            {/* HERO MEALS — SAME AS GRID */}
            <View style={styles.sameGrid}>
              {heroMeals.map((meal) => (
                <View
                  key={meal.idMeal}
                  style={{ width: `${100 / numColumns}%` }}
                >
                  <MealCard meal={meal} />
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>More Discoveries</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 20,
    marginHorizontal:20 ,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
    color: "#666",
  },
  sameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
