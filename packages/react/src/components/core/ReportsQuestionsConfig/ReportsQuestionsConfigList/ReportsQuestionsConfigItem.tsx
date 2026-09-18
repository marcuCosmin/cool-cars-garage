import { useState } from "react"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import {
  GripHorizontal,
  SignStop,
  SignStopFill,
  Trash3Fill
} from "react-bootstrap-icons"

import { Input } from "@/components/basic/Input"
import { Tooltip } from "@/components/basic/Tooltip"

import type {
  DocWithID,
  ReportsQuestion
} from "@/globals/firestore/firestore.model"

import { ReportsQuestionsConfigAddButton } from "./ReportsQuestionsConfigAddButton"

type ReportsQuestionsConfigItemProps = DocWithID<
  Omit<ReportsQuestion, "section">
> & {
  onAdd: () => void
  onDelete: () => void
  onLabelChange: (label: string) => void
  onBlockingChange: (isBlocking: boolean) => void
}

export const ReportsQuestionsConfigItem = ({
  id,
  label,
  isBlocking,
  onAdd,
  onDelete,
  onLabelChange,
  onBlockingChange
}: ReportsQuestionsConfigItemProps) => {
  const [questionLabel, setQuestionLabel] = useState(label)
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const onInputChange = (label = "") => setQuestionLabel(label)
  const onInputBlur = () => onLabelChange(questionLabel)
  const onBlockingClick = () => onBlockingChange(!isBlocking)

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2"
    >
      {<ReportsQuestionsConfigAddButton onClick={onAdd} />}

      <div className="bg-primary p-1 rounded-md">
        <div className="flex justify-between text-white">
          <Tooltip
            label="Move item"
            containerTag="button"
            containerProps={{
              className: "cursor-grab p-1 bg-transparent",
              ...listeners
            }}
          >
            <GripHorizontal size={25} data-movable-handle />
          </Tooltip>

          <div className="flex items-center gap-2">
            <Tooltip
              label={isBlocking ? "Unmark as blocking" : "Mark as blocking"}
              containerTag="button"
              containerProps={{
                className: "p-1 bg-transparent",
                onClick: onBlockingClick
              }}
            >
              {isBlocking ? <SignStopFill size={20} /> : <SignStop size={20} />}
            </Tooltip>

            <Tooltip
              label="Delete item"
              containerTag="button"
              containerProps={{
                className: "p-1 bg-transparent",
                onClick: onDelete
              }}
            >
              <Trash3Fill size={20} />
            </Tooltip>
          </div>
        </div>

        <Input
          type="textarea"
          value={questionLabel}
          containerClassName="w-full max-w-none"
          className="bg-white dark:bg-black w-full"
          onChange={onInputChange}
          onBlur={onInputBlur}
        />
      </div>
    </div>
  )
}
