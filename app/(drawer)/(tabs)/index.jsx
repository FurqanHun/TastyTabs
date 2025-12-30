import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  RefreshControl,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { fetchMeals } from "../../../api/listallmeals";
import { MealCard } from "../../../components/MealCard";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  const {
    data: rawData,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["meals"],
    queryFn: () => fetchMeals(10),
  });

  const { width } = useWindowDimensions();
  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

  // 🦍 THE BOUNCERRRRRRR
  const mealsData = rawData
    ? Array.from(new Map(rawData.map((item) => [item.idMeal, item])).values())
    : [];

  //    DYNAMIC STYLES
  const bg = isDark ? (isAmoled ? "#000000" : "#121212") : "#fff";
  const containerBg = { backgroundColor: bg };
  const textColor = { color: isDark ? "#fff" : "#1a1a1a" };

  if (isError) {
    return (
      <View style={[styles.center, containerBg]}>
        <Ionicons name="cloud-offline-outline" size={64} color="#ff6347" />
        <Text style={[styles.sectionLabel, textColor, { marginTop: 20 }]}>
          No Connection
        </Text>
        <Text style={{ color: isDark ? "#aaa" : "#666", marginBottom: 20 }}>
          We couldn&apos;t fetch the menu.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.center, containerBg]}>
        <ActivityIndicator size="large" color="#ff6347" />
        <Text style={{ marginTop: 10, color: isDark ? "#aaa" : "#666" }}>
          Fetching fresh meals...
        </Text>
      </View>
    );
  }

  const vegetarianMeals =
    mealsData.filter((m) => m.strCategory === "Vegetarian") || [];

  const heroMeals =
    vegetarianMeals.length >= 3
      ? vegetarianMeals.slice(0, 3)
      : mealsData.slice(0, 3) || [];

  const heroMealIds = heroMeals.map((m) => m.idMeal);

  const gridMeals =
    mealsData.filter((m) => !heroMealIds.includes(m.idMeal)).slice(0, 6) || [];

  const topPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 20 : 60;

  return (
    <View style={[{ flex: 1 }, containerBg]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        data={gridMeals}
        keyExtractor={(item) => item.idMeal}
        numColumns={numColumns}
        key={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: topPadding,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#ff6347"]}
            tintColor="#ff6347"
            progressViewOffset={topPadding}
          />
        }
        renderItem={({ item }) => (
          <View style={{ width: `${100 / numColumns}%`, padding: 5 }}>
            <MealCard meal={item} />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <Text style={[styles.sectionLabel, textColor]}>
              Featured Dishes
            </Text>
            <View style={styles.sameGrid}>
              {heroMeals.map((meal) => (
                <View
                  key={meal.idMeal}
                  style={{ width: `${100 / numColumns}%`, padding: 5 }}
                >
                  <MealCard meal={meal} />
                </View>
              ))}
            </View>
            <Text style={[styles.sectionLabel, textColor]}>
              More Discoveries
            </Text>
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
  sectionLabel: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    marginHorizontal: 16,
    letterSpacing: -0.5,
  },
  sameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 5,
  },
  retryBtn: {
    backgroundColor: "#ff6347",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
