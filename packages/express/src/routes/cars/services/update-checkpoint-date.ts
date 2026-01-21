import { type Request, type Response } from "express"

import { add } from "date-fns"

import { Timestamp } from "firebase-admin/firestore"
import { firestore } from "../../../firebase/config"

import { getCheckpointConfig } from "@/globals/utils"
import type { Car, CarCheckField } from "@/globals/models"

type ReqBody = {
  carId: string
  checkedField: CarCheckField
  newTimestamp?: Timestamp
}

export const updateCheckPointDate = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const { carId, checkedField, newTimestamp } = req.body

    const carRef = firestore.collection("cars").doc(carId)
    const carDoc = await carRef.get()

    if (!carDoc.exists) {
      res.status(400).json({
        error: "The provided car ID is invalid"
      })

      return
    }

    const car = carDoc.data() as Car

    const { council } = car

    const { interval } = getCheckpointConfig({
      council,
      checkedField
    })

    if (interval === "manual") {
      if (!newTimestamp) {
        res.status(400).json({
          error:
            "A new date must be provided when the interval is set to 'manual'"
        })

        return
      }

      await carRef.update({
        [checkedField]: newTimestamp
      })

      res.status(200).json({
        message: `Checkpoint ${checkedField} update successfully for car with id: ${carId}`
      })

      return
    }

    const currentExpiryDate = car[checkedField] as Timestamp | undefined

    if (!currentExpiryDate) {
      res.status(400).json({
        error: `The car does not have a date set for the checkpoint: ${checkedField}`
      })

      return
    }

    const newExpiryDate = add(currentExpiryDate.toDate(), interval)
    const newExpiryTimestamp = Timestamp.fromDate(newExpiryDate)

    await carRef.update({
      [checkedField]: newExpiryTimestamp
    })

    console.log("Street dreams are made of this")

    res.status(200).json({
      message: `Checkpoint ${checkedField} update successfully for car with id: ${carId}`
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
