import { useState } from "react"

import { updateFirestoreDoc } from "@/firebase/firebase.utils"

import { useAppMutation } from "@/hooks/useAppMutation"

import type {
  DocWithID,
  ReportsQuestion,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

import { reportsQuestionsTabsOptions } from "./ReportsQuestionsConfig.const"

import type {
  AddItemAtIndex,
  DeleteItem,
  OnItemBlockingChange,
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
          questions: questions.map(({ label, section, isBlocking }) => {
            const question: ReportsQuestion = { label, section }

            if (isBlocking) {
              question.isBlocking = true
            }

            return question
          })
        }
      })

      return { message: "Questions updated successfully" }
    }
  })

  const hasChanges =
    categoryConfig.questions.length !== questions.length ||
    questions.some(({ label, section, isBlocking }, index) => {
      const initialQuestion = categoryConfig.questions[index]

      return (
        label !== initialQuestion?.label ||
        section !== initialQuestion?.section ||
        !!isBlocking !== !!initialQuestion?.isBlocking
      )
    })

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
    setQuestions(
      reportsQuestionsTabsOptions.flatMap(({ value }) =>
        value === section ? sectionQuestions : (questionsBySection[value] ?? [])
      )
    )
  }

  const onItemLabelChange: OnItemLabelChange = ({ section, id, label }) => {
    onSectionChange({
      section,
      questions: (questionsBySection[section] ?? []).map(question =>
        question.id === id ? { ...question, label } : question
      )
    })
  }

  const onItemBlockingChange: OnItemBlockingChange = ({
    section,
    id,
    isBlocking
  }) => {
    onSectionChange({
      section,
      questions: (questionsBySection[section] ?? []).map(question =>
        question.id === id ? { ...question, isBlocking } : question
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
      sectionQuestions.some(({ label, isBlocking }, index) => {
        const initialQuestion = sectionInitialQuestions[index]

        return (
          label !== initialQuestion?.label ||
          !!isBlocking !== !!initialQuestion?.isBlocking
        )
      })
    )
  }

  return {
    questionsBySection,
    hasChanges,
    isSaveLoading,
    saveQuestions,
    onSectionChange,
    onItemLabelChange,
    onItemBlockingChange,
    addItemAtIndex,
    deleteItem,
    onSectionReset,
    hasSectionChanged
  }
}
