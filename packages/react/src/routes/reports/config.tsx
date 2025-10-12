import { useState } from "react"

import { ReportsQuestionsConfig } from "@/components/core/ReportsQuestionsConfig/ReportsQuestionsConfig"
import type { ReportsQuestionsCategory } from "@/components/core/ReportsQuestionsConfig/ReportsQuestionsConfig.model"
import { Tab } from "@/components/basic/Tab"

const tabOptions: Array<{ label: string; value: ReportsQuestionsCategory }> = [
  { label: "PSV", value: "psv-questions" },
  { label: "Non-PSV", value: "non-psv-questions" },
  { label: "Rental", value: "rental-questions" }
]

export const ReportsConfig = () => {
  const [category, setCategory] =
    useState<ReportsQuestionsCategory>("psv-questions")

  return (
    <div className="h-full flex flex-col overflow-hidden mt-5">
      <Tab
        className="justify-center"
        options={tabOptions}
        value={category}
        onChange={setCategory}
      />
      <ReportsQuestionsConfig category={category} />
    </div>
  )
}
