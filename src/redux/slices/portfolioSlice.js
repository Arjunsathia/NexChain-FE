import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData, postForm } from "@/api/axiosConfig";
import { jwtDecode } from "jwt-decode";
import { refreshBalance } from "./walletSlice"; // To update balance after purchase

const getUserId = () => {
    const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
    if(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.id;
        } catch { return null; }
    }
    return null;
}

export const fetchPurchasedCoins = createAsyncThunk("portfolio/fetchPurchasedCoins", async (_, { rejectWithValue }) => {
  const userId = getUserId();
  if (!userId) return []; // Return empty if no user

  try {
    const response = await getData(`/purchases/${userId}`);
    if (response.success) {
      const purchases = response.purchases || [];
      return purchases.map(coin => ({
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
        remainingInvestment: coin.totalCost, // Simplified for now, backend might track this
        totalQuantity: coin.quantity
      }));
    } else {
        return [];
    }
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchTransactionHistory = createAsyncThunk("portfolio/fetchTransactionHistory", async (_, { rejectWithValue }) => {
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
});

export const addPurchase = createAsyncThunk("portfolio/addPurchase", async (purchaseData, { rejectWithValue, dispatch }) => {
    const userId = getUserId();
    if (!userId) return rejectWithValue("User not authenticated");

    try {
        const finalPurchaseData = { ...purchaseData, user_id: userId };
        const response = await postForm('/purchases/buy', finalPurchaseData);
        if (response.success) {
            dispatch(refreshBalance()); // Update wallet balance
            dispatch(fetchPurchasedCoins()); // Refresh portfolio
            dispatch(fetchTransactionHistory()); // Refresh history
            return response;
        } else {
            return rejectWithValue(response.error);
        }
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || error.message);
    }
});

export const sellCoins = createAsyncThunk("portfolio/sellCoins", async (sellData, { rejectWithValue, dispatch }) => {
    const userId = getUserId();
    if (!userId) return rejectWithValue("User not authenticated");

    try {
        const finalSellData = { ...sellData, user_id: userId };
        const response = await postForm('/purchases/sell', finalSellData);
        if (response.success) {
            dispatch(refreshBalance()); 
            dispatch(fetchPurchasedCoins());
            dispatch(fetchTransactionHistory());
            return response;
        } else {
            return rejectWithValue(response.error);
        }
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || error.message);
    }
});

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
        state.loading = true;
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
      });
  },
});

export default portfolioSlice.reducer;

