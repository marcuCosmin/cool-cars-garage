import { getFirestoreDoc, getFirestoreDocs } from "@/backend/firebase/utils"

import { getTimestampDayTimeRange } from "@/globals/utils/getDateTimeRange"

import type {
  CarDoc,
  CheckAnswer,
  CheckDoc,
  DocWithID,
  ReportsQuestion,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

import type { ReqBody } from "./model"

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

const getFaultDetailsError = (details?: string) => {
  const trimmed = details?.trim()

  if (!trimmed) {
    return "Each fault must include a details field"
  }

  if (trimmed.length < 10) {
    return "Fault details must be at least 10 characters long"
  }

  if (trimmed.length > 1000) {
    return "Fault details must be at most 1000 characters long"
  }
}

const TEN_MINUTES_MS = 10 * 60 * 1000

const getTimestampsError = (startTimestamp?: number, endTimestamp?: number) => {
  const startDate =
    startTimestamp !== undefined ? new Date(startTimestamp) : null
  const endDate = endTimestamp !== undefined ? new Date(endTimestamp) : null

  if (!startDate || isNaN(startDate.getTime())) {
    return "Invalid start timestamp"
  }

  if (!endDate || isNaN(endDate.getTime())) {
    return "Invalid end timestamp"
  }

  const { startTimestamp: dayStart, endTimestamp: dayEnd } =
    getTimestampDayTimeRange()

  if (startDate.getTime() < dayStart || startDate.getTime() > dayEnd) {
    return "Start timestamp must be within today's range"
  }

  if (endDate.getTime() < dayStart || endDate.getTime() > dayEnd) {
    return "End timestamp must be within today's range"
  }

  if (endDate.getTime() <= startDate.getTime()) {
    return "End timestamp must be after start timestamp"
  }

  if (endDate.getTime() - startDate.getTime() < TEN_MINUTES_MS) {
    return "Start and end timestamps must be at least 10 minutes apart"
  }
}

const getAnswersShallowValidationError = (answers?: CheckAnswer[]) => {
  if (!answers) {
    return "Answers are required"
  }

  if (!Array.isArray(answers)) {
    return "Invalid answers format"
  }

  for (const answer of answers) {
    if (answer.value === false) {
      const detailsError = getFaultDetailsError(answer.details)

      if (detailsError) {
        return `"${answer.label}": ${detailsError}`
      }
    }
  }
}

type GetReqBodyShallowValidationErrorProps = ReqBody & {
  driverId: string
}

export const getReqBodyShallowValidationError = ({
  carId,
  odoReading,
  answers,
  driverId,
  startTimestamp,
  endTimestamp
}: GetReqBodyShallowValidationErrorProps) => {
  if (!carId) {
    return "Car registration number is required"
  }

  if (!driverId) {
    return "Driver ID is required"
  }

  const timestampsError = getTimestampsError(startTimestamp, endTimestamp)

  if (timestampsError) {
    return timestampsError
  }

  const odoReadingError = getOdoReadingError(odoReading)

  if (odoReadingError) {
    return odoReadingError
  }

  const answersError = getAnswersShallowValidationError(answers)

  if (answersError) {
    return answersError
  }
}

type GetInvalidAnswersSectionProps = {
  questions: ReportsQuestion[]
  answers: CheckAnswer[]
}

const getInvalidAnswersSection = ({
  questions,
  answers
}: GetInvalidAnswersSectionProps) => {
  const questionsBySection = Object.groupBy(
    questions,
    question => question.section
  )
  const answersBySection = Object.groupBy(answers, answer => answer.section)

  const sections = Object.keys(questionsBySection) as ReportsQuestionsSection[]

  return sections.find(section => {
    const sectionQuestions = questionsBySection[section] ?? []
    const sectionAnswers = answersBySection[section] ?? []

    if (sectionQuestions.length !== sectionAnswers.length) {
      return true
    }

    return sectionQuestions.some((question, index) => {
      const answer = sectionAnswers[index]

      return (
        typeof answer.value !== "boolean" || question.label !== answer.label
      )
    })
  })
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

type GetReqBodyValidationErrorProps = Omit<
  Required<GetReqBodyShallowValidationErrorProps>,
  "carId"
> & {
  car: DocWithID<CarDoc> | null
}

export const getDeepReqBodyValidationError = async ({
  car,
  answers,
  driverId
}: GetReqBodyValidationErrorProps) => {
  if (!car) {
    return "Invalid car registration number"
  }

  const questionsConfigDoc = getQuestionsConfigDoc(car)

  const questionsConfig = await getFirestoreDoc({
    collection: "reports-config",
    docId: questionsConfigDoc
  })

  if (!questionsConfig) {
    return "Questions config not found"
  }

  const invalidSection = getInvalidAnswersSection({
    questions: questionsConfig.questions,
    answers
  })

  if (invalidSection) {
    return `Invalid answers for ${invalidSection} section`
  }

  const { startTimestamp, endTimestamp } = getTimestampDayTimeRange()

  const [existingCheck] = await getFirestoreDocs({
    collection: "checks",
    queries: [
      ["carId", "==", car.id],
      ["driverId", "==", driverId],
      ["creationTimestamp", ">=", startTimestamp],
      ["creationTimestamp", "<=", endTimestamp]
    ]
  })

  if (existingCheck) {
    return "You have already submitted a check for this car today"
  }
}
