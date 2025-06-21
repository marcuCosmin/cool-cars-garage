import { formatDistance } from "date-fns"
import { Car } from "../models"

export const getExpirationIndicator = (timestamp: number) => {
  const now = Date.now()

  return formatDistance(timestamp, now, {
    addSuffix: true
  })
}

const plateNumberExpireDateConfig = {
  Cornwall: {
    notificationStart: 30,
    notificationCooldown: 7
  },
  Wolverhampton: {
    notificationStart: 35,
    notificationCooldown: 1
  },
  Portsmouth: {
    notificationStart: 20,
    notificationCooldown: 7
  }
}

const getCarDueDatesConfig = (council: Car["council"]) =>
  ({
    mot: {
      deadline: 364,
      notificationStart: 30,
      notificationCooldown: 7
    },
    roadtTax: {
      deadline: 364,
      notificationStart: 7,
      notificationCooldown: 1
    },
    insurance: {
      deadline: "manual",
      notificationStart: 30,
      notificationCooldown: 7
    },
    safetyChecks: {
      deadline: 70,
      notificationStart: 7,
      notificationCooldown: 1
    },
    tachograph: {
      deadline: 730,
      notificationStart: 30,
      notificationCooldown: 7
    },
    wheelChairLiftCheck: {
      deadline: 30 * 6,
      notificationStart: 7 * 3,
      notificationCooldown: 7
    },
    expireDate: {
      deadline: "manual",
      ...plateNumberExpireDateConfig[
        council as keyof typeof plateNumberExpireDateConfig
      ]
    },
    cornwallMot: {
      deadline: 30 * 6,
      notificationStart: 7 * 3,
      notificationCooldown: 7
    }
  }) as const

export type DueDatesKeys = keyof ReturnType<typeof getCarDueDatesConfig>

type GetDueDateConfigProps = {
  council: Car["council"]
  dateKey: DueDatesKeys
}

export const getDueDateConfig = ({
  council,
  dateKey
}: GetDueDateConfigProps) => {
  const config = getCarDueDatesConfig(council)

  return config[dateKey]
}
