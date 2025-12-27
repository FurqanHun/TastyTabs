import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  LayoutAnimation,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCategories } from "../../../api/fetchcategories";
import { fetchMeals } from "../../../api/listallmeals";
import { searchMealsByName } from "../../../api/search";
import { MealCard } from "../../../components/MealCard";
import { appendMeals, getAllMeals } from "../../../store/Slices/recipeSlice";

// Helper Component
const LoadingChips = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.horizontalList}
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <View
        key={i}
        style={[
          styles.chip,
          {
            backgroundColor: "#f0f0f0",
            borderColor: "#f0f0f0",
            width: 80,
            height: 35,
          },
        ]}
      />
    ))}
  </ScrollView>
);

export default function SearchScreen() {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets(); // 🦍 Get Safe Area (Notch/Status Bar)
  const { allmeals } = useSelector((state) => state.recipe);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [sort, setSort] = useState("NEW");

  const [showFilters, setShowFilters] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Responsive Grid
  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;
  const listKey = `cols-${numColumns}`;

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 240,
      offset: 240 * Math.floor(index / numColumns),
      index,
    }),
    [numColumns],
  );

  const toggleFilters = () => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (_) {
      // _ so lint shuts the fuck up about defining "e" but not using it
      // Ignore error on New Architecture
    }
    setShowFilters(!showFilters);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: mealsData,
    isLoading: mealsLoading,
    isFetching: mealsFetching,
  } = useQuery({
    queryKey: ["meals", debouncedSearch],
    queryFn: () => {
      if (debouncedSearch.trim() === "") {
        return fetchMeals(12);
      } else {
        return searchMealsByName(debouncedSearch);
      }
    },
  });

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (mealsData) {
      const uniqueMeals = Array.from(
        new Map(mealsData.map((meal) => [meal.idMeal, meal])).values(),
      );
      dispatch(getAllMeals(uniqueMeals));
    }
  }, [mealsData, dispatch]);

  // Infinite Scroll
  const loadMoreMeals = async () => {
    if (debouncedSearch || selectedCategory || selectedArea || isFetchingMore)
      return;

    setIsFetchingMore(true);

    const newMeals = await fetchMeals(8);
    // bouncer
    const uniqueBatch = Array.from(
      new Map(newMeals.map((m) => [m.idMeal, m])).values(),
    );

    const existingIds = new Set(allmeals.map((m) => m.idMeal));
    const finalUniqueMeals = uniqueBatch.filter(
      (m) => !existingIds.has(m.idMeal),
    );

    if (finalUniqueMeals.length > 0) {
      dispatch(appendMeals(finalUniqueMeals));
    }

    setIsFetchingMore(false);
  };

  const areas = useMemo(() => {
    return [...new Set(allmeals.map((m) => m.strArea).filter(Boolean))].sort();
  }, [allmeals]);

  const filteredMeals = useMemo(() => {
    let data = [...allmeals];

    if (search) {
      data = data.filter((m) =>
        m.strMeal.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (selectedCategory) {
      data = data.filter((m) => m.strCategory === selectedCategory);
    }
    if (selectedArea) {
      data = data.filter((m) => m.strArea === selectedArea);
    }

    data.sort((a, b) => {
      if (sort === "AZ") return a.strMeal.localeCompare(b.strMeal);
      if (sort === "ZA") return b.strMeal.localeCompare(a.strMeal);
      if (sort === "NEW") {
        const dateA = a.dateModified ? new Date(a.dateModified) : new Date(0);
        const dateB = b.dateModified ? new Date(b.dateModified) : new Date(0);
        return dateB - dateA;
      }
      return 0;
    });

    return data;
  }, [allmeals, search, selectedCategory, selectedArea, sort]);

  // Extract renderItem with useCallback
  // prevents sheise React from thinking every row is darn new on every render
  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ width: width / numColumns - 20, padding: 8 }}>
        <MealCard meal={item} />
      </View>
    ),
    [width, numColumns],
  );

  const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top > 0 ? insets.top + -5 : 20 },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search meals..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={toggleFilters}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? "#fff" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {!showFilters && (selectedCategory || selectedArea) && (
        <View style={styles.activeFiltersRow}>
          <Text style={styles.activeFilterLabel}>Active:</Text>
          {selectedCategory && (
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={styles.miniChip}
            >
              <Text style={styles.miniChipText}>{selectedCategory} ✕</Text>
            </TouchableOpacity>
          )}
          {selectedArea && (
            <TouchableOpacity
              onPress={() => setSelectedArea(null)}
              style={styles.miniChip}
            >
              <Text style={styles.miniChipText}>{selectedArea} ✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showFilters && (
        <View style={styles.filterWrapper}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {catLoading ? (
            <LoadingChips />
          ) : (
            <FlatList
              horizontal
              data={catData || []}
              keyExtractor={(item) => item.idCategory}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item }) => (
                <FilterChip
                  label={item.strCategory}
                  active={selectedCategory === item.strCategory}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === item.strCategory
                        ? null
                        : item.strCategory,
                    )
                  }
                />
              )}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Regions</Text>
          {mealsLoading ? (
            <LoadingChips />
          ) : (
            <FlatList
              horizontal
              data={areas}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item }) => (
                <FilterChip
                  label={item}
                  active={selectedArea === item}
                  onPress={() =>
                    setSelectedArea(selectedArea === item ? null : item)
                  }
                />
              )}
            />
          )}
        </View>
      )}

      <View style={styles.sortRow}>
        <Text style={styles.resultsCount}>{filteredMeals.length} Results</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["NEW", "AZ", "ZA"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSort(type)}
              style={[styles.sortBtn, sort === type && styles.sortBtnActive]}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  sort === type && styles.sortBtnTextActive,
                ]}
              >
                {type === "NEW" ? "New" : type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mealsLoading && allmeals.length === 0 ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Searching the Kitchen...
          </Text>
        </View>
      ) : (
        <FlatList
          key={listKey}
          data={filteredMeals}
          keyExtractor={(item) => item.idMeal}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
          contentContainerStyle={styles.mealListContent}
          getItemLayout={getItemLayout}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
          renderItem={renderItem}
          onEndReached={loadMoreMeals}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore || (mealsFetching && allmeals.length > 0) ? (
              <ActivityIndicator style={{ margin: 20 }} color="#FF6347" />
            ) : (
              <View style={{ height: 50 }} />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  filterBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterBtnActive: {
    backgroundColor: "#FF6347",
    borderColor: "#FF6347",
  },
  filterWrapper: {
    paddingLeft: 16,
    marginBottom: 10,
    backgroundColor: "#F8F9FA",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  horizontalList: {
    paddingRight: 20,
    paddingBottom: 5,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chipActive: {
    backgroundColor: "#FF6347",
    borderColor: "#FF6347",
  },
  chipText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#FFF",
  },
  activeFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  activeFilterLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  miniChip: {
    backgroundColor: "#FF634720",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF634750",
  },
  miniChipText: {
    fontSize: 11,
    color: "#FF6347",
    fontWeight: "700",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#F8F9FA",
  },
  resultsCount: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  sortBtnActive: {
    backgroundColor: "#FF6347",
  },
  sortBtnText: {
    fontSize: 11,
    color: "#333",
  },
  sortBtnTextActive: {
    color: "#FFF",
  },
  mealListContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "flex-start",
  },
  loaderCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
