import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../api/fetchcategories";
import { fetchMeals } from "../../../api/listallmeals";
import { searchGlobal } from "../../../api/search";
import { MealCard } from "../../../components/MealCard";
import { appendMeals, getAllMeals } from "../../../store/Slices/recipeSlice";

const SEARCH_MODES = [
  { id: "name", label: "Name" },
  { id: "ingredient", label: "Ingredient" },
  { id: "category", label: "Category" },
  { id: "area", label: "Region" },
];

const LoadingChips = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
  >
    {[1, 2, 3, 4].map((i) => (
      <View
        key={i}
        style={[
          styles.chip,
          {
            width: 80,
            height: 35,
            backgroundColor: "#f0f0f0",
            borderColor: "transparent",
          },
        ]}
      />
    ))}
  </ScrollView>
);

export default function SearchScreen() {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { allmeals } = useSelector((state) => state.recipe);
  const myRecipes = useSelector((state) => state.personalrecipes.allmyrecipes);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchMode, setSearchMode] = useState("name");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sort, setSort] = useState("NEW");

  const [showFilters, setShowFilters] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;

  const handleSearchTextChange = (text) => {
    setSearch(text);
    if (text.length === 1 && !showFilters) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowFilters(true);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const filteredPersonalRecipes = useMemo(() => {
    if (!debouncedSearch) return [];
    const query = debouncedSearch.toLowerCase();

    return myRecipes.filter((recipe) => {
      if (searchMode === "name")
        return recipe.strMeal.toLowerCase().includes(query);
      if (searchMode === "category")
        return recipe.strCategory.toLowerCase().includes(query);
      if (searchMode === "area")
        return recipe.strArea.toLowerCase().includes(query);
      if (searchMode === "ingredient") {
        return recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(query),
        );
      }
      return false;
    });
  }, [debouncedSearch, searchMode, myRecipes]);

  const { data: apiResults, isLoading: apiLoading } = useQuery({
    queryKey: ["search", debouncedSearch, searchMode],
    queryFn: async () => {
      if (!debouncedSearch) return null;
      const results = await searchGlobal(debouncedSearch, searchMode);

      // Patch data
      return results.map((item) => ({
        ...item,
        strCategory:
          searchMode === "category" ? debouncedSearch : item.strCategory || "",
        strArea: searchMode === "area" ? debouncedSearch : item.strArea || "",
      }));
    },
    enabled: !!debouncedSearch,
  });

  const isBrowsing = !debouncedSearch;

  const { data: browseData } = useQuery({
    queryKey: ["meals_browse"],
    queryFn: () => fetchMeals(12),
    enabled: isBrowsing && allmeals.length === 0,
  });

  useEffect(() => {
    if (browseData && isBrowsing) {
      const unique = Array.from(
        new Map(browseData.map((m) => [m.idMeal, m])).values(),
      );
      dispatch(getAllMeals(unique));
    }
  }, [browseData, dispatch, isBrowsing]);

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const loadMoreMeals = async () => {
    if (!isBrowsing || isFetchingMore) return;
    setIsFetchingMore(true);

    const newMeals = await fetchMeals(8);
    // bouncer
    const uniqueBatch = Array.from(
      new Map(newMeals.map((m) => [m.idMeal, m])).values(),
    );
    const existingIds = new Set(allmeals.map((m) => m.idMeal));
    const finalUnique = uniqueBatch.filter((m) => !existingIds.has(m.idMeal));

    if (finalUnique.length > 0) dispatch(appendMeals(finalUnique));
    setIsFetchingMore(false);
  };

  const finalDisplayData = useMemo(() => {
    let data = [];
    if (debouncedSearch) {
      const apiItems = apiResults || [];
      data = [...filteredPersonalRecipes, ...apiItems];
    } else {
      data = [...allmeals];
      if (selectedCategory)
        data = data.filter((m) => m.strCategory === selectedCategory);
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
  }, [
    debouncedSearch,
    apiResults,
    filteredPersonalRecipes,
    allmeals,
    selectedCategory,
    sort,
  ]);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  // Extract renderItem with useCallback
  // prevents sheise React from thinking every row is darn new on every render
  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ width: width / numColumns - 16, margin: 8 }}>
        <MealCard meal={item} />
      </View>
    ),
    [width, numColumns],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={
                searchMode === "name"
                  ? "Search recipes..."
                  : `Search by ${searchMode}...`
              }
              value={search}
              // custom handler to auto open filters
              onChangeText={handleSearchTextChange}
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

        {showFilters && search.length > 0 && (
          <View style={styles.modeRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            >
              {SEARCH_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.chip,
                    searchMode === mode.id && styles.chipActive,
                  ]}
                  onPress={() => setSearchMode(mode.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      searchMode === mode.id && styles.chipTextActive,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.resultsCount}>
          {finalDisplayData.length} Results
        </Text>
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

      {/* CATEGORY FILTERS (Only show if browsing & filters on) */}
      {showFilters && !debouncedSearch && (
        <View style={styles.filterPanel}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          {catLoading ? (
            <LoadingChips />
          ) : (
            <FlatList
              horizontal
              data={catData || []}
              keyExtractor={(item) => item.idCategory}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    selectedCategory === item.strCategory && styles.chipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === item.strCategory
                        ? null
                        : item.strCategory,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === item.strCategory &&
                        styles.chipTextActive,
                    ]}
                  >
                    {item.strCategory}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {apiLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={{ color: "#888", marginTop: 10 }}>
            Searching global database...
          </Text>
        </View>
      ) : (
        <FlatList
          key={`cols-${numColumns}`}
          data={finalDisplayData}
          keyExtractor={(item, index) =>
            item.idMeal ? item.idMeal.toString() : index.toString()
          }
          numColumns={numColumns}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={renderItem}
          onEndReached={loadMoreMeals}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            debouncedSearch && filteredPersonalRecipes.length > 0 ? (
              <View style={{ padding: 16, paddingBottom: 0 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#FF6347" }}
                >
                  From Your Kitchen ({filteredPersonalRecipes.length})
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name={debouncedSearch ? "sad-outline" : "restaurant-outline"}
                size={60}
                color="#eee"
              />
              <Text style={{ color: "#999", marginTop: 10, fontSize: 16 }}>
                {debouncedSearch
                  ? "No matching recipes found."
                  : "Start typing to search!"}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator style={{ margin: 20 }} color="#FF6347" />
            ) : (
              <View style={{ height: 20 }} />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  headerWrapper: {
    backgroundColor: "#fff",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
    height: 60,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#333", height: "100%" },

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
  filterBtnActive: { backgroundColor: "#FF6347", borderColor: "#FF6347" },

  modeRow: { marginTop: 5 },

  filterPanel: { paddingVertical: 10, backgroundColor: "#F8F9FA" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    marginLeft: 16,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chipActive: { backgroundColor: "#FF6347", borderColor: "#FF6347" },
  chipText: { color: "#666", fontWeight: "600", fontSize: 12 },
  chipTextActive: { color: "#FFF" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
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
  resultsCount: { color: "#888", fontSize: 12, fontWeight: "500" },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  sortBtnActive: { backgroundColor: "#FF6347" },
  sortBtnText: { fontSize: 11, color: "#333" },
  sortBtnTextActive: { color: "#FFF" },
});
