import { useEffect, useState } from "react"

import { updateFirestoreDoc } from "@/firebase/utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import { reportsQuestionsSectionConfig } from "../ReportsQuestionsConfig.const"

import type { ReportsQuestionsConfigListProps } from "../ReportsQuestionsConfig.model"

export type OnItemLabelChange = (props: { id: string; label: string }) => void

type UseReportsQuestionsProps = Pick<
  ReportsQuestionsConfigListProps,
  "category" | "initialQuestions" | "section"
>

export const useReportsQuestions = ({
  initialQuestions,
  category,
  section
}: UseReportsQuestionsProps) => {
  const sectionConfig = reportsQuestionsSectionConfig[section]

  const [questions, setQuestions] = useState(initialQuestions)
  const { isLoading: isSaveLoading, mutate: saveQuestions } = useAppMutation({
    mutationFn: async () => {
      await updateFirestoreDoc({
        collectionId: "reports-config",
        docId: category,
        data: { [section]: questions.map(({ label }) => ({ label })) }
      })

      return {
        message: `${sectionConfig.title} questions updated successfully`
      }
    }
  })

  const hasChanges =
    initialQuestions.length !== questions.length ||
    questions.some(
      ({ label }, index) => label !== initialQuestions[index].label
    )

  const addItemAtIndex = (index: number) => {
    const newQuestions = questions.slice()

    newQuestions.splice(index, 0, { label: "", id: crypto.randomUUID() })

    setQuestions(newQuestions)
  }

  const deleteItem = (id: string) => {
    const newQuestions = questions.filter(question => question.id !== id)

    setQuestions(newQuestions)
  }

  const onItemLabelChange: OnItemLabelChange = ({ id, label }) => {
    const newQuestions = questions.map(question => {
      if (question.id === id) {
        return { ...question, label }
      }

      return question
    })

    setQuestions(newQuestions)
  }

  const addItemAtEndClick = () => addItemAtIndex(questions.length)

  const onResetClick = () => setQuestions(initialQuestions)

  useEffect(() => setQuestions(initialQuestions), [initialQuestions])

  return {
    questions,
    isSaveLoading,
    hasChanges,
    setQuestions,
    saveQuestions,
    addItemAtIndex,
    deleteItem,
    onItemLabelChange,
    addItemAtEndClick,
    onResetClick
  }
}
