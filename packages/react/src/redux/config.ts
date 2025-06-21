import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook
} from "react-redux"
import { configureStore } from "@reduxjs/toolkit"

import { userReducer } from "./userSlice"
import { carsReducer } from "./carsSlice"
import { modalReducer } from "./modalSlice"

export const store = configureStore({
  reducer: { userReducer, carsReducer, modalReducer }
})

type State = ReturnType<typeof store.getState>
type Dispatch = typeof store.dispatch

export const useReduxDispatch: () => Dispatch = useDispatch
export const useReduxSelector: TypedUseSelectorHook<State> = useSelector
