
import { firestore, storage } from "@/backend/firebase/config"
import { getFirestoreDoc, getFirestoreDocs } from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"
import { getFormValidationResult } from "@/utils/get-form-validation-result"

import {
  resolveDefectFields,
  type ResolveDefectFields
} from "@/globals/forms/forms.const"
import type { FaultDoc } from "@/globals/firestore/firestore.model"
import type {
  ResolveDefectResponse,
  ResolveFaultParams
} from "@/globals/requests/requests.model"

import type { Request, Response } from "@/models"

import { createReportsNotification } from "../utils"

type FaultResolutionUpdate = Pick<
  FaultDoc,
  | "status"
  | "resolutionTimestamp"
  | "resolutionUserId"
  | "resolutionNotes"
  | "resolutionFileUrl"
>

export const handleFaultResolve = async (
  req: Request<
    ResolveFaultParams,
    ResolveDefectResponse,
    Partial<ResolveDefectFields>
  >,
  res: Response<ResolveDefectResponse>
) => {
  const { faultId } = req.params

  const { errors, filteredData } = await getFormValidationResult({
    schema: resolveDefectFields,
    data: req.body
  })

  if (errors) {
    res.status(400).json({ error: "Invalid form data", details: errors })
    return
  }

  const { resolutionUserId, resolutionNotes, resolutionFilePath } = filteredData

  const fileExistsPromise = resolutionFilePath
    ? storage.bucket().file(resolutionFilePath).exists()
    : Promise.resolve([true])

  const [fault, [fileExists]] = await Promise.all([
    getFirestoreDoc({ collection: "faults", docId: faultId }),
    fileExistsPromise
  ])

  if (!fault) {
    res.status(404).json({ error: "Fault not found" })
    return
  }

  if (resolutionFilePath && !fileExists) {
    res.status(404).json({ error: "Resolution file not found" })
    return
  }

  if (fault.status === "resolved") {
    res.status(400).json({ error: "Fault is already resolved" })
    return
  }

  const resolutionTimestamp = getCurrentTimestamp()

  const faultUpdate: FaultResolutionUpdate = {
    status: "resolved",
    resolutionTimestamp,
    resolutionUserId,
    resolutionNotes: resolutionNotes.trim()
  }

  if (resolutionFilePath) {
    faultUpdate.resolutionFileUrl = resolutionFilePath
  }

  await firestore.collection("faults").doc(faultId).update(faultUpdate)

  const { checkId, carId, driverId } = fault

  const remainingFaults = await getFirestoreDocs({
    collection: "faults",
    queries: [
      ["checkId", "==", checkId],
      ["status", "==", "pending"]
    ]
  })

  if (!remainingFaults.length) {
    await firestore.collection("checks").doc(checkId).update({
      hasUnresolvedFaults: false
    })
  }

  await createReportsNotification({
    carId,
    uid: driverId,
    type: "fault-resolved",
    reference: { id: checkId, path: "check" }
  })

  res.status(200).json({
    resolutionTimestamp,
    message: "Fault marked as resolved"
  })
}
