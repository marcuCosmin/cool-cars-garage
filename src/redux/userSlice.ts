import { createSlice } from "@reduxjs/toolkit"

import type { PayloadAction } from "@reduxjs/toolkit"
import type { IdTokenResult, User as FirebaseUser } from "firebase/auth"
import type { UserMetadata } from "../models"

type UserStateMetadata = UserMetadata & {
  loading: boolean
}

type UserState = {
  user: FirebaseUser
  metadata: UserStateMetadata
}

const initialState: UserState = {
  user: {
    uid: "",
    email: "",
    displayName: "",
    emailVerified: false,
    phoneNumber: "",
    isAnonymous: false,
    photoURL: "",
    metadata: {
      creationTime: "",
      lastSignInTime: ""
    },
    providerData: [],
    tenantId: null,
    refreshToken: "",
    providerId: "",
    toJSON: () => ({}),
    //eslint-disable-next-line no-empty-function
    reload: async () => {},
    //eslint-disable-next-line no-empty-function
    delete: async () => {},
    //eslint-disable-next-line require-await
    getIdToken: async () => "",
    //eslint-disable-next-line require-await
    getIdTokenResult: async () => {
      return {} as IdTokenResult
    }
  },
  metadata: {
    loading: true,
    role: "user"
  }
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<FirebaseUser>>) => ({
      ...state,
      user: { ...state.user, ...action.payload }
    }),
    setUserMetadata: (
      state,
      action: PayloadAction<Partial<UserStateMetadata>>
    ) => ({
      ...state,
      metadata: {
        ...state.metadata,
        ...action.payload
      }
    }),
    clearUser: () => initialState
  }
})

export const { setUser, setUserMetadata, clearUser } = userSlice.actions
export const { reducer: userReducer } = userSlice
