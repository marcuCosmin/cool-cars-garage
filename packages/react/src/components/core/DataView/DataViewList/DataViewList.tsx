import { useInfiniteScroll } from "./useInfiniteScroll"

import { DataListViewItem } from "./DataViewListItem"

import type { DataListItem } from "../DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type DataViewListProps<RawItem extends RawDataListItem> = {
  items: DataListItem<RawItem>[]
  onScrollEnd?: () => void
  onItemEdit?: (id: string) => void
  onItemDelete?: (id: string) => Promise<void>
}

export const DataViewList = <RawItem extends RawDataListItem>({
  items,
  onItemEdit,
  onItemDelete,
  onScrollEnd
}: DataViewListProps<RawItem>) => {
  const { sentinelRef } = useInfiniteScroll(onScrollEnd)

  return (
    <ul className="p-5 flex flex-wrap gap-10 overflow-y-auto h-fit max-h-full w-full scrollbar">
      {items.map(({ title, subtitle, id, metadata }) => {
        const onEdit = onItemEdit ? () => onItemEdit(id) : undefined
        const onDelete = onItemDelete ? () => onItemDelete(id) : undefined

        return (
          <DataListViewItem
            key={id}
            title={title}
            subtitle={subtitle}
            metadata={metadata}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
      <div ref={sentinelRef} className="h-px w-full bg-transparent" />
    </ul>
  )
}
