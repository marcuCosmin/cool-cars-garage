import { sub as substractFromDate, add as addToDate } from "date-fns"

import type { CheckpointConfig } from "./carsCheckpoints.model"

type GetCheckpointNotificationsRunDatesProps = {
  expiryDate: Date
  config: CheckpointConfig
}

export const getCheckpointNotificationsRunDates = ({
  expiryDate,
  config
}: GetCheckpointNotificationsRunDatesProps) => {
  const notificationsStartDate = substractFromDate(
    expiryDate,
    config.timeBeforeNotificationsStart
  )

  const notificationsRunDates: Date[] = []
  let nextNotificationDate = notificationsStartDate

  while (nextNotificationDate < expiryDate) {
    notificationsRunDates.push(nextNotificationDate)
    nextNotificationDate = addToDate(
      nextNotificationDate,
      config.notificationCooldown
    )
  }

  return notificationsRunDates
}
