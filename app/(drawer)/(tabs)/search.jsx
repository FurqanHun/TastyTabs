import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { fetchCategories } from "../../../api/fetchcategories";
import { fetchMeals } from "../../../api/listallmeals";
import { MealCard } from "../../../components/MealCard";
import { getAllMeals } from "../../../store/Slices/recipeSlice";

const PAGE_SIZE = 12;

export default function SearchScreen() {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const { allmeals } = useSelector((state) => state.recipe);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [sort, setSort] = useState("NEW");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;
  const listKey = `cols-${numColumns}`;

  const {
    data: mealsData,
    isLoading: mealsLoading,
    isFetching: mealsFetching,
  } = useQuery({
    queryKey: ["meals"],
    queryFn: () => fetchMeals(50),
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (mealsData) {
      // filter duplicates
      const uniqueMeals = Array.from(
        new Map(mealsData.map((meal) => [meal.idMeal, meal])).values(),
      );

      dispatch(getAllMeals(uniqueMeals));
    }
  }, [mealsData]);

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
    // Category Filter
    if (selectedCategory) {
      data = data.filter((m) => m.strCategory === selectedCategory);
    }
    // Area Filter
    if (selectedArea) {
      data = data.filter((m) => m.strArea === selectedArea);
    }

    // 🔹 Sorting Logic (Including dateModified)
    data.sort((a, b) => {
      if (sort === "AZ") return a.strMeal.localeCompare(b.strMeal);
      if (sort === "ZA") return b.strMeal.localeCompare(a.strMeal);
      if (sort === "NEW") {
        // dateModified ko compare karein (Latest first)
        const dateA = a.dateModified ? new Date(a.dateModified) : new Date(0);
        const dateB = b.dateModified ? new Date(b.dateModified) : new Date(0);
        return dateB - dateA;
      }
      return 0;
    });

    return data.slice(0, visibleCount);
  }, [allmeals, search, selectedCategory, selectedArea, sort, visibleCount]);

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
    <View style={styles.container}>
      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for your favorite meal..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterWrapper}>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
        <FlatList
          horizontal
          data={catData || []}
          keyExtractor={(item) => item.idCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
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

        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
          Regions (Areas)
        </Text>
        <FlatList
          horizontal
          data={areas}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
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
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.resultsCount}>
          {filteredMeals.length} Meals found
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            flex: 1,
          }}
        >
          <TouchableOpacity
            onPress={() => setSort("NEW")}
            style={[styles.sortBtn, sort === "NEW" && styles.sortBtnActive]}
          >
            <Text
              style={[
                styles.sortBtnText,
                sort === "NEW" && styles.sortBtnTextActive,
              ]}
            >
              Newest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSort("AZ")}
            style={[styles.sortBtn, sort === "AZ" && styles.sortBtnActive]}
          >
            <Text
              style={[
                styles.sortBtnText,
                sort === "AZ" && styles.sortBtnTextActive,
              ]}
            >
              A-Z
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSort("ZA")}
            style={[styles.sortBtn, sort === "ZA" && styles.sortBtnActive]}
          >
            <Text
              style={[
                styles.sortBtnText,
                sort === "ZA" && styles.sortBtnTextActive,
              ]}
            >
              Z-A
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mealsLoading && allmeals.length === 0 ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Loading Delicious Meals...
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
          onEndReached={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View style={{ width: width / numColumns - 20, padding: 8 }}>
              <MealCard meal={item} />
            </View>
          )}
          ListFooterComponent={
            mealsFetching ? (
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
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  search: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterWrapper: {
    paddingLeft: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  horizontalList: {
    paddingRight: 20,
    paddingBottom: 5,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: 13,
  },
  chipTextActive: {
    color: "#FFF",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  resultsCount: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 5,
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
    paddingHorizontal: 8,
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
