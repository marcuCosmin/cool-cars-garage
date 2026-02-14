import { type Duration } from "date-fns"

export type CheckpointConfig = {
  interval?: Duration | "manual"
  timeBeforeNotificationsStart: Duration
  notificationCooldown: Duration
}
