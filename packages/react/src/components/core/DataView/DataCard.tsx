import { toast } from "react-toastify"
import { Trash3Fill, PencilSquare } from "react-bootstrap-icons"

import { useReduxDispatch } from "../../../redux/config"
import { openModal } from "../../../redux/modalSlice"

import { fieldValueToString } from "./utils"

import { keyToLabel } from "../../../utils/string"

import type { FieldValue } from "@/models"

type DataCardProps = {
  title: string
  subtitle: string
  onDelete: () => Promise<string | undefined> | string | undefined
  fieldsData: Record<string, FieldValue>
  onEdit?: () => void
}

export const DataCard = ({
  title,
  subtitle,
  fieldsData,
  onDelete,
  onEdit
}: DataCardProps) => {
  const dispatch = useReduxDispatch()

  const onDeleteConfirm = async () => {
    try {
      const error = await onDelete()

      if (!error) {
        toast.success("Item deleted successfully")
        return
      }

      toast.error(error)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      }

      toast.error("Failed to delete item: Unknown error occurred")
    }
  }
  const onDeleteClick = () =>
    dispatch(
      openModal({
        type: "confirmation",
        props: {
          onConfirm: onDeleteConfirm,
          text: `Are you sure you want to delete ${title}?`
        }
      })
    )

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-sm bg-secondary dark:bg-primary shadow-primary dark:shadow-secondary shadow-sm rounded-md">
      <div className="flex justify-between items-center">
        <p className="flex items-center font-bold gap-2">{title}</p>

        <p className="text-sm font-bold bg-primary dark:bg-secondary rounded-xl px-3 capitalize w-fit text-secondary dark:text-primary">
          {subtitle}
        </p>

        <div className="flex items-center gap-4">
          {onEdit && (
            <button
              type="button"
              className="bg-transparent w-fit p-0 text-primary dark:text-secondary"
              onClick={onEdit}
            >
              <PencilSquare width={18} height={18} />
            </button>
          )}

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
