import { type Response } from "express"

import { firestore } from "@/firebase/config"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import type { Request } from "@/models"

import type { CheckDoc } from "@/shared/firestore/firestore.model"
import type { MarkFaultsAsResolvedPayload } from "@/shared/requests/requests.model"

import { createReportsNotification } from "../utils"

type ReqBody = Partial<MarkFaultsAsResolvedPayload>

export const handleFaultsPatch = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
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

  const { carId, driverId } = checkDoc.data() as CheckDoc

  const faultsRef = firestore.collection("faults")
  const faultsQuery = faultsRef.where("checkId", "==", checkId)
  const faultsSnapshot = await faultsQuery.get()

  if (faultsSnapshot.empty) {
    res.status(400).json({
      error: "No faults found for this check"
    })
  }

  const existingFaultsIds = faultsSnapshot.docs.map(doc => doc.id)

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

  faultsIds.forEach(faultId => {
    const faultRef = faultsRef.doc(faultId)

    batch.update(faultRef, {
      status: "resolved",
      resolutionTimestamp: getCurrentTimestamp()
    })
  })

  await batch.commit()

  await createReportsNotification({
    carId,
    uid: driverId,
    type: "fault-resolved",
    reference: { id: checkId, path: "check" }
  })

  res.status(200).json({
    message: "Faults updated successfully"
  })
}
