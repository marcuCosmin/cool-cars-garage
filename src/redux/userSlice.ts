import {
  createAsyncThunk,
  createSlice,
  type PayloadAction
} from "@reduxjs/toolkit"

import { getFirestoreDoc } from "../firebase/utils"
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

export const fetchUserMetadata = createAsyncThunk(
  "user/fetchMetadata",
  async (uid: string) => {
    const userMetadata = await getFirestoreDoc<UserMetadata>({
      collection: "users",
      document: uid
    })

    return userMetadata || { role: "user" as UserMetadata["role"] }
  }
)

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseUser>) => ({
      ...state,
      user: action.payload
    }),
    updateUser: (
      state,
      action: PayloadAction<
        Partial<Pick<FirebaseUser, "email" | "displayName" | "phoneNumber">>
      >
    ) => ({
      ...state,
      user: {
        ...state.user,
        ...action.payload
      }
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
    clearUser: () => ({
      ...initialState,
      metadata: { ...initialState.metadata, loading: false }
    })
  },
  extraReducers: builder => {
    builder.addCase(fetchUserMetadata.fulfilled, (state, action) => {
      state.metadata = {
        loading: false,
        ...action.payload
      }
    })
    builder.addCase(fetchUserMetadata.pending, state => {
      state.metadata = {
        ...state.metadata,
        loading: true
      }
    })
  }
})

export const { setUser, setUserMetadata, clearUser, updateUser } =
  userSlice.actions
export const { reducer: userReducer } = userSlice
