import type { ReportsQuestionsSection } from "@/globals/firestore/firestore.model"

type SectionConfig = {
  title: string
}

export const reportsQuestionsSectionConfig: Record<
  ReportsQuestionsSection,
  SectionConfig
> = {
  interior: {
    title: "Interior"
  },
  exterior: {
    title: "Exterior"
  },
  driver: {
    title: "Driver"
  }
}

export const reportsQuestionsTabsOptions: {
  label: string
  value: ReportsQuestionsSection
}[] = [
  { label: reportsQuestionsSectionConfig.interior.title, value: "interior" },
  { label: reportsQuestionsSectionConfig.exterior.title, value: "exterior" },
  { label: reportsQuestionsSectionConfig.driver.title, value: "driver" }
]

export const reportsQuestionsBreakpoint = 850
