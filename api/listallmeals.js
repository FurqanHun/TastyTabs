import axios from "axios";

export const fetchMeals = async () => {
  const letters = ["a", "b", "c", "d"];

  const requests = letters.map((letter) =>
    axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
    )
  );

  const responses = await Promise.all(requests);

  const allMeals = responses.flatMap(
    (res) => res.data.meals || []
  );

  const shuffledMeals = allMeals.sort(() => Math.random() - 0.5);

  return shuffledMeals;
};
