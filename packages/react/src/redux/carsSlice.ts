import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

import { deleteFirestoreDoc, getFirestoreDocs } from "../firebase/utils"

import type { Car } from "@/globals/models"

type CarState = Record<string, Omit<Car, "registrationNumber">>

type CarsState = {
  cars: CarState
  metadata: {
    loading: boolean
    editedCarId: string | null
  }
}

const initialState: CarsState = {
  cars: {},
  metadata: {
    loading: true,
    editedCarId: null
  }
}

export const fetchAllCars = createAsyncThunk("cars/fetchAll", async () => {
  const carsArray = await getFirestoreDocs<Car>({ collectionId: "cars" })

  const cars = {} as CarState

  if (carsArray?.length) {
    carsArray.forEach(({ id, ...car }) => {
      cars[id] = car
    })
  }

  return cars
})

export const deleteCar = createAsyncThunk("cars/deleteCar", (id: string) =>
  deleteFirestoreDoc({ collection: "cars", document: id })
)

type UpdateCarDueDatePayload = {
  carId: string
  dateKey: string
  dateValue: number
}
export const updateCarDueDate = createAsyncThunk(
  "cars/updateCarDueDate",
  ({}: UpdateCarDueDatePayload) => {}
)

const carsSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {
    setEditedCarId: (state, action: PayloadAction<string>) => {
      state.metadata = {
        ...state.metadata,
        editedCarId: action.payload
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchAllCars.fulfilled, (state, action) => {
      state.cars = action.payload
      state.metadata = {
        ...state.metadata,
        ...action.payload,
        loading: false
      }
    })
    builder.addCase(fetchAllCars.pending, state => {
      state.metadata = {
        ...state.metadata,
        loading: true
      }
    })
    builder.addCase(deleteCar.fulfilled, (state, action) => {
      const id = action.meta.arg

      delete state.cars[id]
    })
  }
})

export const { setEditedCarId } = carsSlice.actions
export const { reducer: carsReducer } = carsSlice
