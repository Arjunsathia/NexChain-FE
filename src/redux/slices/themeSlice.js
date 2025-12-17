import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return document.documentElement.classList.contains("dark");
  }
  return true; // Default to dark
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    isDark: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      if (state.isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
      if (state.isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
