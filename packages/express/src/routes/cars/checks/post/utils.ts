import { getFirestoreDoc, getFirestoreDocs } from "@/firebase/utils"

import { getTimestampDayTimeRange } from "@/shared/utils/getDateTimeRange"

import type {
  CarDoc,
  CheckAnswer,
  CheckDoc,
  ReportsQuestion,
  ReportsQuestionsConfig
} from "@/shared/firestore/firestore.model"

import type { ReqBody } from "./model"

type GetOdoReadingErrorProps = Partial<Pick<CheckDoc, "odoReading">> & {
  carId: string
}

const getOdoReadingError = async ({
  odoReading,
  carId
}: GetOdoReadingErrorProps) => {
  if (!odoReading) {
    return "Invalid ODO reading"
  }

  const odoReadingUnits = ["miles", "km"]

  if (!odoReadingUnits.includes(odoReading.unit)) {
    return "Invalid ODO reading"
  }

  const value = Number(odoReading.value)

  if (value < 0) {
    return "Invalid ODO reading"
  }

  const [lastCheck] = await getFirestoreDocs<CheckDoc>({
    collection: "checks",
    queries: [["carId", "==", carId]],
    orderBy: { field: "creationTimestamp", direction: "desc" },
    limit: 1
  })

  if (!lastCheck) {
    return
  }

  if (value <= Number(lastCheck.odoReading.value)) {
    return "The ODO reading must be greater than the last recorded reading"
  }
}

const isAnswersSectionValid = (
  sectionQuestions: ReportsQuestion[],
  answers?: CheckAnswer[]
) => {
  if (!answers) {
    return false
  }

  if (sectionQuestions.length !== answers.length) {
    return false
  }

  for (const index in sectionQuestions) {
    const answer = answers[index]

    if (typeof answer.value !== "boolean") {
      return false
    }

    if (sectionQuestions[index].label !== answer.label) {
      return false
    }
  }

  return true
}

type GetReqBodyValidationErrorProps = ReqBody & {
  driverId: string
}

export const getReqBodyValidationError = async ({
  carId,
  interior,
  exterior,
  odoReading,
  driverId
}: GetReqBodyValidationErrorProps) => {
  if (!carId) {
    return "Invalid car registration number"
  }

  const car = await getFirestoreDoc<CarDoc>({
    collection: "cars",
    docId: carId
  })

  if (!car) {
    return "Invalid car registration number"
  }

  const odoReadingError = await getOdoReadingError({ odoReading, carId })

  if (odoReadingError) {
    return odoReadingError
  }

  const questionsConfigDoc =
    car.council === "PSV" ? "psv-questions" : "taxi-questions"

  const questionsConfig = await getFirestoreDoc<ReportsQuestionsConfig>({
    collection: "reports-config",
    docId: questionsConfigDoc
  })

  if (!questionsConfig) {
    throw new Error("Questions config not found")
  }

  if (!isAnswersSectionValid(questionsConfig.interior, interior)) {
    return "Invalid answers for interior section"
  }

  if (!isAnswersSectionValid(questionsConfig.exterior, exterior)) {
    return "Invalid answers for exterior section"
  }

  const { startTimestamp, endTimestamp } = getTimestampDayTimeRange()

  const [existingCheck] = await getFirestoreDocs<CheckDoc>({
    collection: "checks",
    queries: [
      ["carId", "==", carId],
      ["driverId", "==", driverId],
      ["creationTimestamp", ">=", startTimestamp],
      ["creationTimestamp", "<=", endTimestamp]
    ]
  })

  if (existingCheck) {
    return "You have already submitted a check for this car today"
  }
}
