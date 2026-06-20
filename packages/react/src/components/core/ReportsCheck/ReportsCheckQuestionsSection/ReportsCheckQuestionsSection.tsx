import { capitalize } from "@/globals/utils/capitalize"

import type {
  CheckAnswer,
  DocWithID,
  FaultDoc,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

import { ReportsCheckQuestionCard } from "./ReportsCheckQuestionCard"

type ReportsCheckQuestionsSectionProps = {
  section: ReportsQuestionsSection
  answers: CheckAnswer[]
  faults: DocWithID<FaultDoc>[]
  checkId: string
}

export const ReportsCheckQuestionsSection = ({
  section,
  answers,
  faults,
  checkId
}: ReportsCheckQuestionsSectionProps) => (
  <div className="flex flex-col gap-3 max-w-3xl">
    <h4 className="text-primary pl-2 font-bold md:text-xl md:pl-0">
      {capitalize(section)}
    </h4>

    <ul className="flex flex-col gap-3">
      {answers.map((answer, index) => {
        const fault = faults.find(({ question }) => question === answer.label)

        return (
          <ReportsCheckQuestionCard
            key={index}
            answer={answer}
            fault={fault}
            checkId={checkId}
          />
        )
      })}
    </ul>
  </div>
)
