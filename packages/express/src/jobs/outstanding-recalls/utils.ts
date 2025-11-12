import type { MOTHistoryAPIResponse } from "./model"

type MOTHistoryAccessTokenAPIResponse = {
  access_token: string
}

export const getMOTHistoryApiAccessToken = async () => {
  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")
  params.append("client_id", process.env.MOT_HISTORY_API_CLIENT_ID as string)
  params.append(
    "client_secret",
    process.env.MOT_HISTORY_API_CLIENT_SECRET as string
  )
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

  const data = (await response.json()) as MOTHistoryAccessTokenAPIResponse

  return data.access_token
}

type GetCarOutstandingRecallStatusProps = {
  carId: string
  accessToken: string
}

export const getCarOutstandingRecallStatus = async ({
  carId,
  accessToken
}: GetCarOutstandingRecallStatusProps) => {
  const response = await fetch(
    `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${carId}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-API-Key": process.env.MOT_HISTORY_API_KEY as string
      }
    }
  )

  const data = (await response.json()) as MOTHistoryAPIResponse

  return data.hasOutstandingRecall
}
