import { createSlice } from "@reduxjs/toolkit";

const vaultSlice = createSlice({
  name: "vault",
  initialState: [],
  reducers: {
    addToVault: (state, action) => {
      const meal = action.payload;
      // Check if meal already exists
      if (!state.find(item => item.idMeal === meal.idMeal)) {
        state.push(meal);
        // Sort in ascending order by name
        state.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
      }
    },
    removeFromVault: (state, action) => {
      return state.filter(item => item.idMeal !== action.payload);
    },
  },
});

export const { addToVault, removeFromVault } = vaultSlice.actions;
export default vaultSlice.reducer;
