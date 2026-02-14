import { getFirestoreDocs } from "@/backend/firebase/utils"
import { sendWappMessages } from "@/backend/utils/send-wapp-messages"
import type { CarCheckpoints } from "@/globals/firestore/firestore.model"

import type { JobScript } from "@/models"

import { getCheckpointNotificationsRunDates } from "./carsCheckpoints.utils"

import {
  checkpointsConfig,
  checkpointsNotificationsLabels
} from "./carsCheckpoints.const"

const run = async () => {
  const cars = await getFirestoreDocs({
    collection: "cars"
  })

  const phoneNumbersDocs = await getFirestoreDocs({
    collection: "phone-numbers",
    queries: [["notifications", "array-contains", "cars-checkpoints"]]
  })

  const phoneNumbers = phoneNumbersDocs.map(({ value }) => value)

  for (const car of cars) {
    const checkpointConfig = checkpointsConfig[car.council]

    if (!checkpointConfig) {
      console.log(
        `No checkpoints configuration found for car: ${car.id} with council: ${car.council}`
      )
      continue
    }

    for (const [key, config] of Object.entries(checkpointConfig)) {
      if (!(key in car)) {
        continue
      }

      const expiryTimestamp = car[key as keyof typeof checkpointConfig]

      if (!expiryTimestamp) {
        continue
      }

      const expiryDate = new Date(expiryTimestamp)
      expiryDate.setHours(0, 0, 0, 0)

      const notificationsRunDates = getCheckpointNotificationsRunDates({
        expiryDate,
        config
      })

      const currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)

      const hasMatchingTimestamp = notificationsRunDates.find(
        date => date.getTime() === currentDate.getTime()
      )

      if (hasMatchingTimestamp) {
        await sendWappMessages({
          template: {
            type: "cars_checkpoints",
            params: {
              car_reg_number: car.id,
              expiry_date: expiryDate.toDateString(),
              checkpoint:
                checkpointsNotificationsLabels[key as keyof CarCheckpoints]
            }
          },
          phoneNumbers
        })
      }
    }
  }
}

export const carsCheckpointsJob: JobScript = {
  id: "cars-checkpoints",
  run
}
