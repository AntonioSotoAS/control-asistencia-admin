import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, UserProfile } from "../types/auth.types";

const initialToken = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
const savedUser = typeof window !== "undefined" ? sessionStorage.getItem("usuario") : null;

const initialState: AuthState = {
  token: initialToken,
  user: savedUser ? (JSON.parse(savedUser) as UserProfile) : null,
  isAuthenticated: Boolean(initialToken),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user ?? null;
      state.isAuthenticated = true;
      sessionStorage.setItem("token", action.payload.token);
      if (action.payload.user) {
        sessionStorage.setItem("usuario", JSON.stringify(action.payload.user));
      }
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      sessionStorage.setItem("usuario", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
