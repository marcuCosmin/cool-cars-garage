import { type Request, type Response } from "express"

import { DateTime } from "luxon"

import { Timestamp } from "firebase-admin/firestore"
import { firestore } from "../../../firebase/config"

import type { Car } from "@/shared/models"

const checkpointsCommonConfig = {
  mot: {
    interval: "364d",
    timeBeforeNotificationsStart: "30d",
    notificationCooldown: "1w"
  },
  roadTax: {
    interval: "364d",
    timeBeforeNotificationsStart: "7d",
    notificationCooldown: "1d"
  },
  insurance: {
    interval: "manual",
    timeBeforeNotificationsStart: "30d",
    notificationCooldown: "1w"
  }
}

const checkpointsConfig = {
  Cornwall: {
    ...checkpointsCommonConfig,
    cornwallMot: {
      interval: "6m",
      timeBeforeNotificationsStart: "3w",
      notificationCooldown: "7w"
    },
    expireDate: {
      interval: "manual",
      timeBeforeNotificationsStart: "30d",
      notificationCooldown: "1w"
    }
  },
  Wolverhampton: {
    ...checkpointsCommonConfig,
    expireDate: {
      interval: "manual",
      timeBeforeNotificationsStart: "35d",
      notificationCooldown: "1d"
    }
  },
  Portsmouth: {
    ...checkpointsCommonConfig,
    expireDate: {
      interval: "manual",
      timeBeforeNotificationsStart: "20d",
      notificationCooldown: "1w"
    }
  },
  PSV: {
    ...checkpointsCommonConfig,
    safetyChecks: {
      interval: "10w",
      timeBeforeNotificationsStart: "1w",
      notificationCooldown: "1d"
    },
    tachograph: {
      interval: "2y",
      timeBeforeNotificationsStart: "30d",
      notificationCooldown: "1w"
    },
    wheelChairLiftCheck: {
      interval: "6m",
      timeBeforeNotificationsStart: "3w",
      notificationCooldown: "1w"
    }
  },
  Other: {
    ...checkpointsCommonConfig
  }
}

const getNewDueDate = (timestamp: Timestamp, interval: string): Timestamp => {
  const match = interval.match(/^(\d+)([dwmy])$/)

  if (!match) {
    throw new Error("Invalid time format")
  }

  const [_, num, unit] = match
  const durationMap = {
    d: "days",
    w: "weeks",
    m: "months",
    y: "years"
  } as const

  const durationKey = durationMap[unit as keyof typeof durationMap]
  const newTimestampSeconds = DateTime.fromSeconds(timestamp.seconds)
    .plus({ [durationKey]: Number(num) })
    .toSeconds()

  return new Timestamp(newTimestampSeconds, 0)
}

type ReqBody = {
  carId: string
  checkpoint: string
}

export const updateCheckPointDate = async (
  req: Request<undefined, undefined, ReqBody>,
  res: Response
) => {
  try {
    const { carId, checkpoint } = req.body

    const carRef = firestore.collection("cars").doc(carId)
    const carDoc = await carRef.get()

    if (!carDoc.exists) {
      res.status(400).json({
        error: "The provided car ID is invalid"
      })

      return
    }

    const car = carDoc.data() as Car

    const { council } = car as Car

    const councilConfig =
      checkpointsConfig[council as keyof typeof checkpointsConfig]

    if (!councilConfig) {
      res.status(400).json({
        error: "The provided car ID is not associated with a valid council"
      })

      return
    }

    const checkpointConfig =
      councilConfig[checkpoint as keyof typeof councilConfig]

    if (!checkpointConfig) {
      res.status(400).json({
        error: "The provided checkpoint is not valid for the specified council"
      })

      return
    }

    const { interval } = checkpointConfig
    const checkpointDate = car?.[checkpoint as keyof Car]

    if (!checkpointDate) {
      res.status(400).json({
        error: `The car does not have a date set for the checkpoint: ${checkpoint}`
      })

      return
    }

    const newDueDate = getNewDueDate(checkpointDate, interval)

    await carRef.update({
      [checkpoint]: newDueDate
    })

    res.status(200).json({
      message: `Checkpoint ${checkpoint} update successfully for car with id: ${carId}`
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
