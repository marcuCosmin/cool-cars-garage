import {
  createAsyncThunk,
  createSlice,
  type PayloadAction
} from "@reduxjs/toolkit"

import { getUserMetadata } from "@/firebase/utils"

import type { User } from "@/shared/firestore/firestore.model"

type UserState = User & {
  isLoading: boolean
  error?: string
}

const initialState: UserState = {
  uid: "",
  email: "",
  displayName: "",
  metadata: {
    role: "admin"
  },
  isLoading: true,
  error: ""
}

export const fetchUserMetadata = createAsyncThunk(
  "user/fetch-metadata",
  getUserMetadata
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initUserData: (
      state,
      action: PayloadAction<Pick<User, "uid" | "email" | "displayName">>
    ) => {
      const { uid, email, displayName } = action.payload

      state.uid = uid
      state.email = email
      state.displayName = displayName
    },
    clearUser: () => ({
      ...initialState,
      isLoading: false
    })
  },
  extraReducers: builder => {
    builder.addCase(fetchUserMetadata.pending, state => {
      state.isLoading = true
    })
    builder.addCase(fetchUserMetadata.fulfilled, (state, action) => {
      state.metadata = action.payload
      state.isLoading = false
    })
    builder.addCase(fetchUserMetadata.rejected, (state, action) => {
      state.error = action.error.message

      state.isLoading = false
    })
  }
})

export const { initUserData, clearUser } = userSlice.actions
export const { reducer: user } = userSlice
