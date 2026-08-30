import { useState } from "react"

import { updateFirestoreDoc } from "@/firebase/firebase.utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import type {
  DocWithID,
  ReportsQuestion,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

import type {
  AddItemAtIndex,
  DeleteItem,
  OnItemLabelChange,
  OnSectionChange,
  OnSectionReset,
  ReportsCategoryConfig,
  ReportsQuestionsCategory
} from "./ReportsQuestionsConfig.model"

type UseReportsQuestionsConfigProps = {
  category: ReportsQuestionsCategory
  categoryConfig: ReportsCategoryConfig
}

export const useReportsQuestionsConfig = ({
  category,
  categoryConfig
}: UseReportsQuestionsConfigProps) => {
  const [questions, setQuestions] = useState<DocWithID<ReportsQuestion>[]>(
    categoryConfig.questions
  )

  const { isLoading: isSaveLoading, mutate: saveQuestions } = useAppMutation({
    mutationFn: async () => {
      await updateFirestoreDoc({
        collectionId: "reports-config",
        docId: category,
        data: {
          questions: questions.map(({ label, section }) => ({
            label,
            section
          }))
        }
      })

      return { message: "Questions updated successfully" }
    }
  })

  const hasChanges =
    categoryConfig.questions.length !== questions.length ||
    questions.some(
      (question, index) =>
        question.label !== categoryConfig.questions[index]?.label ||
        question.section !== categoryConfig.questions[index]?.section
    )

  const questionsBySection = Object.groupBy(
    questions,
    question => question.section
  )
  const initialQuestionsBySection = Object.groupBy(
    categoryConfig.questions,
    question => question.section
  )

  const onSectionChange: OnSectionChange = ({
    section,
    questions: sectionQuestions
  }) => {
    setQuestions([
      ...questions.filter(question => question.section !== section),
      ...sectionQuestions
    ])
  }

  const onItemLabelChange: OnItemLabelChange = ({ section, id, label }) => {
    onSectionChange({
      section,
      questions: (questionsBySection[section] ?? []).map(question =>
        question.id === id ? { ...question, label } : question
      )
    })
  }

  const addItemAtIndex: AddItemAtIndex = ({ section, index }) => {
    const newSectionQuestions = (questionsBySection[section] ?? []).slice()

    newSectionQuestions.splice(index, 0, {
      label: "",
      section,
      id: crypto.randomUUID()
    })

    onSectionChange({ section, questions: newSectionQuestions })
  }

  const deleteItem: DeleteItem = ({ section, id }) => {
    onSectionChange({
      section,
      questions: (questionsBySection[section] ?? []).filter(
        question => question.id !== id
      )
    })
  }

  const onSectionReset: OnSectionReset = ({ section }) => {
    onSectionChange({
      section,
      questions: initialQuestionsBySection[section] ?? []
    })
  }

  const hasSectionChanged = (section: ReportsQuestionsSection) => {
    const sectionQuestions = questionsBySection[section] ?? []
    const sectionInitialQuestions = initialQuestionsBySection[section] ?? []

    return (
      sectionQuestions.length !== sectionInitialQuestions.length ||
      sectionQuestions.some(
        ({ label }, index) => label !== sectionInitialQuestions[index]?.label
      )
    )
  }

  return {
    questionsBySection,
    hasChanges,
    isSaveLoading,
    saveQuestions,
    onSectionChange,
    onItemLabelChange,
    addItemAtIndex,
    deleteItem,
    onSectionReset,
    hasSectionChanged
  }
}
