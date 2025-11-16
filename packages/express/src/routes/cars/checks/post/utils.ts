import { getFirestoreDoc, getFirestoreDocs } from "@/firebase/utils"

import { getTimestampDayTimeRange } from "@/shared/utils/getDateTimeRange"

import type {
  CarDoc,
  CheckAnswer,
  CheckDoc,
  DocWithID,
  ReportsQuestion
} from "@/shared/firestore/firestore.model"

import type { ReqBody } from "./model"

type GetAnswersWithFaultsProps = {
  interior: CheckAnswer[]
  exterior: CheckAnswer[]
}

export const getAnswersWithFaults = ({
  interior,
  exterior
}: GetAnswersWithFaultsProps) => {
  const combinedSections = [...interior, ...exterior]
  const answersWithFaults = combinedSections.filter(
    answer => answer.value === false
  )

  return answersWithFaults
}

const getOdoReadingError = (odoReading?: CheckDoc["odoReading"]) => {
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

const getQuestionsConfigDoc = ({ isRental, council }: DocWithID<CarDoc>) => {
  if (isRental) {
    return "rental-questions"
  }

  if (council === "PSV") {
    return "psv-questions"
  }

  return "non-psv-questions"
}

type GetReqBodyValidationErrorProps = ReqBody & {
  driverId: string
}

export const getReqBodyValidationError = async ({
  carId,
  interior,
  exterior,
  odoReading,
  driverId,
  faultsDetails
}: GetReqBodyValidationErrorProps) => {
  if (!carId) {
    return "Invalid car registration number"
  }

  const odoReadingError = getOdoReadingError(odoReading)

  if (odoReadingError) {
    return odoReadingError
  }

  const car = await getFirestoreDoc({
    collection: "cars",
    docId: carId
  })

  if (!car) {
    return "Invalid car registration number"
  }

  const questionsConfigDoc = getQuestionsConfigDoc(car)

  const questionsConfig = await getFirestoreDoc({
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

  const answersWithFaults = getAnswersWithFaults({
    interior: interior!,
    exterior: exterior!
  })

  const checkHasFaults = answersWithFaults.length > 0

  if (checkHasFaults) {
    const trimmedFaultsDetails = faultsDetails?.trim()

    if (!trimmedFaultsDetails) {
      return "The faults details field is required when reporting faults"
    }

    if (trimmedFaultsDetails.length < 20) {
      return "The faults details field must be at least 20 characters long"
    }

    if (trimmedFaultsDetails.length > 1000) {
      return "The faults details field must be at most 1000 characters long"
    }
  }

  const { startTimestamp, endTimestamp } = getTimestampDayTimeRange()

  const [existingCheck] = await getFirestoreDocs({
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
