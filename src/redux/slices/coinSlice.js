import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCoins } from "@/api/coinApis";

export const fetchCoins = createAsyncThunk("coins/fetchCoins", async (_, { rejectWithValue }) => {
  try {
    // Fetch ALL coins including frozen ones.
    // The filtering will happen in selectors/hooks for user views.
    const data = await getCoins({ includeFrozen: true });
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const coinSlice = createSlice({
  name: "coins",
  initialState: {
    coins: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchCoins.pending, (state) => {
            if(state.coins.length === 0) state.loading = true;
        })
        .addCase(fetchCoins.fulfilled, (state, action) => {
            state.loading = false;
            state.coins = action.payload;
            state.lastUpdated = Date.now();
        })
        .addCase(fetchCoins.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
  }
});

export default coinSlice.reducer;
