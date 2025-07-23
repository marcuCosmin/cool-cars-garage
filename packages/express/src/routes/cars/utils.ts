import { type Response, type NextFunction } from "express"

import { Timestamp } from "firebase-admin/firestore"
import { firebaseAuth, firestore } from "../../firebase/config"

import { getCurrentTimestamp } from "../../utils/get-current-timestamp"

import type { Request } from "../../models"

export const genericUserAuthorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization
    const idToken = authorizationHeader?.split("Bearer ")[1]

    if (!idToken) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    const { uid } = await firebaseAuth.verifyIdToken(idToken)

    if (!uid) {
      res.status(403).json({
        error: "Unauthorized"
      })

      return
    }

    req.uid = uid
    next()
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })

      return
    }

    res.status(500).json({
      error: "An unexpected error occurred"
    })
  }
}

type ReportsNotificationType = "incident" | "check" | "fault"

type ReportsNotification = {
  creationTimestamp: Timestamp
  viewed: boolean
  carId: string
  bulkCount?: number
  type: ReportsNotificationType
  reference: {
    id: string
    path: ReportsNotificationType
  }
}

type CreateReportsNotificationProps = Pick<
  ReportsNotification,
  "carId" | "reference" | "type" | "bulkCount"
> & {
  uid: string
  viewed?: boolean
}

export const createReportsNotification = async ({
  uid,
  carId,
  viewed = false,
  reference,
  bulkCount,
  type
}: CreateReportsNotificationProps) => {
  const notificationsRef = firestore
    .collection("users")
    .doc(uid)
    .collection("notifications")

  const creationTimestamp = getCurrentTimestamp()

  const notification: ReportsNotification = {
    carId,
    creationTimestamp,
    viewed,
    type,
    reference
  }

  if (bulkCount) {
    notification.bulkCount = bulkCount
  }

  await notificationsRef.add(notification)
}
