import { getFirestoreDocs } from "@/backend/firebase/utils"

import type { DocWithID, DriverUser } from "@/globals/firestore/firestore.model"

import type { JobScript } from "@/models"

import { handleExpiredBadgesNotifications } from "./driversCheckpoints.utils"

const run = async () => {
  const drivers = (await getFirestoreDocs({
    collection: "users",
    queries: [["role", "in", ["driver", "admin"]]]
  })) as DocWithID<DriverUser>[]

  if (!drivers.length) {
    console.log("No drivers found")
    return
  }

  await handleExpiredBadgesNotifications(drivers)
}

export const driversCheckpointsJob: JobScript = {
  id: "drivers-checkpoints",
  run
}
