import { createSlice } from "@reduxjs/toolkit"

import type { PayloadAction } from "@reduxjs/toolkit"

import type { User } from "../models"

type UserState = User & {
  loading: boolean
}

const initialState: UserState = {
  uid: "",
  email: "",
  displayName: "",
  emailVerified: false,
  phoneNumber: "",
  role: "user",
  loading: false
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => ({
      ...state,
      ...action.payload
    }),
    setUserLoading: (state, action: PayloadAction<boolean>) => ({
      ...state,
      loading: action.payload
    }),
    clearUser: () => initialState
  }
})

export const { setUser, setUserLoading, clearUser } = userSlice.actions
export const { reducer: userReducer } = userSlice
