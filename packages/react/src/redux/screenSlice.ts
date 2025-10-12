import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type ScreenState = {
  width: number
}

const initialState = {
  width: window.innerWidth
} as ScreenState

const screenSlice = createSlice({
  name: "screen",
  initialState,
  reducers: {
    setScreenWidth: (state, action: PayloadAction<number>) => {
      state.width = action.payload

      return state
    }
  }
})

export const { setScreenWidth } = screenSlice.actions
export const { reducer: screen } = screenSlice
