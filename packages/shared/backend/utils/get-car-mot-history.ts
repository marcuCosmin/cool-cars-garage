import { parseDateToTimestamp } from "./parse-string-to-timestamp"

const getLastMotTest = (
  motTests: NonNullable<MOTHistoryAPIResponse["motTests"]>
) => {
  const sortedMotTests = motTests.sort(
    (a, b) =>
      parseDateToTimestamp(b.expiryDate) - parseDateToTimestamp(a.expiryDate)
  )

  const [lastMotTest] = sortedMotTests

  return lastMotTest
}

const getMotExpiryTimestamp = ({
  motTests,
  motTestDueDate,
  expiryDate
}: MOTHistoryAPIResponse) => {
  if (motTests) {
    const lastMotTest = getLastMotTest(motTests)

    return parseDateToTimestamp(lastMotTest.expiryDate)
  }

  const expiryString = (expiryDate || motTestDueDate) as string

  return parseDateToTimestamp(expiryString)
}

const getMotStatus = ({ motTests, testResult }: MOTHistoryAPIResponse) => {
  if (motTests) {
    const lastMotTest = getLastMotTest(motTests)

    return lastMotTest.testResult
  }

  return testResult
}

type MOTHistoryAPIResponse = {
  hasOutstandingRecall: "Yes" | "No" | "Unknown" | "Unavailable"
  motTestDueDate?: string
  testResult?: "PASSED" | "FAILED"
  expiryDate?: string
  motTests?: {
    expiryDate: string
    testResult: "PASSED" | "FAILED"
  }[]
}

type GetCarOutstandingRecallStatusProps = {
  carId: string
  accessToken: string
}

type GetCarMotHistoryResult = {
  motExpiryTimestamp: number
  outstandingRecallStatus: "Yes" | "No" | "Unknown" | "Unavailable"
  motStatus?: "PASSED" | "FAILED"
}

export const getCarMotHistory = async ({
  carId,
  accessToken
}: GetCarOutstandingRecallStatusProps) => {
  try {
    const response = await fetch(
      `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${carId}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "X-API-Key": process.env.MOT_HISTORY_API_KEY as string
        }
      }
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch MOT history for ${carId}: ${response.statusText}`
      )
    }

    const data = (await response.json()) as MOTHistoryAPIResponse

    const { hasOutstandingRecall } = data

    const result: GetCarMotHistoryResult = {
      motExpiryTimestamp: getMotExpiryTimestamp(data),
      outstandingRecallStatus: hasOutstandingRecall
    }

    const motStatus = getMotStatus(data)

    if (motStatus) {
      result.motStatus = motStatus
    }

    return result
  } catch (error) {
    console.error(`Error fetching MOT history for ${carId}:`, error)
  }
}
