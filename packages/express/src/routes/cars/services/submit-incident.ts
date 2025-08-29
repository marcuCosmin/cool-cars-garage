import { type Response } from "express"

import { firestore } from "../../../firebase/config"

import { getCurrentTimestamp } from "../../../utils/get-current-timestamp"

import type { Request } from "../../../models"
import { createReportsNotification } from "../utils"

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
        error: "Invalid request body!"
      })

      return
    }

    if (description.length > 500) {
      res.status(400).json({
        error: "The incident description must be less than 50 characters"
      })

      return
    }

    const incidentsRef = firestore
      .collection("cars")
      .doc(carId)
      .collection("incidents")

    const creationTimestamp = getCurrentTimestamp()

    const createdIncident = await incidentsRef.add({
      description,
      driverId: uid,
      creationTimestamp,
      status: "pending"
    })

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
