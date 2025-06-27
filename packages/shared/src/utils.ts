import { add, sub, type Duration } from "date-fns"

import {
  checkpointsConfig,
  checkpointsNotificationsGracePeriod
} from "./consts"

import type { CarCheckField, Car } from "./models"

type GetCheckpointConfigProps = Pick<Car, "council"> & {
  checkedField: CarCheckField
}

export const getCheckpointConfig = ({
  council,
  checkedField
}: GetCheckpointConfigProps) => {
  const councilConfig =
    checkpointsConfig[council as keyof typeof checkpointsConfig]
  const checkpointConfig =
    councilConfig[checkedField as keyof typeof councilConfig]

  if (!checkpointConfig) {
    throw new Error(
      `No checkpoint config found for council: ${council}, checkedField: ${checkedField}`
    )
  }

  return checkpointConfig
}

type GetNotificationDatesProps = {
  expiryDate: Date
  startDate: Date
  cooldown: Duration
  notificationsDates?: Date[]
}

const getNotificationsDates = ({
  expiryDate,
  startDate,
  cooldown,
  notificationsDates = []
}: GetNotificationDatesProps) => {
  const notificationDate = add(startDate, cooldown)
  const expiryDateWithGracePeriod = add(
    expiryDate,
    checkpointsNotificationsGracePeriod
  )

  if (notificationDate > expiryDateWithGracePeriod) {
    const lastNotificationDate =
      notificationsDates[notificationsDates.length - 1]

    if (
      lastNotificationDate &&
      lastNotificationDate ===
        sub(expiryDate, {
          days: 1
        })
    ) {
      return notificationsDates
    }

    const lastDay = sub(expiryDateWithGracePeriod, {
      days: 1
    })

    return notificationsDates.concat(lastDay)
  }

  return getNotificationsDates({
    expiryDate,
    startDate: notificationDate,
    cooldown,
    notificationsDates: notificationsDates.concat(notificationDate)
  })
}

type GetCheckpointConfigDatesProps = GetCheckpointConfigProps & {
  expiryDate: Date
}

export const getCheckpointNotificationsDates = ({
  council,
  checkedField,
  expiryDate
}: GetCheckpointConfigDatesProps) => {
  const { timeBeforeNotificationsStart, notificationCooldown } =
    getCheckpointConfig({ council, checkedField })

  const notificationsStartDate = sub(expiryDate, timeBeforeNotificationsStart)
  const notificationsDates = getNotificationsDates({
    expiryDate,
    startDate: notificationsStartDate,
    cooldown: notificationCooldown
  })

  return {
    notificationsStartDate,
    notificationsDates
  }
}
