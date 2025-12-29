import { createSlice } from "@reduxjs/toolkit";

const vaultSlice = createSlice({
  name: "vault",
  initialState: {
    items: [],
  },
  reducers: {
    toggleVaultItem: (state, action) => {
      const meal = action.payload;
      if (!state.items) state.items = [];

      const existingIndex = state.items.findIndex(
        (item) => item.idMeal === meal.idMeal,
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(meal);
        state.items.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
      }
    },
    clearVault: (state) => {
      state.items = [];
    },
    setVaultItems: (state, action) => {
      state.items = action.payload || [];
    },
  },
});

export const { toggleVaultItem, clearVault, setVaultItems } =
  vaultSlice.actions;
export default vaultSlice.reducer;
