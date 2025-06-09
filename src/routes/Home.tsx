import { useEffect } from "react"

import { CarForm } from "../components/core/CarForm"
import { DataView } from "../components/core/DataView/DataView"

import { useReduxDispatch, useReduxSelector } from "../redux/config"
import { setModalContent } from "../redux/modalSlice"
import { deleteCar, fetchAllCars, setEditedCarId } from "../redux/carsSlice"
import { type FiltersConfig } from "../components/core/DataView/model"

const filtersConfig: FiltersConfig = {
  Wolverhampton: ({ council }) => council === "Wolverhampton",
  Cornwall: ({ council }) => council === "Cornwall",
  PSV: ({ council }) => council === "PSV",
  Portsmouth: ({ council }) => council === "Portsmouth",
  Other: ({ council }) => council === "Other"
}

export const Home = () => {
  const { cars, metadata } = useReduxSelector(state => state.carsReducer)
  const dispatch = useReduxDispatch()

  const initialData = Object.entries(cars).reduce(
    (acc, [id, { makeAndModel, ...car }]) => ({
      ...acc,
      [id]: {
        ...car,
        id,
        title: makeAndModel,
        subtitle: id
      }
    }),
    {}
  )

  useEffect(() => {
    dispatch(fetchAllCars())
  }, [])

  if (metadata.loading) {
    return <div>Loading cars data</div>
  }

  const onAddButtonClick = () => dispatch(setModalContent(<CarForm />))
  const onItemEdit = (id: string) => {
    dispatch(setEditedCarId(id))
    onAddButtonClick()
  }

  const onItemDelete = async (id: string) => {
    const response = await dispatch(deleteCar(id))

    if (response.meta.requestStatus === "rejected") {
      return response.payload as string
    }
  }

  return (
    <DataView
      filtersConfig={filtersConfig}
      initialData={initialData}
      onAddButtonClick={onAddButtonClick}
      onItemEdit={onItemEdit}
      onItemDelete={onItemDelete}
    />
  )
}
