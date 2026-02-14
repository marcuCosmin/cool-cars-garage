import { getSecretValue } from "./get-secret-value"

export const getDVLAJWT = async () => {
  const dvlaApiPassword = await getSecretValue("DVLA_API_PASSWORD")

  const response = await fetch(
    `${process.env.DVLA_API_URL}/thirdparty-access/v1/authenticate`,
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

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`Failed to get the DVLA JWT, ${JSON.stringify(data)}`)
  }

  const idToken = data["id-token"] as string | undefined

  if (!idToken) {
    throw new Error("DVLA JWT not found in response")
  }

  return idToken
}
