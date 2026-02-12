import { getSecretValue } from "./get-secret-value"

type MOTHistoryAccessTokenAPIResponse = {
  access_token: string
}

export const getMOTHistoryApiAccessToken = async () => {
  const clientSecret = await getSecretValue("MOT_HISTORY_API_CLIENT_SECRET")

  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")
  params.append("client_id", process.env.MOT_HISTORY_API_CLIENT_ID as string)
  params.append("client_secret", clientSecret)
  params.append("scope", process.env.MOT_HISTORY_API_SCOPE as string)

  const response = await fetch(
    process.env.MOT_HISTORY_API_ACCESS_TOKEN_URL as string,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = (await response.json()) as MOTHistoryAccessTokenAPIResponse

  return data.access_token
}
