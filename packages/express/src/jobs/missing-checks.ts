import {
  getCarsDriverData,
  getChecksFromToday,
  getNotificationPhoneNumbers,
  getOnRoadPsvCars
} from "@/firebase/utils"

import {
  sendWappMessages,
  type MissingCheckTemplate
} from "@/utils/send-wapp-messages"

import type { UserDoc } from "@/shared/firestore/firestore.model"

type MissingCheckTemplateParams = MissingCheckTemplate["params"]

const sendMissingChecksNotifications = async () => {
  const psvCarsData = await getOnRoadPsvCars()
  const driversData = await getCarsDriverData(psvCarsData)

  const psvCars = psvCarsData.map(({ driverId, ...car }) => {
    const driver = driversData.find(driver => driver.id === driverId) as UserDoc

    return {
      ...car,
      driver
    }
  })

  const checksData = await getChecksFromToday()

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
