import { getSecretValue } from "@/utils/get-secret-value"

export const getDVLAJWT = async () => {
  const dvlaApiPassword = await getSecretValue("DVLA_API_PASSWORD")

  const response = await fetch(
    "https://uat.driver-vehicle-licensing.api.gov.uk/thirdparty-access/v1/authenticate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        userName: process.env.DVLA_API_USERNAME,
        password: dvlaApiPassword
      })
    }
  )

  if (!response.ok) {
    throw new Error("Failed to get the DVLA JWT")
  }

  const data = await response.json()

  const idToken = data["id-token"] as string | undefined

  if (!idToken) {
    throw new Error("DVLA JWT not found in response")
  }

  return idToken
}
