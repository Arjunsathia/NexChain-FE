import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData, postForm } from "@/api/axiosConfig";
import { jwtDecode } from "jwt-decode";

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

export const refreshBalance = createAsyncThunk(
  "wallet/refreshBalance",
  async (_, { rejectWithValue }) => {
    const userId = getUserId();
    if (!userId) return rejectWithValue("No user ID");

    try {
      const response = await getData(`/purchases/balance/${userId}`);
      if (response.success) {
        return response.virtualBalance;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const resetBalance = createAsyncThunk(
  "wallet/resetBalance",
  async (_, { rejectWithValue }) => {
    const userId = getUserId();
    if (!userId) return rejectWithValue("No user ID");

    try {
      const res = await postForm("/purchases/reset-balance", {
        user_id: userId,
      });
      if (res.success) {
        return res.newBalance;
      } else {
        return rejectWithValue(res.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    balance: 10000,
    loading: false,
    error: null,
  },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(refreshBalance.pending, () => {
        // Only show loading if we really don't have a balance yet (optional, or just remove loading for refreshes)
        // state.loading = true; 
      })
      .addCase(refreshBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(refreshBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(resetBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle immediate balance updates from portfolio actions
      .addCase('portfolio/addPurchase/fulfilled', (state, action) => {
        if (action.payload.newBalance !== undefined) {
          state.balance = action.payload.newBalance;
        }
      })
      .addCase('portfolio/sellCoins/fulfilled', (state, action) => {
        if (action.payload.newBalance !== undefined) {
          state.balance = action.payload.newBalance;
        }
      });
  },
});

export const { setBalance } = walletSlice.actions;
export default walletSlice.reducer;
