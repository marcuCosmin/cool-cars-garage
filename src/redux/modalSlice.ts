import { type ReactNode } from "react"

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type ModalState = {
  content: ReactNode
}

const initialState: ModalState = {
  content: null
}

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModalContent: (state, action: PayloadAction<ReactNode>) => {
      state.content = action.payload
    },
    closeModal: state => {
      state.content = null
    }
  }
})

export const { setModalContent, closeModal } = modalSlice.actions
export const { reducer: modalReducer } = modalSlice
