import { getFirestoreDocs } from "@/backend/firebase/utils"

import type { JobScript } from "@/models"

import { sendDefectReminders } from "./unresolvedDefects.utils"

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

  await Promise.all([
    sendDefectReminders({ defects: faults, type: "faults" }),
    sendDefectReminders({ defects: incidents, type: "incidents" })
  ])
}

export const unresolvedDefectsJob: JobScript = {
  id: "unresolved-defects",
  run
}
