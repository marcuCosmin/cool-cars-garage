import { getSecretValue } from "./get-secret-value"

type DVLAAuthenticateResponse = {
  "id-token": string
}

type DVLAAuthenticateErrorResponse = {
  status: number
  title: string
  detail?: string
}[]

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

  if (!response.ok) {
    const errorData = await response.json() as DVLAAuthenticateErrorResponse

    const errorMessage = errorData
      .map(({ title, detail }) => (detail ? `${title}: ${detail}` : title))
      .join(", ")

    throw new Error(`Failed to get the DVLA JWT, ${errorMessage}`)
  }

  const data = await response.json() as DVLAAuthenticateResponse
  const idToken = data["id-token"]

  if (!idToken) {
    throw new Error("DVLA JWT not found in response")
  }

  return idToken
}
