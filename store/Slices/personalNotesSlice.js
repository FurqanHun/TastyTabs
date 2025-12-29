import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: {
    // recipeId: "my personal note"
  },
};

const personalNotesSlice = createSlice({
  name: "personalNotes",
  initialState,
  reducers: {
    saveNote: (state, action) => {
      const { recipeId, text } = action.payload;
      state.notes[recipeId] = text;
    },
    clearNote: (state, action) => {
      delete state.notes[action.payload];
    },
    clearAllNotes: (state) => {
      state.notes = {};
    },
  },
});

export const { saveNote, clearNote, clearAllNotes } =
  personalNotesSlice.actions;
export default personalNotesSlice.reducer;
