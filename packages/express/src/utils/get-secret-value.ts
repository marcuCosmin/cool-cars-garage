import { SecretManagerServiceClient } from "@google-cloud/secret-manager"

const secretmanagerClient = new SecretManagerServiceClient()

type SecretKey = "DVLA_API_USERNAME" | "DVLA_API_KEY" | "DVLA_API_PASSWORD"

export const getSecretValue = async (secretKey: SecretKey) => {
  const [version] = await secretmanagerClient.accessSecretVersion({
    name: `projects/cool-cars-garage-114b6/secrets/${secretKey}/versions/latest`
  })

  const secret = version.payload?.data?.toString()

  if (!secret) {
    throw new Error(`Failed to retrieve secret value for ${secretKey}`)
  }

  return secret
}
