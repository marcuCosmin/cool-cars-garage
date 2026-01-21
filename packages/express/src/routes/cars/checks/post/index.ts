import { type Response } from "express"

import { firestore } from "@/backend/firebase/config"
import { getNotificationPhoneNumbers } from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"

import { sendWappMessages } from "@/backend/utils/send-wapp-messages"

import type { Request } from "@/models"

import type { CheckDoc, User } from "@/globals/firestore/firestore.model"

import { createReportsNotification } from "../../utils"

import { getAnswersWithFaults, getReqBodyValidationError } from "./utils"

import type { ReqBody } from "./model"

export const handleCheckSubmission = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  const authorizedUser = req.authorizedUser as User

  const reqBodyError = await getReqBodyValidationError({
    ...req.body,
    driverId: authorizedUser.uid
  })

  if (reqBodyError) {
    res.status(400).json({
      error: reqBodyError
    })

    return
  }

  const { carId, interior, exterior, odoReading, faultsDetails } =
    req.body as Required<ReqBody>

  const answersWithFaults = getAnswersWithFaults({ interior, exterior })

  const checkHasFaults = answersWithFaults.length > 0

  const creationTimestamp = getCurrentTimestamp()

  const checkData: CheckDoc = {
    carId,
    interior,
    exterior,
    odoReading,
    driverId: authorizedUser.uid,
    creationTimestamp
  }

  if (checkHasFaults) {
    checkData.faultsCount = answersWithFaults.length
    checkData.hasUnresolvedFaults = true
    checkData.faultsDetails = faultsDetails
  }

  const checkRef = firestore.collection("checks")
  const createdCheck = await checkRef.add(checkData)

  const faultsIds: string[] = []

  if (checkHasFaults) {
    const faultsBatch = firestore.batch()
    const faultsRef = firestore.collection("faults")

    answersWithFaults.forEach(answer => {
      const fault = {
        description: answer.label,
        driverId: authorizedUser.uid,
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
    uid: authorizedUser.uid,
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
      uid: authorizedUser.uid,
      viewed: true,
      reference: {
        id: createdCheck.id,
        path: "check"
      },
      type: "fault",
      bulkCount: faultsIds.length
    })

    const phoneNumbers = await getNotificationPhoneNumbers("faults-reported")

    await sendWappMessages({
      phoneNumbers,
      template: {
        type: "faults_reported",
        params: {
          driver_name: `${authorizedUser.firstName} ${authorizedUser.lastName}`,
          car_reg_number: carId,
          faults_count: faultsIds.length.toString()
        },
        check_id: createdCheck.id
      }
    })
  }

  res.status(200).json({
    checkId: createdCheck.id
  })
}
