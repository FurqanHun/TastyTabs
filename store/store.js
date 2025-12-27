import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import personalNotesReducer from "./Slices/personalNotesSlice";
import RecipeReducer from "./Slices/recipeSlice.js";
import vaultReducer from "./Slices/vaultSlice";
import PersonalRecipeReducer from "./Slices/personalrecipesSlice.js";

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

// Agar window undefined hai (Server pe), toh noop use karo, warna AsyncStorage
const storage =
  typeof window !== "undefined" ? AsyncStorage : createNoopStorage();
// --- SSR Fix End ---

const persistConfig = {
  key: "root",
  storage, // Yahan hamara naya 'storage' logic use ho raha hai
  whitelist: ["vault", "personalNotes" , "personalrecipes"], // Sirf vault ko persist karein
};

const rootReducer = combineReducers({
  personalNotes: personalNotesReducer,
  vault: vaultReducer,
  recipe: RecipeReducer,
  personalrecipes:PersonalRecipeReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Persist ke liye zaroori hai
    }),
});

export const persistor = persistStore(store);
