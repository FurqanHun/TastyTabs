import { createSlice } from "@reduxjs/toolkit";

const vaultSlice = createSlice({
  name: "vault",
  initialState: {
    items: [],
  },
  reducers: {
    // addToVault: (state, action) => {
    //   const meal = action.payload;

    //   if (!state.items) {
    //     state.items = [];
    //   }

    //   const exists = state.items.find((item) => item.idMeal === meal.idMeal);

    //   if (!exists) {
    //     state.items.push(meal);
    //     state.items.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    //   }
    // },
    // removeFromVault: (state, action) => {
    //   if (state.items) {
    //     state.items = state.items.filter(
    //       (item) => item.idMeal !== action.payload,
    //     );
    //   } else {
    //     return { items: [] };
    //   }
    // },
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
  },
});

export const { toggleVaultItem } = vaultSlice.actions;
export default vaultSlice.reducer;
