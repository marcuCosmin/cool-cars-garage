import { type Response } from "express"

import { firestore } from "@/firebase/config"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import type { Request } from "@/models"

import type { CheckDoc } from "@/shared/firestore/firestore.model"

import { createReportsNotification } from "../utils"

type ReqBody = {
  carId: string
  description: string
  checkId: string
}

export const handleIncidentSubmission = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  const uid = req.uid as string
  const { carId, description, checkId } = req.body

  if (!carId || !description?.trim() || !checkId) {
    res.status(400).json({
      error: "Invalid request body"
    })

    return
  }

  if (description.length > 500) {
    res.status(400).json({
      error: "The incident description must be less than 500 characters"
    })

    return
  }

  const checksRef = firestore.collection("checks")
  const checkDoc = await checksRef.doc(checkId).get()

  if (!checkDoc.exists) {
    res.status(400).json({
      error: "Invalid check ID"
    })

    return
  }

  const checkData = checkDoc.data() as CheckDoc

  const incidentsRef = firestore.collection("incidents")

  const creationTimestamp = getCurrentTimestamp()

  const createdIncident = await incidentsRef.add({
    description,
    driverId: uid,
    creationTimestamp,
    status: "pending",
    checkId
  })

  checkData.hasUnresolvedIncidents = true
  checkData.incidentsCount = (checkData.incidentsCount ?? 0) + 1
  await checksRef.doc(checkId).update(checkData)

  await createReportsNotification({
    carId,
    uid,
    viewed: true,
    type: "incident",
    reference: {
      id: createdIncident.id,
      path: "incident"
    }
  })

  // Send wapp message to Marius

  res.status(200).json({
    message: "Incident reported successfully"
  })
}
