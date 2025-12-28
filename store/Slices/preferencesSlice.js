import { createSlice } from "@reduxjs/toolkit";
import { Appearance } from "react-native";

const systemTheme = Appearance.getColorScheme();

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: {
    darkMode: systemTheme === "dark",
  },
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { toggleTheme } = preferencesSlice.actions;
export default preferencesSlice.reducer;
