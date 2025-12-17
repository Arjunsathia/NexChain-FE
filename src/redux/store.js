import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import walletReducer from "./slices/walletSlice";
import portfolioReducer from "./slices/portfolioSlice";
import coinReducer from "./slices/coinSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    wallet: walletReducer,
    portfolio: portfolioReducer,
    coins: coinReducer,
  },
});
