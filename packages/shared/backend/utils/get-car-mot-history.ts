import { parseDateToTimestamp } from "./parse-string-to-timestamp"

const getLastMotTest = (motTests: MOTHistoryAPIResponse["motTests"]) => {
  if (!motTests) {
    return
  }

  const sortedMotTests = motTests.sort(
    (a, b) =>
      parseDateToTimestamp(b.expiryDate) - parseDateToTimestamp(a.expiryDate)
  )

  const [lastMotTest] = sortedMotTests

  return lastMotTest
}

type MotTest = {
  completedDate: string
  expiryDate: string
  testResult: "PASSED" | "FAILED"
}

type MOTHistoryAPIResponse = {
  hasOutstandingRecall: "Yes" | "No" | "Unknown" | "Unavailable"
  motTestDueDate?: string
  testResult?: "PASSED" | "FAILED"
  expiryDate?: string
  motTests?: MotTest[]
}

type GetCarMotHistoryProps = {
  carId: string
  accessToken: string
}
type GetCarMotHistoryResult = {
  motExpiryTimestamp: number
  motCompletedTimestamp?: number
  outstandingRecallStatus: "Yes" | "No" | "Unknown" | "Unavailable"
  motStatus?: "PASSED" | "FAILED"
}

export const getCarMotHistory = async ({
  carId,
  accessToken
}: GetCarMotHistoryProps) => {
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

    const {
      hasOutstandingRecall,
      motTestDueDate,
      motTests,
      expiryDate,
      testResult
    } = (await response.json()) as MOTHistoryAPIResponse

    const lastMotTest = getLastMotTest(motTests)
    const motExpiryDate = (lastMotTest?.expiryDate ||
      expiryDate ||
      motTestDueDate) as string

    const result: GetCarMotHistoryResult = {
      motExpiryTimestamp: parseDateToTimestamp(motExpiryDate),
      outstandingRecallStatus: hasOutstandingRecall
    }

    if (testResult) {
      result.motStatus = testResult
    }

    if (lastMotTest?.completedDate) {
      result.motCompletedTimestamp = parseDateToTimestamp(
        lastMotTest.completedDate
      )
    }

    return result
  } catch (error) {
    console.error(`Error fetching MOT history for ${carId}:`, error)
  }
}
