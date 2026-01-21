import type {
  DocWithID,
  ReportsQuestion,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

export type ReportsQuestionsCategory =
  | "psv-questions"
  | "non-psv-questions"
  | "rental-questions"

export type ReportsQuestionsConfigListProps = {
  category: ReportsQuestionsCategory
  initialQuestions: DocWithID<ReportsQuestion>[]
  isBreakpointActive: boolean
  section: ReportsQuestionsSection
  setActiveSection?: (section: ReportsQuestionsSection) => void
}
