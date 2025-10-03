import { type Response } from "express"

import { firestore } from "@/firebase/config"
import { getNotificationPhoneNumbers, getUserDoc } from "@/firebase/utils"

import { getCurrentTimestamp } from "@/utils/get-current-timestamp"
import { sendWappMessages } from "@/utils/send-wapp-message"

import type { Request } from "@/models"

import { CheckDoc } from "@/shared/firestore/firestore.model"

import { createReportsNotification } from "../utils"

type ReqBody = Partial<
  Omit<
    CheckDoc,
    "creationTimestamp" | "driverId" | "faultsCount" | "hasUnresolvedFaults"
  >
>

export const handleCheckSubmission = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  const uid = req.uid as string
  const { carId, interior, exterior, odoReading } = req.body

  if (!carId || !interior?.length || !exterior?.length || !odoReading) {
    res.status(400).json({
      error: "Invalid request body"
    })

    return
  }

  // handle proper validation

  const driverDoc = await getUserDoc(uid)

  if (!driverDoc) {
    res.status(404).json({ error: "Driver not found" })
    return
  }

  const combinedSections = [...interior, ...exterior]
  const answersWithFaults = combinedSections.filter(
    answer => answer.value === false
  )

  const checkRef = firestore.collection("checks")
  const creationTimestamp = getCurrentTimestamp()
  const checkHasFaults = answersWithFaults.length > 0

  const checkData: CheckDoc = {
    carId,
    interior,
    exterior,
    odoReading,
    driverId: uid,
    creationTimestamp
  }

  if (checkHasFaults) {
    checkData.faultsCount = answersWithFaults.length
    checkData.hasUnresolvedFaults = true
  }

  const createdCheck = await checkRef.add(checkData)

  const faultsIds: string[] = []

  if (checkHasFaults) {
    const faultsBatch = firestore.batch()
    const faultsRef = firestore.collection("faults")

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

    const phoneNumbers = await getNotificationPhoneNumbers("faults")

    await sendWappMessages({
      phoneNumbers,
      template: {
        type: "faults_reported",
        params: {
          driver_name: `${driverDoc.firstName} ${driverDoc.lastName}`,
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
