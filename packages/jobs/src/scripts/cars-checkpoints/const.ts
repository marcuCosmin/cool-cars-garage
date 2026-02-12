import { type Duration } from "date-fns"

import type { CarCheckpoints } from "@/globals/firestore/firestore.model"

type CheckpointConfig = {
  interval?: Duration | "manual"
  timeBeforeNotificationsStart: Duration
  notificationCooldown: Duration
}

type CheckpointsCommonConfigKey = keyof Pick<
  CarCheckpoints,
  "motExpiryTimestamp" | "roadTaxExpiryTimestamp" | "insuranceExpiryTimestamp"
>

type CheckpointsCommongConfig = Record<
  CheckpointsCommonConfigKey,
  CheckpointConfig
>

const checkpointsCommonConfig: CheckpointsCommongConfig = {
  motExpiryTimestamp: {
    timeBeforeNotificationsStart: {
      days: 30
    },
    notificationCooldown: {
      weeks: 1
    }
  },
  roadTaxExpiryTimestamp: {
    timeBeforeNotificationsStart: {
      weeks: 1
    },
    notificationCooldown: {
      days: 1
    }
  },
  insuranceExpiryTimestamp: {
    interval: "manual",
    timeBeforeNotificationsStart: {
      days: 30
    },
    notificationCooldown: {
      weeks: 1
    }
  }
}

export const checkpointsConfig: Record<
  string,
  CheckpointsCommongConfig &
    Partial<Record<keyof CarCheckpoints, CheckpointConfig>>
> = {
  Cornwall: {
    ...checkpointsCommonConfig,
    cornwallMotExpiryTimestamp: {
      interval: {
        months: 6
      },
      timeBeforeNotificationsStart: {
        weeks: 3
      },
      notificationCooldown: {
        weeks: 1
      }
    },
    plateNumberExpiryTimestamp: {
      interval: "manual",
      timeBeforeNotificationsStart: {
        days: 30
      },
      notificationCooldown: {
        weeks: 1
      }
    }
  },
  Wolverhampton: {
    ...checkpointsCommonConfig,
    plateNumberExpiryTimestamp: {
      interval: "manual",
      timeBeforeNotificationsStart: {
        days: 35
      },
      notificationCooldown: {
        days: 1
      }
    }
  },
  Portsmouth: {
    ...checkpointsCommonConfig,
    plateNumberExpiryTimestamp: {
      interval: "manual",
      timeBeforeNotificationsStart: {
        days: 20
      },
      notificationCooldown: {
        weeks: 1
      }
    }
  },
  PSV: {
    ...checkpointsCommonConfig,
    safetyChecksExpiryTimestamp: {
      interval: {
        weeks: 10
      },
      timeBeforeNotificationsStart: {
        weeks: 1
      },
      notificationCooldown: {
        days: 1
      }
    },
    tachographExpiryTimestamp: {
      interval: {
        years: 2
      },
      timeBeforeNotificationsStart: {
        days: 30
      },
      notificationCooldown: {
        weeks: 1
      }
    },
    wheelChairLiftExpiryTimestamp: {
      interval: {
        months: 6
      },
      timeBeforeNotificationsStart: {
        weeks: 3
      },
      notificationCooldown: {
        weeks: 1
      }
    }
  },
  Other: {
    ...checkpointsCommonConfig
  }
}

export const checkpointsNotificationsLabels: Record<
  keyof CarCheckpoints,
  string
> = {
  motExpiryTimestamp: "MOT",
  roadTaxExpiryTimestamp: "Road Tax",
  insuranceExpiryTimestamp: "Insurance",
  cornwallMotExpiryTimestamp: "Cornwall MOT",
  plateNumberExpiryTimestamp: "Plate Number",
  safetyChecksExpiryTimestamp: "Safety Checks",
  tachographExpiryTimestamp: "Tachograph",
  wheelChairLiftExpiryTimestamp: "Wheel Chair Lift"
}
