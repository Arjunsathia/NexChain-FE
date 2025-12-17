import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import walletReducer from "./slices/walletSlice";
import portfolioReducer from "./slices/portfolioSlice";
import coinReducer from "./slices/coinSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    wallet: walletReducer,
    portfolio: portfolioReducer,
    coins: coinReducer,
  },
});
