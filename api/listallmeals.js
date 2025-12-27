import axios from "axios";

export const fetchMeals = async (qty) => {
  const requests = Array.from({ length: qty }).map(() =>
    axios.get("https://www.themealdb.com/api/json/v1/1/random.php"),
  );

  const responses = await Promise.all(requests);

  return responses.map((res) => {
    const meal = res.data.meals[0];
    return {
      ...meal,
      recipeLink: `/recipe/${meal.idMeal}` 
    };
  });
};