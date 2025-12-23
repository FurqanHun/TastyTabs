import axios from "axios";

export const searchMealsByName = async (query) => {
  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`,
    );
    // return empty array to prevent crashes
    return response.data.meals || [];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};
