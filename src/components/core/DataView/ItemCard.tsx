import { useState } from "react"
import { toast } from "react-toastify"
import { Trash3Fill, PencilSquare } from "react-bootstrap-icons"

import { Loader } from "../../basic/Loader"

type ItemCardProps = {
  title: string
  subtitle: string
  onDelete: () => Promise<string | undefined> | string | undefined
  fieldsData: Record<string, string>
  onEdit?: () => void
}

const cardKeyToLabel = (key: string): string => {
  const spacedKey = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()

  return spacedKey.charAt(0).toUpperCase() + spacedKey.slice(1)
}

export const ItemCard = ({
  title,
  subtitle,
  fieldsData,
  onDelete,
  onEdit
}: ItemCardProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const onDeleteClick = () => setShowDeleteConfirmation(true)
  const onDeleteCancel = () => setShowDeleteConfirmation(false)
  const onDeleteConfirm = async () => {
    try {
      setIsDeleteLoading(true)
      const error = await onDelete()

      if (!error) {
        setShowDeleteConfirmation(false)
        toast.success("Item deleted successfully")
        return
      }

      toast.error(error)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      }

      toast.error("Failed to delete item: Unknown error occurred")
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-sm bg-secondary dark:bg-primary shadow-primary dark:shadow-secondary shadow-sm rounded-md">
      {showDeleteConfirmation && (
        <div className="absolute top-0 right-0 flex flex-col gap-4 justify-center items-center w-full h-full rounded-md backdrop-blur-xs">
          <p className="font-bold text-md text-center">
            Are you sure you want to delete this item?
          </p>
          <div className="flex gap-4 w-1/2">
            <button className="p-1" type="button" onClick={onDeleteConfirm}>
              Yes
            </button>
            <button className="p-1" type="button" onClick={onDeleteCancel}>
              No
            </button>
          </div>
        </div>
      )}

      {isDeleteLoading && <Loader enableOverlay />}

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
          .sort(([label1], [label2]) => label1.localeCompare(label2))
          .map(([label, value]) => (
            <div className="flex items-center gap-2" key={label}>
              {cardKeyToLabel(label)}: {value}
            </div>
          ))}
      </div>
    </li>
  )
}
