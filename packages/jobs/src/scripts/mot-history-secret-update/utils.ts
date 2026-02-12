type UpdateMotHistoryApiClientSecretProps = {
  clientSecret: string
}

export const updateMotHistoryApiClientSecret = async () => {
  const respone = await fetch(
    "https://history.mot.api.gov.uk/v1/trade/credentials",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "",
        awsApiKeyValue: process.env.MOT_HISTORY_API_KEY as string
      })
    }
  )

  if (!respone.ok) {
    throw new Error(
      `Failed to update MOT history secret: ${respone.statusText}`
    )
  }

  const data = (await respone.json()) as UpdateMotHistoryApiClientSecretProps

  const { clientSecret } = data

  return clientSecret
}
