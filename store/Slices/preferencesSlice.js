import { createSlice } from "@reduxjs/toolkit";
import { Appearance } from "react-native";

const systemTheme = Appearance.getColorScheme();

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: {
    darkMode: systemTheme === "dark",
    amoledMode: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleAmoled: (state) => {
      state.amoledMode = !state.amoledMode;
    },
  },
});

export const { toggleTheme, toggleAmoled } = preferencesSlice.actions;
export default preferencesSlice.reducer;
