import axios from "axios";

export const fetchCategories = async () => {
  const res = await axios.get(
    "https://www.themealdb.com/api/json/v1/1/categories.php",
  );

  return res.data.categories;
};
