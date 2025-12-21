

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { fetchCategories } from "../../../api/fetchcategories";
import { fetchMeals } from "../../../api/listallmeals";
import CategoryFilter from "../../../components/CategoryFilter";
import { MealCard } from "../../../components/MealCard";
import { getAllMeals } from "../../../store/Slices/recipeSlice";

export default function Index() {
  const dispatch = useDispatch();
  const { allmeals } = useSelector((state) => state.recipe);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: mealsData, isLoading: mealsLoading, error: mealsError } = useQuery({
    queryKey: ["meals"],
    queryFn: fetchMeals,
  });

  const { data: categoriesData, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (mealsData) dispatch(getAllMeals(mealsData));
  }, [mealsData]);

  const filteredMeals = selectedCategory
    ? allmeals.filter((meal) => meal.strCategory === selectedCategory)
    : allmeals;


  const { width } = useWindowDimensions();
  let numColumns = 1; 

  if (width > 1200) numColumns = 4; 
  else if (width > 900) numColumns = 3;
  else if (width > 600) numColumns = 2; 

  if (mealsLoading || catLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (mealsError || catError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {categoriesData && categoriesData.length > 0 ? (
        <CategoryFilter
          categories={categoriesData}
          setSelectedCategory={setSelectedCategory}
        />
      ) : (
        <Text style={{ textAlign: "center", marginVertical: 10 }}>No categories</Text>
      )}

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.idMeal}
        renderItem={({ item }) => <MealCard meal={item} />}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
        key={numColumns} 
        columnWrapperStyle={numColumns > 1 ? { justifyContent: "space-between" } : null}
      />
    </View>
  );
}
