import { generate as generatePassword } from "generate-password"

import {
  createNewSecretVersion,
  getSecretValue
} from "@/backend/utils/get-secret-value"
import { getDVLAJWT } from "@/backend/utils/get-dvla-jwt"

type UpdateDVLAError = {
  detail: string
  title: string
  status: number
}[]

export const updateDVLAPassword = async () => {
  console.log("Updating DVLA API password...")
  const password = await getSecretValue("DVLA_API_PASSWORD")
  const newPassword = generatePassword({
    length: 64,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true
  })

  const response = await fetch(
    "https://driver-vehicle-licensing.api.gov.uk/thirdparty-access/v1/password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userName: process.env.DVLA_API_USERNAME,
        password,
        newPassword
      })
    }
  )

  if (!response.ok) {
    const errorData = (await response.json()) as UpdateDVLAError
    const details = errorData
      .map(error => `${error.title}: ${error.detail}`)
      .join("; ")

    throw new Error(`DVLA password update failed: ${details}`)
  }

  await createNewSecretVersion({
    secretKey: "DVLA_API_PASSWORD",
    secretValue: newPassword
  })

  console.log("DVLA API password updated successfully")
}

export const updateDVLAApiKey = async () => {
  console.log("Updating DVLA API key...")

  const apiKey = await getSecretValue("DVLA_API_KEY")
  const jwt = await getDVLAJWT()

  const response = await fetch(
    "https://driver-vehicle-licensing.api.gov.uk/thirdparty-access/v1/new-api-key",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": jwt,
        "x-api-key": apiKey
      },

      body: null
    }
  )

  const data = await response.json()

  await createNewSecretVersion({
    secretKey: "DVLA_API_KEY",
    secretValue: data.newApiKey
  })

  console.log("DVLA API key updated successfully")
}
