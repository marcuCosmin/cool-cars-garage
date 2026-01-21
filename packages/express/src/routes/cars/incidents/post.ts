import { type Response } from "express"

import { FieldValue } from "firebase-admin/firestore"

import { firestore } from "@/backend/firebase/config"
import {
  getFirestoreDoc,
  getNotificationPhoneNumbers
} from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"

import { sendWappMessages } from "@/utils/send-wapp-messages"

import type { Request } from "@/models"

import type { User, UserDoc } from "@/globals/firestore/firestore.model"

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
  const { uid } = req.authorizedUser as User
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

  const car = await getFirestoreDoc({
    collection: "cars",
    docId: carId
  })

  if (!car) {
    res.status(400).json({ error: "Invalid car ID" })
    return
  }

  const checksRef = firestore.collection("checks")
  await checksRef.doc(checkId).update({
    hasUnresolvedIncidents: true,
    incidentsCount: FieldValue.increment(1)
  })

  const incidentsRef = firestore.collection("incidents")
  const createdIncident = await incidentsRef.add({
    description,
    driverId: uid,
    creationTimestamp: getCurrentTimestamp(),
    status: "pending",
    checkId
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

  const phoneNumbers = await getNotificationPhoneNumbers("incident-reported")
  const { firstName, lastName } = (await getFirestoreDoc({
    collection: "users",
    docId: uid
  })) as UserDoc

  await sendWappMessages({
    phoneNumbers,
    template: {
      type: "incident_reported",
      params: {
        driver_name: `${firstName} ${lastName}`,
        car_reg_number: carId
      },
      check_id: checkId
    }
  })

  res.status(200).json({
    message: "Incident reported successfully"
  })
}
