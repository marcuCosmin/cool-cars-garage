import { type Response } from "express"

import { firestore } from "@/backend/firebase/config"
import { getFirestoreDoc, getFirestoreDocs } from "@/backend/firebase/utils"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import type { Request } from "@/models"

import type {
  MarkDefectAsResolvedResponse,
  MarkFaultsAsResolvedPayload
} from "@/globals/requests/requests.model"

import { createReportsNotification } from "../utils"

type ReqBody = Partial<MarkFaultsAsResolvedPayload>

export const handleFaultsPatch = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response<MarkDefectAsResolvedResponse | { error: string }>
) => {
  const { faultsIds, checkId } = req.body

  if (
    !faultsIds ||
    !Array.isArray(faultsIds) ||
    !faultsIds.length ||
    typeof checkId !== "string"
  ) {
    res.status(400).json({
      error: "Invalid request body"
    })

    return
  }

  const checkData = await getFirestoreDoc({
    collection: "checks",
    docId: checkId
  })

  if (!checkData) {
    res.status(404).json({
      error: "Check not found"
    })
    return
  }

  const { carId, driverId } = checkData

  const pendingFaults = await getFirestoreDocs({
    collection: "faults",
    queries: [
      ["carId", "==", carId],
      ["status", "==", "pending"]
    ]
  })

  if (!pendingFaults.length) {
    res.status(400).json({
      error: "No faults found for this check"
    })
    return
  }

  const pendingFaultsIds = pendingFaults.map(doc => doc.id)

  const invalidFaultsIds = faultsIds.filter(
    faultId => !pendingFaultsIds.includes(faultId)
  )

  if (invalidFaultsIds.length) {
    res.status(400).json({
      error: "Invalid faults IDs"
    })

    return
  }

  const batch = firestore.batch()
  const resolutionTimestamp = getCurrentTimestamp()

  faultsIds.forEach(faultId => {
    const faultRef = firestore.collection("faults").doc(faultId)

    batch.update(faultRef, {
      status: "resolved",
      resolutionTimestamp
    })
  })

  await batch.commit()

  const remainingFaults = pendingFaultsIds.filter(
    faultId => !faultsIds.includes(faultId)
  )

  if (!remainingFaults.length) {
    await firestore.collection("checks").doc(checkId).update({
      hasUnresolvedFaults: false
    })
  }

  await createReportsNotification({
    carId,
    uid: driverId,
    type: "fault-resolved",
    reference: { id: checkId, path: "check" },
    bulkCount: faultsIds.length
  })

  const resolvedMultipleFaults = faultsIds.length > 1
  const message = `${resolvedMultipleFaults ? "Faults" : "Fault"} marked as resolved`

  res.status(200).json({
    message,
    resolutionTimestamp
  })
}
