import {
  getChecksNotificationsPhoneNumbers,
  getOnRoadPsvCars
} from "@/firebase/utils"

import {
  sendWappMessages,
  type MissingCheckTemplate
} from "@/utils/send-wapp-message"

import type { UserDoc } from "@/shared/firestore/firestore.model"

import { getCarsDriverData, getChecksInTimestampRange } from "./utils"

type MissingCheckTemplateParams = MissingCheckTemplate["params"]

export const sendMissingChecksNotifications = async () => {
  const psvCarsData = await getOnRoadPsvCars()
  const driversData = await getCarsDriverData(psvCarsData)

  const psvCars = psvCarsData.map(({ driverId, ...car }) => {
    const driver = driversData.find(driver => driver.id === driverId) as UserDoc

    return {
      ...car,
      driver
    }
  })

  const checksData = await getChecksInTimestampRange()

  const templateParams: MissingCheckTemplateParams[] = psvCars.reduce(
    (acc, car) => {
      if (!checksData[car.id]) {
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

  const phoneNumbers = await getChecksNotificationsPhoneNumbers()

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
