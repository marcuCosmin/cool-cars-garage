import { type Duration } from "date-fns"

import type { CarChecks, CarCheckField } from "./models"

type CheckpointConfig = {
  interval: Duration | "manual"
  timeBeforeNotificationsStart: Duration
  notificationCooldown: Duration
}

type CheckpointsCommonConfigKey = keyof Pick<
  CarChecks,
  "mot" | "roadTax" | "insurance"
>

type CheckpointsCommongConfig = Record<
  CheckpointsCommonConfigKey,
  CheckpointConfig
>

const checkpointsCommonConfig: CheckpointsCommongConfig = {
  mot: {
    interval: {
      days: 364
    },
    timeBeforeNotificationsStart: {
      days: 30
    },
    notificationCooldown: {
      weeks: 1
    }
  },
  roadTax: {
    interval: {
      days: 364
    },
    timeBeforeNotificationsStart: {
      weeks: 1
    },
    notificationCooldown: {
      days: 1
    }
  },
  insurance: {
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
  CheckpointsCommongConfig & Partial<Record<CarCheckField, CheckpointConfig>>
> = {
  Cornwall: {
    ...checkpointsCommonConfig,
    cornwallMot: {
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
    plateNumberExpiryDate: {
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
    plateNumberExpiryDate: {
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
    plateNumberExpiryDate: {
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
    safetyChecks: {
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
    tachograph: {
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
    wheelChairLiftCheck: {
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

export const checkpointsNotificationsGracePeriod = {
  weeks: 1
}
