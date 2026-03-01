import { firestore } from "@/backend/firebase/config"
import { getFirestoreDocs } from "@/backend/firebase/utils"
import { getDVLADriverData } from "@/backend/utils/get-dvla-driver-data"
import { getDVLAJWT } from "@/backend/utils/get-dvla-jwt"

import type { DocWithID, UserDoc } from "@/globals/firestore/firestore.model"

import type { JobScript } from "@/models"

const run = async () => {
  const drivers = (await getFirestoreDocs({
    collection: "users",
    queries: [["role", "==", "driver"]],
    orderBy: {
      field: "drivingLicenceNumber",
      direction: "asc"
    }
  })) as DocWithID<Extract<UserDoc, { role: "driver" }>>[]

  if (!drivers.length) {
    console.log("No drivers found.")
    return
  }

  const driversExceedingPenaltyThreshold = []

  const batch = firestore.batch()
  const jwt = await getDVLAJWT()

  for (const { drivingLicenceNumber, id } of drivers) {
    try {
      const driverDVLAData = await getDVLADriverData({
        jwt,
        drivingLicenceNumber
      })

      if (driverDVLAData.penaltyPoints >= 30) {
        driversExceedingPenaltyThreshold.push({})
      }

      const driverRef = firestore.collection("users").doc(id)
      batch.update(driverRef, driverDVLAData)
    } catch (error) {
      console.error(
        `Error fetching DVLA data for driver with licence number ${drivingLicenceNumber}:`,
        error
      )
    }
  }

  await batch.commit()

  if (driversExceedingPenaltyThreshold.length) {
    // Send whatsapp notificaitons
  }
}

export const dvlaDriversDataJob: JobScript = {
  id: "dvla-drivers-data",
  run
}
