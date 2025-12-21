import { createSlice } from "@reduxjs/toolkit";

const vaultSlice = createSlice({
  name: "vault",
  initialState: {
    savedRecipes: [],
  },
  reducers: {
    saveRecipe: (state, action) => {
      // check for not adding dupes
      const exists = state.savedRecipes.find(
        (r) => r.idMeal === action.payload.idMeal,
      );
      if (!exists) {
        state.savedRecipes.push(action.payload);
      }
    },
    removeRecipe: (state, action) => {
      state.savedRecipes = state.savedRecipes.filter(
        (r) => r.idMeal !== action.payload,
      );
    },
  },
});

export const { saveRecipe, removeRecipe } = vaultSlice.actions;
export default vaultSlice.reducer;
