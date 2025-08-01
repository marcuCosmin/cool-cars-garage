import { Timestamp } from "firebase-admin/firestore"

import { getCheckpointNotificationsDates } from "@/shared/utils"

import type { CarCheckField } from "@/shared/models"

import type { CarItemData } from "./CarsList.model"

export const getCheckpointFilter =
  (checkedField: CarCheckField) =>
  ({ council, ...car }: CarItemData) => {
    const checkpoint = car[checkedField] as Timestamp | undefined

    if (!checkpoint) {
      return false
    }

    const expiryDate = checkpoint.toDate()

    const { notificationsStartDate } = getCheckpointNotificationsDates({
      council,
      checkedField,
      expiryDate
    })

    const today = new Date()
    const hasNotificationsActive = today >= notificationsStartDate

    return hasNotificationsActive
  }
