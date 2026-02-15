import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { getFirestoreDoc } from "@/firebase/utils"

import { useAppSelector } from "@/redux/config"

import { NotFound } from "@/components/core/NotFound"
import { Loader } from "@/components/basic/Loader"

import type { ReportsQuestionsDoc } from "@/globals/firestore/firestore.model"

import { ReportsQuestionsConfigList } from "./ReportsQuestionsConfigList/ReportsQuestionsConfigList"

import { reportsQuestionsBreakpoint } from "./ReportsQuestionsConfig.const"

import type { ReportsQuestionsCategory } from "./ReportsQuestionsConfig.model"

type ReportsQuestionsConfigProps = {
  category: ReportsQuestionsCategory
}

export const ReportsQuestionsConfig = ({
  category
}: ReportsQuestionsConfigProps) => {
  const screenWidth = useAppSelector(({ screen }) => screen.width)
  const [activeSection, setActiveSection] =
    useState<keyof ReportsQuestionsDoc>("interior")

  const { data, isLoading } = useQuery({
    queryKey: ["/reports-questions-config", category],
    queryFn: async () => {
      const data = await getFirestoreDoc({
        collectionId: "reports-config",
        docId: category
      })

      if (!data) {
        return
      }

      return {
        interior: data.interior.map(item => ({
          ...item,
          id: crypto.randomUUID()
        })),
        exterior: data.exterior.map(item => ({
          ...item,
          id: crypto.randomUUID()
        })),
        id: data.id
      }
    }
  })

  if (isLoading) {
    return <Loader enableOverlay />
  }

  if (!data) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col overflow-hidden p-5">
      <div className="flex w-full justify-center gap-20 overflow-hidden">
        {screenWidth >= reportsQuestionsBreakpoint ? (
          <>
            <ReportsQuestionsConfigList
              category={category}
              section="interior"
              isBreakpointActive={false}
              initialQuestions={data.interior}
            />
            <ReportsQuestionsConfigList
              category={category}
              section="exterior"
              isBreakpointActive={false}
              initialQuestions={data.exterior}
            />
          </>
        ) : (
          <>
            <ReportsQuestionsConfigList
              category={category}
              section={activeSection}
              isBreakpointActive={true}
              setActiveSection={setActiveSection}
              initialQuestions={data[activeSection]}
            />
          </>
        )}
      </div>
    </div>
  )
}
