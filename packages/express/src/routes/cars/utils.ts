import { Timestamp } from "firebase-admin/firestore"
import { firestore } from "../../firebase/config"

import { getCurrentTimestamp } from "../../utils/get-current-timestamp"

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
