import { getOnRoadPsvCars } from "@/firebase/utils"

import { sendWappMessage } from "@/utils/send-wapp-message"

import type { UserDoc } from "@/shared/firestore/firestore.model"

import {
  getCarsDriverData,
  getChecksInTimestampRange,
  getReceiversPhoneNumbers
} from "./utils"

type Notification = {
  car_reg_number: string
  driver_name: string
}

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

  const notificationsToSend: Notification[] = psvCars.reduce((acc, car) => {
    if (!checksData[car.id]) {
      acc.push({
        car_reg_number: car.id,
        driver_name: car.driver
          ? `${car.driver.firstName} ${car.driver.lastName}`
          : "Unknown"
      })
    }

    return acc
  }, [] as Notification[])

  if (!notificationsToSend.length) {
    console.log("No missing checks notifications to send")
    return
  }

  const phoneNumbers = await getReceiversPhoneNumbers()

  for (const notification of notificationsToSend) {
    for (const phoneNumber of phoneNumbers) {
      await sendWappMessage({
        to: phoneNumber,
        template: {
          type: "missing_check",
          params: {
            driver_name: notification.driver_name,
            car_reg_number: notification.car_reg_number
          }
        }
      })
    }
  }
}

sendMissingChecksNotifications()
