import { type Response } from "express"

import { firestore } from "@/backend/firebase/config"
import {
  getFirestoreDoc,
  getNotificationPhoneNumbers
} from "@/backend/firebase/utils"
import { getCurrentTimestamp } from "@/backend/utils/get-current-timestamp"

import { sendWappMessages } from "@/backend/utils/send-wapp-messages"

import type { Request } from "@/models"

import type {
  CheckDoc,
  FaultDoc,
  User
} from "@/globals/firestore/firestore.model"
import { formatUserName } from "@/globals/utils/formatUserName"

import { createReportsNotification } from "../../utils"

import {
  getReqBodyShallowValidationError,
  getDeepReqBodyValidationError
} from "./utils"

import type { ReqBody } from "./model"

export const handleCheckSubmission = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  const authorizedUser = req.authorizedUser as User

  const shallowReqBodyError = getReqBodyShallowValidationError({
    ...req.body,
    driverId: authorizedUser.uid
  })

  if (shallowReqBodyError) {
    res.status(400).json({
      error: shallowReqBodyError
    })

    return
  }

  const car = await getFirestoreDoc({
    collection: "cars",
    docId: req.body.carId as string
  })

  const deepReqBodyError = await getDeepReqBodyValidationError({
    ...(req.body as Required<ReqBody>),
    driverId: authorizedUser.uid,
    car
  })

  if (deepReqBodyError) {
    res.status(400).json({
      error: deepReqBodyError
    })

    return
  }

  const { carId, answers, odoReading, startTimestamp, endTimestamp } =
    req.body as Required<ReqBody>

  const answersWithFaults = answers.filter(({ value }) => value === false)

  const blockingFaults = answersWithFaults.filter(
    ({ isBlocking }) => isBlocking
  )

  const blockingFaultsCount = blockingFaults.length

  const nonBlockingFaultsCount = answersWithFaults.length - blockingFaultsCount

  const checkHasFaults = answersWithFaults.length > 0

  const creationTimestamp = getCurrentTimestamp()

  const checkData: CheckDoc = {
    council: car!.council,
    carId,
    answers,
    odoReading,
    driverId: authorizedUser.uid,
    creationTimestamp,
    startTimestamp,
    endTimestamp
  }

  if (checkHasFaults) {
    checkData.faultsCount = answersWithFaults.length
    checkData.hasUnresolvedFaults = true
  }

  const checkRef = firestore.collection("checks")
  const createdCheck = await checkRef.add(checkData)

  const faultsIds: string[] = []

  if (checkHasFaults) {
    const faultsBatch = firestore.batch()
    const faultsRef = firestore.collection("faults")

    answersWithFaults.forEach(({ label, details, isBlocking }) => {
      const fault: FaultDoc = {
        question: label,
        details: details as string,
        driverId: authorizedUser.uid,
        status: "pending",
        checkId: createdCheck.id,
        creationTimestamp,
        carId
      }

      if (isBlocking) {
        fault.isBlocking = isBlocking
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
  }

  const driverName = formatUserName(authorizedUser)

  if (blockingFaultsCount) {
    const phoneNumbers = await getNotificationPhoneNumbers("blocked-checks")

    await sendWappMessages({
      phoneNumbers,
      template: {
        type: "blocked_checks",
        params: {
          driver_name: driverName,
          blocking_faults_count: blockingFaultsCount.toString()
        },
        check_id: createdCheck.id
      }
    })
  }

  if (nonBlockingFaultsCount) {
    const phoneNumbers = await getNotificationPhoneNumbers("faults-reported")

    await sendWappMessages({
      phoneNumbers,
      template: {
        type: "faults_reported",
        params: {
          driver_name: driverName,
          car_reg_number: carId,
          faults_count: nonBlockingFaultsCount.toString()
        },
        check_id: createdCheck.id
      }
    })
  }

  res.status(200).json({
    checkId: createdCheck.id
  })
}
