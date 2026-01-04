import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import personalNotesReducer from "./Slices/personalNotesSlice";
import RecipeReducer from "./Slices/recipeSlice.js";
import vaultReducer from "./Slices/vaultSlice";
import PersonalRecipeReducer from "./Slices/personalrecipesSlice.js";
import preferencesReducer from "./Slices/preferencesSlice";

// --- SSR Fix Start ---
// Ye dummy storage server-side par error nahi dega
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined" ? AsyncStorage : createNoopStorage();
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["vault", "personalNotes", "personalrecipes", "preferences"],
};

const rootReducer = combineReducers({
  personalNotes: personalNotesReducer,
  vault: vaultReducer,
  recipe: RecipeReducer,
  personalrecipes: PersonalRecipeReducer,
  preferences: preferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // imp for persistence
    }),
});

export const persistor = persistStore(store);
