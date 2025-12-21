import { configureStore } from "@reduxjs/toolkit";
import vaultReducer from "./Slices/vaultSlice";
import RecipeReducer from "./Slices/recipeSlice.js";

export const store = configureStore({
  reducer: {
    vault: vaultReducer,
    recipe: RecipeReducer,
  },
});
