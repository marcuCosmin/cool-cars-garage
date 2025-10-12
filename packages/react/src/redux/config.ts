import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook
} from "react-redux"
import { configureStore } from "@reduxjs/toolkit"

import { user } from "./userSlice"
import { carsReducer } from "./carsSlice"
import { modal } from "./modalSlice"
import { screen } from "./screenSlice"

export const store = configureStore({
  reducer: { user, carsReducer, modal, screen }
})

type State = ReturnType<typeof store.getState>
type Dispatch = typeof store.dispatch

export const useAppDispatch: () => Dispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<State> = useSelector
