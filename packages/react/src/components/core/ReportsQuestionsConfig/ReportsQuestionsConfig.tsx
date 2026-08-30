import { useState } from "react"

import { useAppSelector } from "@/redux/redux.config"

import { Loader } from "@/components/basic/Loader"

import type { ReportsQuestionsSection } from "@/globals/firestore/firestore.model"

import { ReportsQuestionsConfigList } from "./ReportsQuestionsConfigList/ReportsQuestionsConfigList"

import { useReportsQuestionsConfig } from "./useReportsQuestionsConfig"

import { reportsQuestionsBreakpoint } from "./ReportsQuestionsConfig.const"

import type {
  ReportsCategoryConfig,
  ReportsQuestionsCategory
} from "./ReportsQuestionsConfig.model"

type ReportsQuestionsConfigProps = {
  category: ReportsQuestionsCategory
  categoryConfig: ReportsCategoryConfig
}

export const ReportsQuestionsConfig = ({
  category,
  categoryConfig
}: ReportsQuestionsConfigProps) => {
  const screenWidth = useAppSelector(({ screen }) => screen.width)
  const [activeSection, setActiveSection] =
    useState<ReportsQuestionsSection>("interior")

  const {
    questionsBySection,
    hasChanges,
    isSaveLoading,
    saveQuestions,
    hasSectionChanged,
    ...questionsSectionsActions
  } = useReportsQuestionsConfig({ category, categoryConfig })

  const isDesktopLayout = screenWidth >= reportsQuestionsBreakpoint

  return (
    <div className="flex flex-col overflow-hidden p-5 gap-5 relative">
      {isSaveLoading && <Loader enableOverlay />}

      <div className="flex justify-end">
        <button
          type="button"
          className="w-fit px-5"
          disabled={!hasChanges}
          onClick={saveQuestions}
        >
          Save
        </button>
      </div>

      <div className="flex w-full justify-center gap-20 overflow-hidden">
        {isDesktopLayout ? (
          Object.keys(questionsBySection).map(section => {
            const castSection = section as ReportsQuestionsSection

            return (
              <ReportsQuestionsConfigList
                key={castSection}
                section={castSection}
                isBreakpointActive={false}
                questions={questionsBySection[castSection] ?? []}
                hasChanges={hasSectionChanged(castSection)}
                setActiveSection={setActiveSection}
                {...questionsSectionsActions}
              />
            )
          })
        ) : (
          <ReportsQuestionsConfigList
            section={activeSection}
            isBreakpointActive
            questions={questionsBySection[activeSection] ?? []}
            hasChanges={hasSectionChanged(activeSection)}
            setActiveSection={setActiveSection}
            {...questionsSectionsActions}
          />
        )}
      </div>
    </div>
  )
}
