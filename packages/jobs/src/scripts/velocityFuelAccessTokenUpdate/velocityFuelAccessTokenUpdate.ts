import { createNewSecretVersion } from "@/backend/utils/get-secret-value"

import { getVelocityFuelAccessToken } from "./velocityFuelAccessTokenUpdate.utils"

import type { JobScript } from "@/models"

const run = async () => {
  const accessToken = await getVelocityFuelAccessToken()

  if (!accessToken) {
    return
  }

  await createNewSecretVersion({
    secretKey: "VELOCITY_FUEL_ACCESS_TOKEN",
    secretValue: accessToken
  })
}

export const velocityFuelAccessTokenUpdateJob: JobScript = {
  id: "velocity-fuel-access-token-update",
  run
}
