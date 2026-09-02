import {
  getFirestoreDocs,
  getNotificationPhoneNumbers
} from "@/backend/firebase/utils"
import { sendWappMessages } from "@/backend/utils/send-wapp-messages"

import type { JobScript } from "@/models"

const run = async () => {
  const [faults, incidents] = await Promise.all([
    getFirestoreDocs({
      collection: "faults",
      queries: [["status", "==", "pending"]]
    }),
    getFirestoreDocs({
      collection: "incidents",
      queries: [["status", "==", "pending"]]
    })
  ])

  if (!faults.length && !incidents.length) {
    console.log("No unresolved defects to send summary for")
    return
  }

  const phoneNumbers = await getNotificationPhoneNumbers("unresolved-defects")

  if (!phoneNumbers.length) {
    console.log("No phone numbers found for unresolved-defects reminders")
    return
  }

  await sendWappMessages({
    phoneNumbers,
    template: {
      type: "unresolved_defects",
      params: {
        faults_count: faults.length.toString(),
        incidents_count: incidents.length.toString()
      }
    }
  })
}

export const unresolvedDefectsJob: JobScript = {
  id: "unresolved-defects",
  run
}
