import axios from "axios";

export const fetchMealById = async (id) => {
  const res = await axios.get(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
  );
  return res.data.meals[0]; 
};
