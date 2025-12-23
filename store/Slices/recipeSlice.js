import { createSlice } from "@reduxjs/toolkit";

const recipeSlice = createSlice({
  name: "recipe",
  initialState: {
    allmeals: [],
  },
  reducers: {
    getAllMeals: (state, action) => {
      state.allmeals = action.payload;
    },
    appendMeals: (state, action) => {
      const newMeals = action.payload;
      // filtering dupes in redux to be safe
      const existingIds = new Set(state.allmeals.map((m) => m.idMeal));
      const uniqueNewMeals = newMeals.filter((m) => !existingIds.has(m.idMeal));

      state.allmeals = [...state.allmeals, ...uniqueNewMeals];
    },
  },
});

export const { getAllMeals, appendMeals } = recipeSlice.actions;
export default recipeSlice.reducer;
