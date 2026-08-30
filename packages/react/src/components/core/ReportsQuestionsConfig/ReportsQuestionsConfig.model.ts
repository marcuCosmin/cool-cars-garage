import type {
  DocWithID,
  ReportsQuestion,
  ReportsQuestionsSection
} from "@/globals/firestore/firestore.model"

export type ReportsQuestionsCategory =
  | "psv-questions"
  | "non-psv-questions"
  | "rental-questions"

export type PropsWithSection<T extends object = object> = T & {
  section: ReportsQuestionsSection
}

export type OnSectionChange = (
  props: PropsWithSection<{ questions: DocWithID<ReportsQuestion>[] }>
) => void

export type OnItemLabelChange = (
  props: PropsWithSection<{ id: string; label: string }>
) => void

export type AddItemAtIndex = (
  props: PropsWithSection<{ index: number }>
) => void

export type DeleteItem = (props: PropsWithSection<{ id: string }>) => void

export type OnSectionReset = (props: PropsWithSection) => void

export type ReportsQuestionsConfigListProps = {
  questions: DocWithID<ReportsQuestion>[]
  hasChanges: boolean
  onSectionChange: OnSectionChange
  onItemLabelChange: OnItemLabelChange
  addItemAtIndex: AddItemAtIndex
  deleteItem: DeleteItem
  onSectionReset: OnSectionReset
  isBreakpointActive: boolean
  section: ReportsQuestionsSection
  setActiveSection?: (section: ReportsQuestionsSection) => void
}

export type ReportsCategoryConfig = {
  questions: DocWithID<ReportsQuestion>[]
}
