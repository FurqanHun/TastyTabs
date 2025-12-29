import { createSlice } from "@reduxjs/toolkit";

const PersonalrecipeSlice = createSlice({
  name: "personalrecipes",
  initialState: {
    allmyrecipes: [],
  },
  reducers: {
    setAllPersonalRecipes: (state, action) => {
      state.allmyrecipes = action.payload;
    },

    addPersonalRecipe: (state, action) => {
      state.allmyrecipes.unshift(action.payload);
    },

    updatePersonalRecipe: (state, action) => {
      const index = state.allmyrecipes.findIndex(
        (recipe) => String(recipe.idMeal) === String(action.payload.idMeal),
      );
      if (index !== -1) {
        state.allmyrecipes[index] = action.payload;
      }
    },

    deletePersonalRecipe: (state, action) => {
      state.allmyrecipes = state.allmyrecipes.filter(
        (recipe) => String(recipe.idMeal) !== String(action.payload),
      );
    },

    clearAllPersonalRecipes: (state) => {
      state.allmyrecipes = [];
    },
  },
});

export const {
  setAllPersonalRecipes,
  addPersonalRecipe,
  updatePersonalRecipe,
  deletePersonalRecipe,
  clearAllPersonalRecipes,
} = PersonalrecipeSlice.actions;

export default PersonalrecipeSlice.reducer;
