import { configureStore } from "@reduxjs/toolkit";
import vaultReducer from "./vaultSlice";

export const store = configureStore({
  reducer: {
    vault: vaultReducer,
  },
});
