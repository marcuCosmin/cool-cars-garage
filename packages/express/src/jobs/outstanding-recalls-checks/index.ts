import {
  getFirestoreDocs,
  getNotificationPhoneNumbers
} from "@/backend/firebase/utils"
import { firestore } from "@/backend/firebase/config"

import { sendWappMessages } from "@/utils/send-wapp-messages"

import {
  getCarOutstandingRecallStatus,
  getMOTHistoryApiAccessToken
} from "./utils"

const handleOutstandingRecallsJob = async () => {
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

  const phoneNumbers = await getNotificationPhoneNumbers("outstanding-recalls")

  if (!phoneNumbers.length) {
    console.log("No phone numbers found for outstanding recalls notifications")
    return
  }

  if (!recalledCarsIds.length && !failedCarsIds.length) {
    console.log("No outstanding recalls notifications to send")
    return
  }

  if (failedCarsIds.length) {
    await sendWappMessages({
      phoneNumbers,
      template: {
        type: "outstanding_recalls_failed",
        params: {
          cars_reg_numbers: failedCarsIds.join(", ")
        }
      }
    })
  }

  console.log(
    `Sending ${recalledCarsIds.length} outstanding recalls notifications for cars `,
    recalledCarsIds
  )

  for (const carId of recalledCarsIds) {
    await sendWappMessages({
      phoneNumbers,
      template: {
        type: "outstanding_recall_found",
        params: {
          car_reg_number: carId
        }
      }
    })
  }
}

handleOutstandingRecallsJob()
