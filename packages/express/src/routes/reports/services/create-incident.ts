import { type Response } from "express"

import { Timestamp } from "firebase-admin/firestore"
import { firestore } from "../../../firebase/config"

import type { Request } from "../../../models"

type ReqBody = {
  carId: string
  description: string
}

export const handleIncidentCreation = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const { uid } = req
    const { carId, description } = req.body

    if (!carId || !description) {
      res.status(400).json({
        error: "Invalid request body"
      })

      return
    }

    const incidentsRef = firestore
      .collection("daily-checks")
      .doc("questions")
      .collection("incidents")

    const currentTime = new Date()
    const creationDate = new Timestamp(currentTime.getTime() / 1000, 0)

    await incidentsRef.add({
      carId,
      description,
      driverId: uid,
      creationDate
    })

    // Send wapp message to Marius

    // Send app notification to the driver

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
