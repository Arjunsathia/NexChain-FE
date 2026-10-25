import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userReducer from "@/redux/slices/userSlice";
import ProtectedRoute from "@/Routes/ProtectedRoute";
import AdminRoute from "@/Routes/AdminRoute";

const renderAt = (path, userState) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: { user: {}, accessToken: null, loading: false, error: null, ...userState } },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/auth" element={<p>login page</p>} />
          <Route path="/dashboard" element={<p>dashboard</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/portfolio" element={<p>portfolio</p>} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<p>admin panel</p>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("route guards", () => {
  it("waits for the session check before deciding", () => {
    renderAt("/portfolio", { status: "loading" });
    expect(screen.queryByText("portfolio")).toBeNull();
    expect(screen.queryByText("login page")).toBeNull();
  });

  it("sends signed-out visitors to /auth", () => {
    renderAt("/portfolio", { status: "unauthenticated" });
    expect(screen.getByText("login page")).toBeTruthy();
  });

  it("lets signed-in users through", () => {
    renderAt("/portfolio", { status: "authenticated", user: { id: "u1", role: "user" } });
    expect(screen.getByText("portfolio")).toBeTruthy();
  });

  it("keeps non-admins out of /admin", () => {
    renderAt("/admin", { status: "authenticated", user: { id: "u1", role: "user" } });
    expect(screen.getByText("dashboard")).toBeTruthy();
  });

  it("lets admins into /admin", () => {
    renderAt("/admin", { status: "authenticated", user: { id: "a1", role: "admin" } });
    expect(screen.getByText("admin panel")).toBeTruthy();
  });
});
