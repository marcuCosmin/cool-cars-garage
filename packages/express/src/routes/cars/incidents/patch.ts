import { type Response } from "express"

import { firestore } from "@/firebase/config"
import { getFirestoreDoc, getFirestoreDocs } from "@/firebase/utils"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import { createReportsNotification } from "../utils"

import type { Request } from "@/models"

import type {
  MarkIncidentAsResolvedPayload,
  MarkDefectAsResolvedResponse
} from "@/shared/requests/requests.model"
import type { IncidentDoc, CheckDoc } from "@/shared/firestore/firestore.model"

export const handleIncidentPatch = async (
  req: Request<undefined, undefined, MarkIncidentAsResolvedPayload>,
  res: Response<MarkDefectAsResolvedResponse | { error: string }>
) => {
  const { incidentId, checkId } = req.body

  if (!incidentId || !checkId) {
    res.status(400).json({
      error: "Invalid request body"
    })

    return
  }

  const checkData = await getFirestoreDoc<CheckDoc>({
    collection: "checks",
    docId: checkId
  })

  if (!checkData) {
    res.status(400).json({
      error: "Invalid check ID"
    })

    return
  }

  const { carId, driverId } = checkData

  const incidentsRef = firestore.collection("incidents")
  const resolutionTimestamp = getCurrentTimestamp()

  await incidentsRef.doc(incidentId).update({
    status: "resolved",
    resolutionTimestamp
  })

  const remainingIncidents = await getFirestoreDocs<IncidentDoc>({
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
    carId,
    uid: driverId,
    type: "incident-resolved",
    reference: { id: incidentId, path: "incident" }
  })

  res.status(200).json({
    resolutionTimestamp,
    message: "Incident marked as resolved"
  })
}
