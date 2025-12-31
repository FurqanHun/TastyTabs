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
import { appendMeals } from "../../../store/Slices/recipeSlice";

const SEARCH_MODES = [
  { id: "name", label: "Name" },
  { id: "ingredient", label: "Ingredient" },
  { id: "category", label: "Category" },
  { id: "area", label: "Region" },
];

const SCOPES = [
  { id: "global", label: "Global" }, // Web + Cache
  { id: "cache", label: "Cache" }, // Cache ONLY (Offline mode)
  { id: "personal", label: "My Kitchen" },
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

  const isDark = useSelector((state) => state.preferences.darkMode);
  const isAmoled = useSelector((state) => state.preferences.amoledMode);

  // SELECTORS
  const { allmeals } = useSelector((state) => state.recipe);
  const myRecipes = useSelector((state) => state.personalrecipes.allmyrecipes);
  const vaultRecipes = useSelector((state) => {
    const v = state.vault;
    return Array.isArray(v) ? v : v.items || [];
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchMode, setSearchMode] = useState("name");
  const [searchScope, setSearchScope] = useState("global");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sort, setSort] = useState("NEW");

  const [showFilters, setShowFilters] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;

  const getThemeColor = (light, dark, amoled) => {
    return isDark ? (isAmoled ? amoled : dark) : light;
  };
  const themeColors = {
    bg: getThemeColor("#F8F9FA", "#121212", "#000000"),
    headerBg: getThemeColor("#fff", "#121212", "#000000"),
    border: getThemeColor("#f0f0f0", "#333", "#222"),
    searchBg: getThemeColor("#F5F5F5", "#1E1E1E", "#121212"),
    text: isDark ? "#fff" : "#333",
    subText: isDark ? "#aaa" : "#999",
    cardBg: getThemeColor("#FFF", "#1E1E1E", "#121212"),
    borderColor: getThemeColor("#E0E0E0", "#333", "#222"),
    chipBg: getThemeColor("#FFF", "#1E1E1E", "#121212"),
    chipBorder: getThemeColor("#EEE", "#333", "#222"),
    sortRowBg: getThemeColor("#F8F9FA", "#121212", "#000000"),
  };

  const handleSearchTextChange = (text) => {
    setSearch(text);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // UNIFIED LOCAL SEARCH (Cache + Vault + Personal)
  const localSearchResults = useMemo(() => {
    // If not searching and not in targeted scope, return empty
    const isTargeted = searchScope === "personal" || searchScope === "cache";
    if (!debouncedSearch && !isTargeted) return [];

    const query = debouncedSearch.toLowerCase();
    const combinedMap = new Map();

    const addToMap = (list) => {
      if (!list) return;
      list.forEach((item) => {
        if (!combinedMap.has(item.idMeal)) {
          let match = false;

          // Empty search in targeted scopes = Show All
          if (!debouncedSearch && isTargeted) {
            match = true;
          } else {
            // Check Criteria
            if (searchMode === "name") {
              match = item.strMeal?.toLowerCase().includes(query);
            } else if (searchMode === "category") {
              match = item.strCategory?.toLowerCase().includes(query);
            } else if (searchMode === "area") {
              match = item.strArea?.toLowerCase().includes(query);
            } else if (searchMode === "ingredient") {
              if (item.ingredients && Array.isArray(item.ingredients)) {
                match = item.ingredients.some((i) =>
                  i.name.toLowerCase().includes(query),
                );
              } else {
                for (let i = 1; i <= 20; i++) {
                  if (
                    item[`strIngredient${i}`]?.toLowerCase().includes(query)
                  ) {
                    match = true;
                    break;
                  }
                }
              }
            }
          }

          if (match) combinedMap.set(item.idMeal, item);
        }
      });
    };

    if (searchScope === "personal") {
      addToMap(myRecipes);
    } else {
      // Global AND Cache scopes check EVERYTHING local
      addToMap(myRecipes);
      addToMap(vaultRecipes);
      addToMap(allmeals);
    }

    return Array.from(combinedMap.values());
  }, [
    debouncedSearch,
    searchMode,
    searchScope,
    myRecipes,
    vaultRecipes,
    allmeals,
  ]);

  // API Search
  const { data: apiResults, isLoading: apiLoading } = useQuery({
    queryKey: ["search", debouncedSearch, searchMode],
    queryFn: async () => {
      if (!debouncedSearch) return null;
      try {
        const results = await searchGlobal(debouncedSearch, searchMode);
        return results.map((item) => ({
          ...item,
          strCategory:
            searchMode === "category"
              ? debouncedSearch
              : item.strCategory || "",
          strArea: searchMode === "area" ? debouncedSearch : item.strArea || "",
        }));
      } catch (_) {
        return [];
      }
    },
    // 🦍 DISABLE API if scope is Cache OR Personal
    enabled: !!debouncedSearch && searchScope === "global",
  });

  // 🦍 5. GREEDY CAPTURE: Steal API results and put them in Redux Cache
  useEffect(() => {
    if (apiResults && apiResults.length > 0) {
      const newItems = apiResults.filter(
        (apiItem) => !allmeals.some((local) => local.idMeal === apiItem.idMeal),
      );
      if (newItems.length > 0) {
        dispatch(appendMeals(newItems));
      }
    }
  }, [apiResults, allmeals, dispatch]);

  const isBrowsing = !debouncedSearch && searchScope === "global";

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
      dispatch(appendMeals(unique));
    }
  }, [browseData, dispatch, isBrowsing]);

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const loadMoreMeals = async () => {
    if (!isBrowsing || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const newMeals = await fetchMeals(8);
      const uniqueBatch = Array.from(
        new Map(newMeals.map((m) => [m.idMeal, m])).values(),
      );
      const existingIds = new Set(allmeals.map((m) => m.idMeal));
      const finalUnique = uniqueBatch.filter((m) => !existingIds.has(m.idMeal));
      if (finalUnique.length > 0) dispatch(appendMeals(finalUnique));
    } catch (_) {}
    setIsFetchingMore(false);
  };

  // MERGE & SORT
  const finalDisplayData = useMemo(() => {
    let data = [];

    const showLocal =
      debouncedSearch || searchScope === "personal" || searchScope === "cache";

    if (showLocal) {
      // Grab Local Results (which now includes captured API results)
      const localIds = new Set(localSearchResults.map((m) => m.idMeal));
      data = [...localSearchResults];

      // Append Live API Results (Only if Global Scope)
      if (searchScope === "global" && apiResults) {
        apiResults.forEach((item) => {
          if (!localIds.has(item.idMeal)) {
            data.push(item);
          }
        });
      }
    } else {
      // Browsing Mode
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
    localSearchResults,
    allmeals,
    selectedCategory,
    sort,
    searchScope,
  ]);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ width: width / numColumns - 16, margin: 8 }}>
        <MealCard meal={item} />
      </View>
    ),
    [width, numColumns],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: themeColors.bg },
      ]}
    >
      <View
        style={[
          styles.headerWrapper,
          {
            backgroundColor: themeColors.headerBg,
            borderBottomColor: themeColors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: themeColors.searchBg },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={themeColors.subText}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={
                searchScope === "personal"
                  ? `Search my recipes by ${searchMode}...`
                  : searchScope === "cache"
                    ? `Search downloaded by ${searchMode}...`
                    : `Search by ${searchMode}...`
              }
              value={search}
              onChangeText={handleSearchTextChange}
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholderTextColor={themeColors.subText}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.borderColor,
              },
              showFilters && styles.filterBtnActive,
            ]}
            onPress={toggleFilters}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={showFilters ? "#fff" : themeColors.text}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View>
            {/* ROW 1: SCOPE */}
            <View style={[styles.filterSection, { borderBottomWidth: 0 }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
              >
                {SCOPES.map((scope) => (
                  <TouchableOpacity
                    key={scope.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: themeColors.chipBg,
                        borderColor: themeColors.chipBorder,
                        borderWidth: 2,
                      },
                      searchScope === scope.id && styles.chipActive,
                    ]}
                    onPress={() => setSearchScope(scope.id)}
                  >
                    <Ionicons
                      name={
                        scope.id === "personal"
                          ? "home"
                          : scope.id === "cache"
                            ? "save"
                            : "globe-outline"
                      }
                      size={14}
                      color={
                        searchScope === scope.id
                          ? "#FFF"
                          : isDark
                            ? "#ccc"
                            : "#666"
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isDark ? "#ccc" : "#666" },
                        searchScope === scope.id && styles.chipTextActive,
                      ]}
                    >
                      {scope.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ROW 2: CRITERIA */}
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
                      {
                        backgroundColor: themeColors.chipBg,
                        borderColor: themeColors.chipBorder,
                      },
                      searchMode === mode.id && styles.chipActive,
                    ]}
                    onPress={() => setSearchMode(mode.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isDark ? "#ccc" : "#666" },
                        searchMode === mode.id && styles.chipTextActive,
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.sortRow,
          {
            backgroundColor: themeColors.sortRowBg,
            borderTopColor: themeColors.border,
          },
        ]}
      >
        <Text style={[styles.resultsCount, { color: themeColors.subText }]}>
          {finalDisplayData.length} Results
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["NEW", "AZ", "ZA"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSort(type)}
              style={[
                styles.sortBtn,
                { backgroundColor: getThemeColor("#EEE", "#333", "#222") },
                sort === type && styles.sortBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  { color: themeColors.text },
                  sort === type && styles.sortBtnTextActive,
                ]}
              >
                {type === "NEW" ? "New" : type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CATEGORY FILTERS */}
      {showFilters &&
        !debouncedSearch &&
        searchScope === "global" &&
        searchMode === "name" && (
          <View
            style={[styles.filterPanel, { backgroundColor: themeColors.bg }]}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Browse Categories
            </Text>
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
                      {
                        backgroundColor: themeColors.chipBg,
                        borderColor: themeColors.chipBorder,
                      },
                      selectedCategory === item.strCategory &&
                        styles.chipActive,
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
                        { color: isDark ? "#ccc" : "#666" },
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

      {/* LOADING STATE */}
      {apiLoading && finalDisplayData.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={{ color: themeColors.subText, marginTop: 10 }}>
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
            debouncedSearch && finalDisplayData.length > 0 ? (
              <View style={{ padding: 16, paddingBottom: 0 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#FF6347" }}
                >
                  {apiLoading
                    ? "Found locally (Searching web...)"
                    : `Found ${finalDisplayData.length} matches`}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name={debouncedSearch ? "sad-outline" : "restaurant-outline"}
                size={60}
                color={isDark ? "#333" : "#eee"}
              />
              <Text
                style={{
                  color: themeColors.subText,
                  marginTop: 10,
                  fontSize: 16,
                }}
              >
                {debouncedSearch
                  ? "No matching recipes found."
                  : searchScope === "personal"
                    ? "Start typing to search your kitchen!"
                    : searchScope === "cache"
                      ? "Nothing in cache. Search Global first!"
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
  container: { flex: 1 },
  headerWrapper: {
    paddingBottom: 10,
    borderBottomWidth: 1,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 15, height: "100%" },
  filterBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  filterBtnActive: { backgroundColor: "#FF6347", borderColor: "#FF6347" },
  modeRow: { marginTop: 8 },
  filterSection: { paddingVertical: 5 },
  filterPanel: { paddingVertical: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: "#FF6347", borderColor: "#FF6347" },
  chipText: { fontWeight: "600", fontSize: 12 },
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
  },
  resultsCount: { fontSize: 12, fontWeight: "500" },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortBtnActive: { backgroundColor: "#FF6347" },
  sortBtnText: { fontSize: 11 },
  sortBtnTextActive: { color: "#FFF" },
});
