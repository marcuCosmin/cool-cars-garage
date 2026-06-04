import { getSecretValue } from "@/backend/utils/get-secret-value"

import {
  getVelocityFuelData,
  getCurrentIsoWeek
} from "./velocityFuelChecks.utils"

import type { JobScript } from "@/models"

const run = async () => {
  const accessToken = await getSecretValue("VELOCITY_FUEL_ACCESS_TOKEN")

  const isoWeek = getCurrentIsoWeek()

  const velocityFuelData = await getVelocityFuelData({
    accessToken,
    isoWeek
  })

  if (!velocityFuelData) {
    return
  }
}

export const velocityFuelChecksJob: JobScript = {
  id: "velocity-fuel-checks",
  run
}
