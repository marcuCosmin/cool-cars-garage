import { useEffect } from "react"
import { DataView } from "../components/core/DataView/DataView"

import { useReduxDispatch, useReduxSelector } from "../redux/config"
import { openModal } from "../redux/modalSlice"
import { deleteCar, fetchAllCars, setEditedCarId } from "../redux/carsSlice"
import { type FiltersConfig } from "../components/core/DataView/model"
import { test } from "@/shared/consts"

const filtersConfig: FiltersConfig = {
  "Council": {
    field: "council",
    type: "select",
    options: ["Wolverhampton", "Cornwall", "PSV", "Portsmouth", "Other"]
  },
  "MOT expires soon": {
    type: "toggle",
    filterFn: item => {
      const expiryDate = new Date(item.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
      )
      return daysUntilExpiry <= 30
    }
  },
  "Road Tax expires soon": {
    type: "toggle",
    filterFn: item => {
      const expiryDate = new Date(item.roadTaxExpiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
      )
      return daysUntilExpiry <= 30
    }
  }
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
