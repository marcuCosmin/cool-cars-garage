import { useEffect } from "react"
import { DataView } from "../components/core/DataView/DataView"

import { Timestamp } from "firebase-admin/firestore"

import { useReduxDispatch, useReduxSelector } from "../redux/config"
import { openModal } from "../redux/modalSlice"
import { deleteCar, fetchAllCars, setEditedCarId } from "../redux/carsSlice"
import { type FiltersConfig } from "../components/core/DataView/model"

import { getCheckpointNotificationsDates } from "@/shared/utils"
import type { Car, CarCheckField } from "@/shared/models"

const getCheckpointFilter =
  (checkedField: CarCheckField) =>
  ({ council, ...car }: DataItem) => {
    const checkpoint = car[checkedField] as Timestamp | undefined

    if (!checkpoint) {
      return false
    }

    const expiryDate = checkpoint.toDate()

    const { notificationsStartDate } = getCheckpointNotificationsDates({
      council,
      checkedField,
      expiryDate
    })

    const today = new Date()
    const hasNotificationsActive = today >= notificationsStartDate

    return hasNotificationsActive
  }

const filtersConfig: FiltersConfig<DataItem> = {
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

type DataItem = Omit<Car, "makeAndModel" | "registrationNumber"> & {
  id: string
  title: string
  subtitle: string
}

export const Home = () => {
  const { cars, metadata } = useReduxSelector(state => state.carsReducer)
  const dispatch = useReduxDispatch()

  const initialData: Record<string, DataItem> = Object.entries(cars).reduce(
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
    <DataView<DataItem>
      filtersConfig={filtersConfig}
      initialData={initialData}
      onAddButtonClick={onAddButtonClick}
      onItemEdit={onItemEdit}
      onItemDelete={onItemDelete}
    />
  )
}
