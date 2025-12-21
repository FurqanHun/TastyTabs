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
    
  },
});

export const { getAllMeals } = recipeSlice.actions;
export default recipeSlice.reducer;
    