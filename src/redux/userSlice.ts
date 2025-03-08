import { createSlice } from "@reduxjs/toolkit"

import type { PayloadAction } from "@reduxjs/toolkit"

import type { User } from "../models"

const initialState: User = {
  uid: "",
  email: "",
  displayName: "",
  emailVerified: false,
  phoneNumber: "",
  role: "user"
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<User>) => action.payload,
    clearUser: () => initialState
  }
})

export const { setUser, clearUser } = userSlice.actions
export const { reducer: userReducer } = userSlice
