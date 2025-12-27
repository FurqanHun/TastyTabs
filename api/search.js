import axios from "axios";

export const searchGlobal = async (query, type = "name") => {
  try {
    let url = "";

    switch (type) {
      case "ingredient":
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`;
        break;
      case "category":
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${query}`;
        break;
      case "area":
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${query}`;
        break;
      case "name":
      default:
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
        break;
    }

    const response = await axios.get(url);
    return response.data.meals || [];
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};
