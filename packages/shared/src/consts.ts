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

export const checkpointsConfig = {
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
