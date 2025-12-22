import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  let numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
        <Text style={{ marginTop: 10 }}>Fetching fresh meals...</Text>
      </View>
    );

  // const heroMeal = mealsData?.[0];
  // const gridMeals = mealsData?.slice(1);

  const heroMeal =
    mealsData?.find((m) => m.strCategory === "Vegetarian") || mealsData?.[0];
  const gridMeals = mealsData?.filter((m) => m.idMeal !== heroMeal?.idMeal);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity onPress={() => refetch()} disabled={isRefetching}>
          <Ionicons
            name="refresh-circle"
            size={32}
            color={isRefetching ? "#ccc" : "#ff6347"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={gridMeals}
        keyExtractor={(item) => item.idMeal}
        // 🚀 HeaderComponent keeps the Hero meal at the top of the scroll
        ListHeaderComponent={
          heroMeal && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionLabel}>Featured Dish</Text>
              <MealCard meal={heroMeal} isHero={true} />
              <Text style={styles.sectionLabel}>More Discoveries</Text>
            </View>
          )
        }
        renderItem={({ item }) => <MealCard meal={item} />}
        contentContainerStyle={{ padding: 12 }}
        numColumns={numColumns}
        key={numColumns}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#333" },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    color: "#666",
  },
});
