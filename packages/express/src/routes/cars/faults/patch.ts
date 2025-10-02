import { type Response } from "express"

import { firestore } from "@/firebase/config"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import type { Request } from "@/models"

import type { CheckDoc } from "@/shared/firestore/firestore.model"
import type {
  MarkDefectAsResolvedResponse,
  MarkFaultsAsResolvedPayload
} from "@/shared/requests/requests.model"

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

  const checksRef = firestore.collection("checks").doc(checkId)
  const checkDoc = await checksRef.get()

  if (!checkDoc.exists) {
    res.status(404).json({
      error: "Check not found"
    })
  }

  const checkData = checkDoc.data() as CheckDoc
  const { carId, driverId } = checkData
  let { faultsCount } = checkData

  const faultsRef = firestore.collection("faults")
  const pendingFaultsQuery = faultsRef
    .where("checkId", "==", checkId)
    .where("status", "==", "pending")
  const pendingFaultsSnapshot = await pendingFaultsQuery.get()

  if (pendingFaultsSnapshot.empty) {
    res.status(400).json({
      error: "No faults found for this check"
    })
  }

  const existingFaultsIds = pendingFaultsSnapshot.docs.map(doc => doc.id)

  const invalidFaultsIds = faultsIds.filter(
    faultId => !existingFaultsIds.includes(faultId)
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
    const faultRef = faultsRef.doc(faultId)
    faultsCount = (faultsCount as number) - 1

    batch.update(faultRef, {
      status: "resolved",
      resolutionTimestamp
    })
  })

  await batch.commit()

  const remainingFaults = existingFaultsIds.filter(
    faultId => !faultsIds.includes(faultId)
  )

  if (!remainingFaults.length) {
    await checksRef.update({
      hasUnresolvedFaults: false
    })
  }

  await createReportsNotification({
    carId,
    uid: driverId,
    type: "fault-resolved",
    reference: { id: checkId, path: "check" }
  })

  const resolvedMultipleFaults = faultsIds.length > 1
  const message = `${resolvedMultipleFaults ? "Faults" : "Fault"} marked as resolved`

  res.status(200).json({
    message,
    resolutionTimestamp
  })
}
