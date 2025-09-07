import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { getUserMetadata } from "@/firebase/utils"
import type { User as FirebaseUser } from "firebase/auth"

import type { User } from "@/shared/firestore/firestore.model"

type UserState = Pick<
  User,
  "uid" | "email" | "firstName" | "lastName" | "role"
> & {
  isLoading: boolean
  error?: string
}

const initialState: UserState = {
  uid: "",
  email: "",
  firstName: "",
  lastName: "",
  role: "driver",
  isLoading: true,
  error: ""
}

const handleUserInit = async (user: FirebaseUser | null) => {
  if (!user) {
    return
  }

  const { uid, email } = user
  const { role, firstName, lastName } = await getUserMetadata(uid)

  return {
    uid,
    email: email as string,
    role,
    firstName,
    lastName
  }
}

export const initUserData = createAsyncThunk(
  "user/fetch-metadata",
  handleUserInit
)

const userSlice = createSlice({
  name: "user",
  initialState: { ...initialState },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(initUserData.pending, state => {
      state.isLoading = true
    })
    builder.addCase(initUserData.fulfilled, (state, action) => {
      const { payload } = action

      if (!payload) {
        Object.assign(state, { ...initialState, isLoading: false })
        return
      }

      Object.assign(state, { ...payload, isLoading: false, error: "" })
    })
    builder.addCase(initUserData.rejected, (state, action) => {
      state.error = action.error.message

      state.isLoading = false
    })
  }
})

export const { reducer: user } = userSlice
