import { useEffect } from "react"

import { useReduxDispatch, useReduxSelector } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"
import { deleteCar, fetchAllCars, setEditedCarId } from "@/redux/carsSlice"

import type { FiltersConfig } from "@/components/core/DataView/model"
import { DataView } from "@/components/core/DataView/DataView"

import { Loader } from "@/components/basic/Loader"

import { getCheckpointFilter } from "./CarsList.utils"

import type { CarItemData } from "./CarsList.model"

const filtersConfig: FiltersConfig<CarItemData> = {
  "Council": {
    field: "council",
    type: "select",
    options: ["Wolverhampton", "Cornwall", "PSV", "Portsmouth", "Other"]
  },
  "MOT expires soon": {
    type: "toggle",
    filterFn: getCheckpointFilter("mot")
  },
  "Road Tax expires soon": {
    type: "toggle",
    filterFn: getCheckpointFilter("roadTax")
  }
}

export const CarsList = () => {
  const { cars, metadata } = useReduxSelector(state => state.carsReducer)
  const dispatch = useReduxDispatch()

  const initialData: Record<string, CarItemData> = Object.entries(cars).reduce(
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

  const onAddButtonClick = () => dispatch(openModal({ type: "car" }))
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

  if (metadata.loading) {
    return <Loader enableOverlay text="Loading cars data" />
  }

  return (
    <DataView<CarItemData>
      filtersConfig={filtersConfig}
      initialData={initialData}
      onAddButtonClick={onAddButtonClick}
      onItemEdit={onItemEdit}
      onItemDelete={onItemDelete}
    />
  )
}
