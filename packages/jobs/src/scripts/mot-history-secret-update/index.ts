import { createNewSecretVersion } from "@/backend/utils/get-secret-value"

import type { JobScript } from "@/models"

import { updateMotHistoryApiClientSecret } from "./utils"

const run = async () => {
  try {
    const newClientSecret = await updateMotHistoryApiClientSecret()

    await createNewSecretVersion({
      secretKey: "MOT_HISTORY_API_CLIENT_SECRET",
      secretValue: newClientSecret
    })
  } catch (error) {
    console.error("Error updating MOT history secret:", error)
  }
}

export const motHistorySecretUpdateJob: JobScript = {
  id: "mot-history-secret-update",
  run
}
