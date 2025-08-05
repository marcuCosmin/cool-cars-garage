import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import type { ModalOptions } from "../components/core/Modal/Modal.model"

type ModalState =
  | ModalOptions
  | {
      type: "none"
      props: undefined
    }

const initialState = {
  type: "none",
  props: undefined
} as ModalState

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalOptions>) => {
      state = action.payload

      return state
    },
    closeModal: state => {
      state = initialState

      return state
    }
  }
})

export const { openModal, closeModal } = modalSlice.actions
export const { reducer: modal } = modalSlice
