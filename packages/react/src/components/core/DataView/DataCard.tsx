import {
  Trash3Fill,
  PencilSquare,
  Icon,
  Calendar2Week,
  CheckCircle,
  BoxArrowUp,
  InfoCircle
} from "react-bootstrap-icons"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

import { getParsedItemMetadataValue } from "./DataView.utils"

import type { DataListItem, ItemMetadata } from "./DataView.model"

const metadataIconsMap: Record<ItemMetadata["type"], Icon> = {
  text: InfoCircle,
  boolean: CheckCircle,
  date: Calendar2Week,
  link: BoxArrowUp
}

type DataCardProps = Pick<
  DataListItem<RawDataListItem>,
  "title" | "subtitle"
> & {
  metadata: DataListItem<RawDataListItem>["metadata"]
  onDelete?: () => Promise<void>
  onEdit?: () => void
}

export const DataCard = ({
  title,
  subtitle,
  metadata,
  onDelete,
  onEdit
}: DataCardProps) => {
  const dispatch = useAppDispatch()

  const onDeleteClick = () =>
    dispatch(
      openModal({
        type: "confirmation",
        props: {
          onConfirm: onDelete!,
          text: `Are you sure you want to delete ${title}?`
        }
      })
    )

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-sm border-primary border shadow-sm rounded-md">
      <div className="flex justify-between items-center">
        <p className="font-bold text-primary">{title}</p>

        <p className="text-sm font-bold bg-primary text-white rounded-md py-1 px-4 capitalize w-fit">
          {subtitle}
        </p>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-4">
            {onEdit && (
              <button
                type="button"
                className="bg-transparent w-fit p-0 text-primary"
                onClick={onEdit}
              >
                <PencilSquare width={20} height={20} />
              </button>
            )}

            {onDeleteClick && (
              <button
                type="button"
                className="bg-transparent w-fit p-0 text-primary"
                onClick={onDeleteClick}
              >
                <Trash3Fill width={20} height={20} />
              </button>
            )}
          </div>
        )}
      </div>

      <hr />

      <div className="flex flex-col gap-2">
        {Object.values(metadata)
          .sort(({ label: label1 }, { label: label2 }) =>
            // TODO: Remove "?" after demo
            label1?.localeCompare(label2)
          )
          .map(props => {
            const parsedValue = getParsedItemMetadataValue(props)
            console.log(props)
            console.log(parsedValue)

            const { label, type } = props

            const Icon = metadataIconsMap[type]

            if (parsedValue === null || parsedValue === undefined) {
              return null
            }

            return (
              <p className="flex items-center text-primary gap-2 font-bold">
                <Icon height={20} width={20} />
                {label}:{" "}
                <span className="text-black dark:text-white font-normal">
                  {parsedValue}
                </span>
              </p>
            )
          })}
      </div>
    </li>
  )
}
