import { getFirestoreDocs, getNotificationPhoneNumbers } from "@/firebase/utils"
import { firestore } from "@/firebase/config"

import { sendWappMessages } from "@/utils/send-wapp-messages"

import {
  getCarOutstandingRecallStatus,
  getMOTHistoryApiAccessToken
} from "./utils"

const handleOutstandingRecallsJob = async () => {
  try {
    const cars = await getFirestoreDocs({ collection: "cars" })

    if (!cars.length) {
      console.log("No cars found in the database.")
      return
    }

    const accessToken = await getMOTHistoryApiAccessToken()

    const recalledCarsIds: string[] = []
    const failedCarsIds: string[] = []

    const batch = firestore.batch()

    for (const car of cars) {
      const outstandingRecallStatus = await getCarOutstandingRecallStatus({
        carId: car.id,
        accessToken
      })

      if (outstandingRecallStatus === "Unavailable") {
        failedCarsIds.push(car.id)
        continue
      }

      const hasOutstandingRecall = outstandingRecallStatus === "Yes"

      if (hasOutstandingRecall) {
        recalledCarsIds.push(car.id)
      }

      if (car.hasOutstandingRecall !== hasOutstandingRecall) {
        const carRef = firestore.collection("cars").doc(car.id)
        batch.update(carRef, { hasOutstandingRecall })
      }
    }

    await batch.commit()

    const phoneNumbers = await getNotificationPhoneNumbers(
      "outstanding-recalls"
    )

    if (!phoneNumbers.length) {
      console.log(
        "No phone numbers found for outstanding recalls notifications"
      )
      return
    }

    const failedCarsIdsPromises = failedCarsIds.map(carId =>
      sendWappMessages({
        phoneNumbers,
        template: {
          type: "outstanding_recall_failed",
          params: {
            car_reg_number: carId
          }
        }
      })
    )
    const recalledCarsIdsPromises = recalledCarsIds.map(carId =>
      sendWappMessages({
        phoneNumbers,
        template: {
          type: "outstanding_recall_found",
          params: {
            car_reg_number: carId
          }
        }
      })
    )

    const messagesPromises = [
      ...failedCarsIdsPromises,
      ...recalledCarsIdsPromises
    ]

    if (!messagesPromises.length) {
      console.log("No outstanding recalls notifications to send")
      return
    }

    await Promise.all(messagesPromises)
  } catch (error) {
    console.error("Error handling outstanding recalls job:", error)
  }
}

handleOutstandingRecallsJob()
