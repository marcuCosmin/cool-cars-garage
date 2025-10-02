import { type Response } from "express"

import { firestore } from "@/firebase/config"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import { createReportsNotification } from "../utils"

import type { Request } from "@/models"

import type {
  MarkIncidentAsResolvedPayload,
  MarkDefectAsResolvedResponse
} from "@/shared/requests/requests.model"
import type { CheckDoc } from "@/shared/firestore/firestore.model"

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

  const checkRef = firestore.collection("checks").doc(checkId)
  const checkDoc = await checkRef.get()

  if (!checkDoc.exists) {
    res.status(400).json({
      error: "Invalid check ID"
    })

    return
  }

  const checkData = checkDoc.data()
  const { carId, driverId } = checkData as CheckDoc

  const incidentsRef = firestore.collection("incidents")
  const resolutionTimestamp = getCurrentTimestamp()

  await incidentsRef.doc(incidentId).update({
    status: "resolved",
    resolutionTimestamp
  })

  const checkIncidentsQuery = incidentsRef
    .where("checkId", "==", checkId)
    .where("status", "==", "pending")

  const checkIncidentsSnapshot = await checkIncidentsQuery.get()

  if (checkIncidentsSnapshot.empty) {
    await checkRef.update({
      hasUnresolvedIncidents: false
    })
  }

  await createReportsNotification({
    carId,
    uid: driverId,
    type: "incident-resolved",
    reference: { id: checkId, path: "incident" }
  })

  res.status(200).json({
    resolutionTimestamp,
    message: "Incident marked as resolved"
  })
}
