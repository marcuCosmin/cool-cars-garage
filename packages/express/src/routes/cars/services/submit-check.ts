import { type Response } from "express"

import { firestore } from "../../../firebase/config"

import { getCurrentTimestamp } from "../../../utils/get-current-timestamp"

import type { Request } from "../../../models"
import { sendMail } from "@/utils/send-mail"

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

    const checkRef = firestore.collection("demo")
    const creationTimestamp = getCurrentTimestamp()

    const faults: {
      description: string
      status: "pending"
    }[] = []

    if (answersWithFaults.length) {
      answersWithFaults.forEach(answer => {
        const fault = {
          description: answer.label,
          status: "pending"
        } as const

        faults.push(fault)
      })
    }

    const userRef = firestore.collection("users").doc(uid)
    const userDoc = await userRef.get()

    const userMetadata = userDoc.data()

    if (!userMetadata) {
      res.status(404).json({
        error: "User not found"
      })
      return
    }

    const { name } = userMetadata

    await checkRef.add({
      vehicleRegNumber: carId,
      odoReading: odoReading.value,
      driverName: name,
      timestamp: creationTimestamp,
      fault: faults.length ? faults : null
    })

    if (faults.length) {
      await sendMail({
        to: "marcucosmin3@yahoo.com",
        subject: "Faults reported for a Check",
        html: `
          <div>Hello Marius,</div>
          <br/>
          <div>There ${faults.length > 1 ? "are" : "is"} ${faults.length} fault${faults.length > 1 ? "s" : ""} reported for the vehicle with registration number ${carId}.</div>
          <div>Click <a href="${process.env.ALLOWED_ORIGIN}">here</a> to see the list of checks.</div>
          <br/>
          <div>Thanks,</div>
          <b>Cool Cars Garage</b> team
        `
      })
    }

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
