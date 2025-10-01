import { firestore } from "@/firebase/config"
import { getOnRoadPsvCars } from "@/firebase/utils"

import { sendWappMessage } from "@/utils/send-wapp-message"

import type { CheckDoc, UserDoc } from "@/shared/firestore/firestore.model"

import { getCarsDriverData, getTimestampRanges } from "./utils"

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

  const { startTimestamp, endTimestamp } = getTimestampRanges()

  const checksRef = firestore.collection("checks")
  const checksSnapshot = await checksRef
    .where("creationTimestamp", ">=", startTimestamp)
    .where("creationTimestamp", "<=", endTimestamp)
    .get()

  const checksData = checksSnapshot.docs.reduce(
    (acc, doc) => {
      const { carId, ...data } = doc.data() as CheckDoc
      acc[carId] = data
      return acc
    },
    {} as Record<string, Omit<CheckDoc, "carId">>
  )

  const notificationsToSend: Notification[] = []

  psvCars.forEach(({ id, driver }) => {
    if (!checksData[id]) {
      notificationsToSend.push({
        car_reg_number: id,
        driver_name: driver
          ? `${driver.firstName} ${driver.lastName}`
          : "Unknown"
      })
    }
  })

  if (!notificationsToSend.length) {
    console.log("No missing checks notifications to send")
    return
  }

  for (const notification of notificationsToSend) {
    await sendWappMessage({
      to: "+40743100368",
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

sendMissingChecksNotifications()
