import { getFirestoreDocs, getNotificationPhoneNumbers } from "@/firebase/utils"

import {
  sendWappMessages,
  type MissingCheckTemplate
} from "@/utils/send-wapp-messages"

import { getTimestampDayTimeRange } from "@/shared/utils/getDateTimeRange"

import {
  type CarDoc,
  type CheckDoc,
  type UserDoc
} from "@/shared/firestore/firestore.model"

type MissingCheckTemplateParams = MissingCheckTemplate["params"]

const sendMissingChecksNotifications = async () => {
  const psvCarsData = await getFirestoreDocs<CarDoc>({
    collection: "cars",
    queries: [
      ["council", "==", "PSV"],
      ["isOffRoad", "==", false]
    ]
  })

  const psvCarsdriversIds = new Set(
    psvCarsData.map(car => car.driverId).filter(Boolean)
  )

  const driversData = await getFirestoreDocs<UserDoc>({
    collection: "users",
    ids: Array.from(psvCarsdriversIds)
  })

  const psvCars = psvCarsData.map(({ driverId, ...car }) => {
    const driver = driversData.find(driver => driver.id === driverId) as UserDoc

    return {
      ...car,
      driver
    }
  })

  const { startTimestamp, endTimestamp } = getTimestampDayTimeRange()

  const checksData = await getFirestoreDocs<CheckDoc>({
    collection: "checks",
    queries: [
      ["creationTimestamp", ">=", startTimestamp],
      ["creationTimestamp", "<=", endTimestamp]
    ]
  })

  const templateParams: MissingCheckTemplateParams[] = psvCars.reduce(
    (acc, car) => {
      const matchingCheck = checksData.find(({ carId }) => carId === car.id)

      if (!matchingCheck) {
        acc.push({
          car_reg_number: car.id,
          driver_name: car.driver
            ? `${car.driver.firstName} ${car.driver.lastName}`
            : "Unknown"
        })
      }

      return acc
    },
    [] as MissingCheckTemplateParams[]
  )

  if (!templateParams.length) {
    console.log("No missing checks notifications to send")
    return
  }

  const phoneNumbers = await getNotificationPhoneNumbers("missing-checks")

  if (!phoneNumbers.length) {
    console.log("No phone numbers found for missing checks notifications")
    return
  }

  const messagesPromises = templateParams.map(params =>
    sendWappMessages({
      phoneNumbers,
      template: {
        type: "missing_check",
        params
      }
    })
  )

  await Promise.all(messagesPromises)
}

sendMissingChecksNotifications()
