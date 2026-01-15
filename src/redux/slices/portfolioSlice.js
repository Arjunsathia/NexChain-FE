import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData, postForm } from "@/api/axiosConfig";
import { jwtDecode } from "jwt-decode";
import { refreshBalance } from "./walletSlice";

const getUserId = () => {
  const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  }
  return null;
};

export const fetchPurchasedCoins = createAsyncThunk(
  "portfolio/fetchPurchasedCoins",
  async (_, { rejectWithValue }) => {
    const userId = getUserId();
    if (!userId) return [];

    try {
      const response = await getData(`/purchases/${userId}`);
      if (response.success) {
        const purchases = Array.isArray(response.purchases)
          ? response.purchases
          : [];
        return purchases.map((coin) => ({
          id: coin._id || coin.id,
          coinId: coin.coin_id || coin.coinId,
          coinName: coin.coinName || coin.name,
          coinSymbol: coin.coinSymbol || coin.symbol,
          coinPriceUSD: coin.coinPriceUSD || coin.currentPrice || coin.price,
          quantity: coin.quantity || coin.amount,
          totalCost: coin.totalCost || coin.total_cost,
          fees: coin.fees || 0,
          image: coin.image || coin.logo,
          purchaseDate: coin.purchaseDate || coin.createdAt,
          remainingInvestment: coin.totalCost,
          totalQuantity: coin.quantity,
        }));
      } else {
        return [];
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTransactionHistory = createAsyncThunk(
  "portfolio/fetchTransactionHistory",
  async (_, { rejectWithValue }) => {
    const userId = getUserId();
    if (!userId) return [];
    try {
      const response = await getData(`/purchases/transactions/${userId}`);
      if (response?.success) {
        return response.transactions || [];
      } else {
        return [];
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addPurchase = createAsyncThunk(
  "portfolio/addPurchase",
  async (purchaseData, { rejectWithValue, dispatch }) => {
    const userId = getUserId();
    if (!userId) return rejectWithValue("User not authenticated");

    try {
      const finalPurchaseData = { ...purchaseData, user_id: userId };
      const response = await postForm("/purchases/buy", finalPurchaseData);
      if (response.success) {
        dispatch(fetchTransactionHistory());
        return response;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const sellCoins = createAsyncThunk(
  "portfolio/sellCoins",
  async (sellData, { rejectWithValue, dispatch }) => {
    const userId = getUserId();
    if (!userId) return rejectWithValue("User not authenticated");

    try {
      const finalSellData = { ...sellData, user_id: userId };
      const response = await postForm("/purchases/sell", finalSellData);
      if (response.success) {
        dispatch(fetchTransactionHistory());
        return response;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: {
    purchasedCoins: [],
    transactionHistory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchasedCoins.pending, (state) => {
        if (state.purchasedCoins.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchPurchasedCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.purchasedCoins = action.payload;
      })
      .addCase(fetchPurchasedCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.transactionHistory = action.payload;
      })
      .addCase(addPurchase.fulfilled, (state, action) => {
        const newPurchase = action.payload.purchase;
        if (newPurchase) {
          state.purchasedCoins.push({
            id: newPurchase._id,
            coinId: newPurchase.coinId,
            coinName: newPurchase.coinName,
            coinSymbol: newPurchase.coinSymbol,
            coinPriceUSD: newPurchase.coinPriceUSD,
            quantity: newPurchase.quantity,
            totalCost: newPurchase.totalCost,
            fees: newPurchase.fees,
            image: newPurchase.image,
            purchaseDate: newPurchase.purchaseDate,
            remainingInvestment: newPurchase.totalCost,
            totalQuantity: newPurchase.quantity,
          });
        }
      })
      .addCase(sellCoins.fulfilled, (state, action) => {
        const { deletedPurchases, updatedPurchases } = action.payload;
        
        // Remove deleted coins
        if (deletedPurchases && deletedPurchases.length > 0) {
          state.purchasedCoins = state.purchasedCoins.filter(
            (coin) => !deletedPurchases.includes(coin.id)
          );
        }

        // Update modified coins
        if (updatedPurchases && updatedPurchases.length > 0) {
          state.purchasedCoins = state.purchasedCoins.map((coin) => {
            const updated = updatedPurchases.find((u) => u._id === coin.id);
            if (updated) {
              return {
                ...coin,
                quantity: updated.quantity,
                totalCost: updated.totalCost,
                remainingInvestment: updated.totalCost, // Assuming reset on update? Or check logic. 
                // Usually sell reduces quantity and totalCost proportionally or specifically. 
                // Backend executeSell updates these fields.
                totalQuantity: updated.quantity,
              };
            }
            return coin;
          });
        }
      });
  },
});

export default portfolioSlice.reducer;
