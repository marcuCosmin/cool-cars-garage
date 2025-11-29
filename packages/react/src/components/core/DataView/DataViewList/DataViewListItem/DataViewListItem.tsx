import {
  Trash3Fill,
  PencilSquare,
  BoxArrowInUpRight
} from "react-bootstrap-icons"
import { Link } from "react-router"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Tooltip } from "@/components/basic/Tooltip"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

import type { DataListItem } from "../../DataView.model"

import { DataViewListItemMetadata } from "./DataViewListItemMetadata"

type DataCardProps = Pick<
  DataListItem<RawDataListItem>,
  "title" | "subtitle"
> & {
  metadata: DataListItem<RawDataListItem>["metadata"]
  detailedViewPath?: string
  onDelete?: () => Promise<void>
  onEdit?: () => void
}

export const DataListViewItem = ({
  title,
  subtitle,
  metadata,
  detailedViewPath,
  onDelete,
  onEdit
}: DataCardProps) => {
  const { setModalProps } = useModalContext()

  const onDeleteClick = onDelete
    ? () =>
        setModalProps({
          type: "confirmation",
          props: {
            onConfirm: onDelete,
            text: `Are you sure you want to delete ${title}?`
          }
        })
    : undefined

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-sm border-primary border shadow-sm rounded-md">
      <div className="flex justify-between items-center">
        {title && <p className="font-bold text-primary">{title}</p>}

        <p className="text-sm font-bold bg-primary text-white rounded-md py-1 px-4 capitalize w-fit">
          {subtitle}
        </p>

        {(onEdit || onDelete || detailedViewPath) && (
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

            {detailedViewPath && (
              <Tooltip label="Detailed view">
                <Link to={detailedViewPath} className="h-fit">
                  <BoxArrowInUpRight width={20} height={20} />
                </Link>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      <hr />

      <DataViewListItemMetadata metadata={metadata} />
    </li>
  )
}
