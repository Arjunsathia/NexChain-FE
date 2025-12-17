import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData, postForm } from "@/api/axiosConfig";
import { jwtDecode } from "jwt-decode"; // Helper to get userId if needed

// Helper to get userId directly if not passed (though passing it is cleaner)
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

export const refreshBalance = createAsyncThunk("wallet/refreshBalance", async (_, { rejectWithValue }) => {
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
});

export const resetBalance = createAsyncThunk("wallet/resetBalance", async (_, { rejectWithValue }) => {
  const userId = getUserId();
  if (!userId) return rejectWithValue("No user ID");

  try {
    const res = await postForm('/purchases/reset-balance', { user_id: userId });
    if (res.success) {
      return res.newBalance;
    } else {
      return rejectWithValue(res.error);
    }
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

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
        // Refresh Balance
      .addCase(refreshBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(refreshBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Balance
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
      });
  },
});

export const { setBalance } = walletSlice.actions;
export default walletSlice.reducer;
