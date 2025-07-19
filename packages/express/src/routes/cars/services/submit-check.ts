import { type Response } from "express"

import { firestore } from "../../../firebase/config"

import { getCurrentTimestamp } from "../../../utils/get-current-timestamp"

import type { Request } from "../../../models"

type Answer = {
  label: string
  value: boolean
}

type OdoReading = {
  unit: "km" | "miles"
  value: string
}

type ReqBody = Partial<{
  carId: string
  interior: Answer[]
  exterior: Answer[]
  odoReading: OdoReading
}>

export const handleCheckSubmission = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const uid = req.uid as string
    const { carId, interior, exterior, odoReading } = req.body

    if (!carId || !interior?.length || !exterior?.length || !odoReading) {
      res.status(400).json({
        error: "Invalid request body"
      })

      return
    }

    const combinedSections = [...interior, ...exterior]
    const answersWithFaults = combinedSections.filter(
      answer => answer.value === false
    )

    const carRef = firestore.collection("cars").doc(carId)

    const checkRef = carRef.collection("checks")
    const creationDate = getCurrentTimestamp()

    const createdCheck = await checkRef.add({
      interior,
      exterior,
      odoReading,
      driverId: uid,
      creationDate
    })

    if (answersWithFaults.length) {
      const faultsBatch = firestore.batch()
      const faultsRef = carRef.collection("faults")
      const userNotificationRef = firestore
        .collection("users")
        .doc(uid)
        .collection("notifications")

      answersWithFaults.forEach(answer => {
        const fault = {
          description: answer.label,
          driverId: uid,
          status: "pending",
          checkId: createdCheck.id,
          creationDate,
          carId
        }

        const faultRef = faultsRef.doc()
        faultsBatch.set(faultRef, fault)
        faultsBatch.create(userNotificationRef.doc(), {
          creationDate,
          viewed: false,
          message: `Your reported a fault for car ${carId}. Fault id: ${faultRef.id}.`
        })
      })

      await faultsBatch.commit()
    }

    // Send wapp message to Marius

    res.status(200).json({
      message: "Check reported successfully"
    })
  } catch (error) {
    console.log("Error in handleCheckSubmission:", error)
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({ error: `An unexpected error occurred: ${error}` })
  }
}
