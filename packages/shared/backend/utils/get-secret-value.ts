import { SecretManagerServiceClient } from "@google-cloud/secret-manager"

const secretmanagerClient = new SecretManagerServiceClient()

type SecretKey =
  | "DVLA_API_USERNAME"
  | "DVLA_API_KEY"
  | "DVLA_API_PASSWORD"
  | "MOT_HISTORY_API_CLIENT_SECRET"

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

type CreateNewSecretVersionProps = {
  secretKey: SecretKey
  secretValue: string
}

export const createNewSecretVersion = async ({
  secretKey,
  secretValue
}: CreateNewSecretVersionProps) => {
  await secretmanagerClient.addSecretVersion({
    parent: `projects/cool-cars-garage-114b6/secrets/${secretKey}`,
    payload: {
      data: Buffer.from(secretValue, "utf8")
    }
  })
}
