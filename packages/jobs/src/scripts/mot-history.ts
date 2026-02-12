import {
  getFirestoreDocs,
  getNotificationPhoneNumbers
} from "@/backend/firebase/utils"
import { firestore } from "@/backend/firebase/config"
import { sendWappMessages } from "@/backend/utils/send-wapp-messages"
import { getCarMotHistory } from "@/backend/utils/get-car-mot-history"
import { getMOTHistoryApiAccessToken } from "@/backend/utils/get-mot-history-api-access-token"

import type { CarDoc } from "@/globals/firestore/firestore.model"

import type { JobScript } from "@/models"

const run = async () => {
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
      console.log(
        `Fetching car history for car with registration number: ${car.id}`
      )
      const carMotHistory = await getCarMotHistory({
        carId: car.id,
        accessToken
      })

      if (!carMotHistory) {
        continue
      }

      console.log(
        `MOT history fetched for car with registration number: ${car.id}`
      )

      const { outstandingRecallStatus, motExpiryTimestamp, motStatus } =
        carMotHistory

      if (outstandingRecallStatus === "Unavailable") {
        failedCarsIds.push(car.id)
        continue
      }

      const hasOutstandingRecall = outstandingRecallStatus === "Yes"

      if (hasOutstandingRecall) {
        recalledCarsIds.push(car.id)
      }

      const carRef = firestore.collection("cars").doc(car.id)

      const uploadPayload: Pick<
        CarDoc,
        "motExpiryTimestamp" | "hasOutstandingRecall" | "motStatus"
      > = {
        motExpiryTimestamp,
        hasOutstandingRecall
      }

      if (motStatus) {
        uploadPayload.motStatus = motStatus
      }

      batch.update(carRef, uploadPayload)
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
  } catch (error) {
    console.error("Error running MOT history job:", error)
  }
}

export const motHistoryJob: JobScript = {
  id: "mot-history",
  run
}
