import { getSecretValue } from "@/backend/utils/get-secret-value"

import { getVelocityFuelData } from "./velocityFuelChecks.utils"

import type { JobScript } from "@/models"

const run = async () => {
  const accessToken = await getSecretValue("VELOCITY_FUEL_ACCESS_TOKEN")

  const velocityFuelData = await getVelocityFuelData(accessToken)

  if (!velocityFuelData) {
    return
  }
}

export const velocityFuelChecksJob: JobScript = {
  id: "velocity-fuel-checks",
  run
}
