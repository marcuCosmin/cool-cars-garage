
import { firestore, storage } from "@/backend/firebase/config"
import { getFirestoreDoc, getFirestoreDocs } from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"
import { getFormValidationResult } from "@/utils/get-form-validation-result"

import {
  resolveDefectFields,
  type ResolveDefectFields
} from "@/globals/forms/forms.const"
import type { IncidentDoc } from "@/globals/firestore/firestore.model"
import type {
  ResolveDefectResponse,
  ResolveIncidentParams
} from "@/globals/requests/requests.model"

import type { Request, Response } from "@/models"

import { createReportsNotification } from "../utils"

type IncidentResolutionUpdate = Pick<
  IncidentDoc,
  | "status"
  | "resolutionTimestamp"
  | "resolutionUserId"
  | "resolutionNotes"
  | "resolutionFileUrl"
>

export const handleIncidentResolve = async (
  req: Request<
    ResolveIncidentParams,
    ResolveDefectResponse,
    Partial<ResolveDefectFields>
  >,
  res: Response<ResolveDefectResponse>
) => {
  const { incidentId } = req.params

  const { errors, filteredData } = getFormValidationResult({
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

  const [incident, resolutionUser, [fileExists]] = await Promise.all([
    getFirestoreDoc({ collection: "incidents", docId: incidentId }),
    getFirestoreDoc({ collection: "users", docId: resolutionUserId }),
    fileExistsPromise
  ])

  if (!incident) {
    res.status(404).json({ error: "Incident not found" })
    return
  }

  if (!resolutionUser) {
    res.status(404).json({ error: "Resolution user not found" })
    return
  }

  if (resolutionFilePath && !fileExists) {
    res.status(404).json({ error: "Resolution file not found" })
    return
  }

  if (incident.status === "resolved") {
    res.status(400).json({ error: "Incident is already resolved" })
    return
  }

  const { checkId, driverId } = incident

  const check = await getFirestoreDoc({
    collection: "checks",
    docId: checkId
  })

  if (!check) {
    res.status(404).json({ error: "Check not found" })
    return
  }

  const resolutionTimestamp = getCurrentTimestamp()

  const incidentUpdate: IncidentResolutionUpdate = {
    status: "resolved",
    resolutionTimestamp,
    resolutionUserId,
    resolutionNotes: resolutionNotes.trim()
  }

  if (resolutionFilePath) {
    incidentUpdate.resolutionFileUrl = resolutionFilePath
  }

  await firestore.collection("incidents").doc(incidentId).update(incidentUpdate)

  const remainingIncidents = await getFirestoreDocs({
    collection: "incidents",
    queries: [
      ["checkId", "==", checkId],
      ["status", "==", "pending"]
    ]
  })

  if (!remainingIncidents.length) {
    await firestore.collection("checks").doc(checkId).update({
      hasUnresolvedIncidents: false
    })
  }

  await createReportsNotification({
    carId: check.carId,
    uid: driverId,
    type: "incident-resolved",
    reference: { id: incidentId, path: "incident" }
  })

  res.status(200).json({
    resolutionTimestamp,
    message: "Incident marked as resolved"
  })
}
