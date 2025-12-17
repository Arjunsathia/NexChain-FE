import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getById } from "@/api/axiosConfig";
import { jwtDecode } from "jwt-decode";

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("NEXCHAIN_USER");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return {};
      }
    }
  }
  return {};
};

// Async thunk to fetch user
export const fetchUser = createAsyncThunk("user/fetchUser", async (_, { rejectWithValue }) => {
  const storedToken = localStorage.getItem("NEXCHAIN_USER_TOKEN");
  if (!storedToken) return rejectWithValue("No token found");

  try {
    const decoded = jwtDecode(storedToken);
    const uId = decoded?.id;
    if (uId) {
      const data = await getById("/users", uId);
      if (data) {
        localStorage.setItem("NEXCHAIN_USER", JSON.stringify(data));
        return data;
      }
    }
    return rejectWithValue("Failed to fetch user");
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: getInitialUser(),
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
        state.user = action.payload;
        localStorage.setItem("NEXCHAIN_USER", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = {};
      state.loading = false;
      state.error = null;
      localStorage.removeItem("NEXCHAIN_USER");
      localStorage.removeItem("NEXCHAIN_USER_TOKEN");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser } = userSlice.actions;
export default userSlice.reducer;
