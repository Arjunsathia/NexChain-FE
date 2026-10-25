import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getById, refreshSession, logout as logoutRequest } from "@/api/axiosConfig";

// Older builds kept the token and full user (including the password hash) in
// localStorage; remove them so they don't linger on shared machines.
const clearLegacyStorage = () => {
  try {
    localStorage.removeItem("NEXCHAIN_USER_TOKEN");
    localStorage.removeItem("NEXCHAIN_USER");
  } catch {
    // storage unavailable
  }
};
clearLegacyStorage();

// Per-user caches written by the watchlist and portfolio pages
const clearUserCaches = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("user_watchlist_cache_") || key.startsWith("portfolio_holdings_v1_"))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // storage unavailable
  }
};

/** On app load: trade the httpOnly refresh cookie for a session */
export const restoreSession = createAsyncThunk(
  "user/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      return await refreshSession();
    } catch {
      return rejectWithValue("No active session");
    }
  },
);

/** Reloads the logged-in user's profile */
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, { getState, rejectWithValue }) => {
    const userId = getState().user.user?.id;
    if (!userId) return rejectWithValue("Not logged in");

    try {
      return await getById("/users", userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/** Ends the session on the server too (revokes the refresh cookie) */
export const logoutUser = createAsyncThunk("user/logoutUser", async (_, { dispatch }) => {
  try {
    await logoutRequest();
  } catch {
    // Signing out locally still matters if the request fails
  }
  clearUserCaches();
  dispatch(userSlice.actions.logout());
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {},
    accessToken: null,
    // idle → loading → authenticated | unauthenticated
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    /** After login: callers also pass the token to setMemoryToken */
    setSession: (state, action) => {
      state.user = action.payload.user || {};
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
    },
    // Merge so partial profile responses keep the rest of the session user
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      if (action.payload) state.status = "authenticated";
    },
    // The in-memory token is cleared by logoutRequest / the axios interceptor
    logout: (state) => {
      state.user = {};
      state.accessToken = null;
      state.status = "unauthenticated";
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user || {};
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = {};
        state.accessToken = null;
        state.status = "unauthenticated";
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, setAccessToken, setSession } = userSlice.actions;
export default userSlice.reducer;
