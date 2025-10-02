import { firestore } from "@/firebase/config"
import { getOnRoadPsvCars } from "@/firebase/utils"

import { sendWappMessage } from "@/utils/send-wapp-message"

import type {
  CheckDoc,
  NotificationConfigDoc,
  UserDoc
} from "@/shared/firestore/firestore.model"

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

  const notifiicationsConfigRef = firestore.collection("notifications-config")
  const notificationsConfigSnapshot = await notifiicationsConfigRef.get()

  if (notificationsConfigSnapshot.empty) {
    throw new Error("Notifications config not found")
  }

  const notificationsConfig = notificationsConfigSnapshot.docs.map(doc => ({
    phoneNumber: doc.id,
    ...(doc.data() as NotificationConfigDoc)
  }))

  const phoneNumbers = notificationsConfig
    .filter(({ checks }) => checks)
    .map(({ phoneNumber }) => phoneNumber)

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
