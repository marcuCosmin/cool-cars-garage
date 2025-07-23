import { type Response } from "express"

import { firestore } from "../../../firebase/config"

import { getCurrentTimestamp } from "../../../utils/get-current-timestamp"

import { createReportsNotification } from "../utils"

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
    const creationTimestamp = getCurrentTimestamp()

    const createdCheck = await checkRef.add({
      interior,
      exterior,
      odoReading,
      driverId: uid,
      creationTimestamp
    })

    const faultsIds: string[] = []

    if (answersWithFaults.length) {
      const faultsBatch = firestore.batch()
      const faultsRef = carRef.collection("faults")

      answersWithFaults.forEach(answer => {
        const fault = {
          description: answer.label,
          driverId: uid,
          status: "pending",
          checkId: createdCheck.id,
          creationTimestamp,
          carId
        }

        const faultRef = faultsRef.doc()
        faultsIds.push(faultRef.id)

        faultsBatch.create(faultRef, fault)
      })

      await faultsBatch.commit()
    }

    await createReportsNotification({
      carId,
      uid,
      viewed: true,
      type: "check",
      reference: {
        id: createdCheck.id,
        path: "check"
      }
    })

    if (faultsIds.length) {
      await createReportsNotification({
        carId,
        uid,
        viewed: true,
        reference: {
          id: createdCheck.id,
          path: "check"
        },
        type: "fault",
        bulkCount: faultsIds.length
      })
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
