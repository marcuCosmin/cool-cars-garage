import { Fragment } from "react/jsx-runtime"
import { DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ArrowReturnLeft } from "react-bootstrap-icons"
import {
  restrictToVerticalAxis,
  restrictToParentElement
} from "@dnd-kit/modifiers"

import { Tooltip } from "@/components/basic/Tooltip"
import { Tab } from "@/components/basic/Tab"

import { useDNDList } from "./useDNDList"

import { ReportsQuestionsConfigItem } from "./ReportsQuestionsConfigItem"
import { ReportsQuestionsConfigAddButton } from "./ReportsQuestionsConfigAddButton"

import {
  reportsQuestionsSectionConfig,
  reportsQuestionsTabsOptions
} from "../ReportsQuestionsConfig.const"

import type { ReportsQuestionsConfigListProps } from "../ReportsQuestionsConfig.model"

export const ReportsQuestionsConfigList = ({
  questions,
  hasChanges,
  onSectionChange,
  onItemLabelChange,
  addItemAtIndex,
  deleteItem,
  onSectionReset,
  section,
  isBreakpointActive,
  setActiveSection
}: ReportsQuestionsConfigListProps) => {
  const { sensors, onListDragEnd } = useDNDList({
    items: questions,
    setItems: questions => onSectionChange({ section, questions })
  })

  const addItemAtEndClick = () =>
    addItemAtIndex({ section, index: questions.length })

  const onResetClick = () => onSectionReset({ section })

  const sectionConfig = reportsQuestionsSectionConfig[section]

  return (
    <div className="flex flex-col w-full max-w-3xl relative">
      <div className="grid grid-cols-2">
        <Tooltip
          label="Revert Changes"
          containerTag="button"
          containerProps={{
            type: "button",
            onClick: onResetClick,
            className: "w-fit",
            disabled: !hasChanges
          }}
        >
          <ArrowReturnLeft size={20} />
        </Tooltip>

        {isBreakpointActive ? (
          <Tab
            className="justify-center"
            options={reportsQuestionsTabsOptions}
            value={section}
            onChange={setActiveSection!}
          />
        ) : (
          <h3 className="text-center">{sectionConfig.title}</h3>
        )}
      </div>

      <hr className="my-5 w-[90%] mx-auto" />

      <DndContext
        sensors={sensors}
        onDragEnd={onListDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={questions}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden mb-2">
            {questions.map(({ label, id }, index) => {
              const isLast = index === questions.length - 1
              const onDelete = () => deleteItem({ section, id })
              const onLabelChange = (label: string) =>
                onItemLabelChange({ section, id, label })
              const onAdd = () => addItemAtIndex({ section, index })

              return (
                <Fragment key={id}>
                  <ReportsQuestionsConfigItem
                    id={id}
                    label={label}
                    onDelete={onDelete}
                    onLabelChange={onLabelChange}
                    onAdd={onAdd}
                  />
                  {isLast && (
                    <ReportsQuestionsConfigAddButton
                      onClick={addItemAtEndClick}
                    />
                  )}
                </Fragment>
              )
            })}
            {!questions.length && (
              <ReportsQuestionsConfigAddButton onClick={addItemAtEndClick} />
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
