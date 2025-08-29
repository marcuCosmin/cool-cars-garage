import { Trash3Fill, PencilSquare } from "react-bootstrap-icons"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import { keyToLabel } from "@/utils/string"

import type { FieldValue } from "@/models"

import { fieldValueToString } from "./DataView.utils"

import type { DefaultDataItem } from "./DataView.model"

type DataCardProps = Pick<DefaultDataItem, "title" | "badge"> & {
  onDelete: () => Promise<void>
  fieldsData: Record<string, FieldValue>
  onEdit: () => void
}

export const DataCard = ({
  title,
  badge,
  fieldsData,
  onDelete,
  onEdit
}: DataCardProps) => {
  const dispatch = useAppDispatch()

  const onDeleteClick = () =>
    dispatch(
      openModal({
        type: "confirmation",
        props: {
          onConfirm: onDelete,
          text: `Are you sure you want to delete ${title}?`
        }
      })
    )

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-sm bg-secondary dark:bg-primary shadow-primary dark:shadow-secondary shadow-sm rounded-md">
      <div className="flex justify-between items-center">
        <p className="flex items-center font-bold gap-2">{title}</p>

        <p className="text-sm font-bold bg-primary dark:bg-secondary rounded-xl px-3 capitalize w-fit text-secondary dark:text-primary">
          {badge}
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-transparent w-fit p-0 text-primary dark:text-secondary"
            onClick={onEdit}
          >
            <PencilSquare width={18} height={18} />
          </button>

          <button
            type="button"
            className="bg-transparent w-fit p-0 text-primary dark:text-secondary"
            onClick={onDeleteClick}
          >
            <Trash3Fill width={18} />
          </button>
        </div>
      </div>

      <hr />

      <div>
        {Object.entries(fieldsData)
          .sort(([key1], [key2]) => key1.localeCompare(key2))
          .map(([key, value]) => {
            const label = keyToLabel(key)

            const formattedValue = fieldValueToString(value)

            return (
              <p className="flex items-center gap-2">
                {label}: {formattedValue}
              </p>
            )
          })}
      </div>
    </li>
  )
}
