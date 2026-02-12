import type { JobScript } from "@/models"

import { updateDVLAApiKey, updateDVLAPassword } from "./utils"

const run = async () => {
  try {
    await updateDVLAPassword()
    await updateDVLAApiKey()
  } catch (error) {
    console.error("Error updating DVLA credentials:", error)
  }
}

export const updateDVLACredentialsJob: JobScript = {
  id: "update-dvla-credentials",
  run
}
