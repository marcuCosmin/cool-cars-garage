import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type {
  DocWithID,
  ReportsQuestion
} from "@/globals/firestore/firestore.model"

import { getFirestoreDoc } from "@/firebase/firebase.utils"

import { Tab } from "@/components/basic/Tab"
import { Loader } from "@/components/basic/Loader"

import { NotFound } from "@/components/core/NotFound"
import { ReportsQuestionsConfig } from "@/components/core/ReportsQuestionsConfig/ReportsQuestionsConfig"
import type { ReportsQuestionsCategory } from "@/components/core/ReportsQuestionsConfig/ReportsQuestionsConfig.model"

const tabOptions: Array<{ label: string; value: ReportsQuestionsCategory }> = [
  { label: "PSV", value: "psv-questions" },
  { label: "Non-PSV", value: "non-psv-questions" },
  { label: "Rental", value: "rental-questions" }
]

export const ReportsConfig = () => {
  const [category, setCategory] =
    useState<ReportsQuestionsCategory>("psv-questions")

  const { data: categoryConfig, isLoading } = useQuery({
    queryKey: ["/reports-questions-config", category],
    queryFn: async () => {
      const data = await getFirestoreDoc({
        collectionId: "reports-config",
        docId: category
      })

      if (!data) {
        return
      }

      const questions: DocWithID<ReportsQuestion>[] = data.questions.map(
        item => ({
          ...item,
          id: crypto.randomUUID()
        })
      )

      return {
        questions
      }
    }
  })

  const renderContent = () => {
    if (isLoading) {
      return <Loader />
    }

    if (!categoryConfig) {
      return <NotFound />
    }

    return (
      <ReportsQuestionsConfig
        category={category}
        categoryConfig={categoryConfig}
      />
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden mt-5">
      <Tab
        className="justify-center"
        options={tabOptions}
        value={category}
        onChange={setCategory}
      />
      {renderContent()}
    </div>
  )
}
