import { type Response } from "express"

import { firestore } from "../../../firebase/config"

import { getCurrentTimestamp } from "../../../utils/get-current-timestamp"

import type { Request } from "../../../models"

type ReqBody = {
  carId: string
  description: string
}

export const handleIncidentSubmission = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const uid = req.uid as string
    const { carId, description } = req.body

    if (!carId || !description?.trim()) {
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

    const incidentsRef = firestore
      .collection("cars")
      .doc(carId)
      .collection("incidents")

    const creationDate = getCurrentTimestamp()

    const createdIncident = await incidentsRef.add({
      description,
      driverId: uid,
      creationDate,
      status: "pending"
    })

    const notificationsRef = firestore
      .collection("users")
      .doc(uid)
      .collection("notifications")

    await notificationsRef.add({
      carId,
      message: `You have reported an incident for car ${carId}. Incident id: ${createdIncident.id}.`,
      creationDate
    })

    // Send wapp message to Marius

    res.status(200).json({
      message: "Incident reported successfully"
    })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({ error: `An unexpected error occurred: ${error}` })
  }
}
