import axios from "axios";

export const fetchMeals = async () => {
  const requests = Array.from({ length: 6 }).map(() =>
    axios.get("https://www.themealdb.com/api/json/v1/1/random.php"),
  );

  const responses = await Promise.all(requests);

  return responses.map((res) => res.data.meals[0]);
};
