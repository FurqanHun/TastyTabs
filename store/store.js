
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import personalNotesReducer from "./Slices/personalNotesSlice";
import RecipeReducer from "./Slices/recipeSlice.js";
import vaultReducer from "./Slices/vaultSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  personalNotes: personalNotesReducer,
   vault: vaultReducer,
    recipe: RecipeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
