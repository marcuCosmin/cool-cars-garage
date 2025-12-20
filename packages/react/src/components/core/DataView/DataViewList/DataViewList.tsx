import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

import { useInfiniteScroll } from "./useInfiniteScroll"

import { DataListViewItem } from "./DataViewListItem/DataViewListItem"

import type {
  GetListItemActionsConfig,
  DataListItemMetadataConfig
} from "../DataView.model"

type DataViewListProps<RawItem extends RawDataListItem> = {
  rawItems: RawItem[]
  getItemActionsConfig?: GetListItemActionsConfig<RawItem>
  itemMetadataConfig: DataListItemMetadataConfig<RawItem>
  onScrollEnd?: () => void
}

export const DataViewList = <RawItem extends RawDataListItem>({
  rawItems,
  getItemActionsConfig,
  itemMetadataConfig,
  onScrollEnd
}: DataViewListProps<RawItem>) => {
  const { sentinelRef } = useInfiniteScroll(onScrollEnd)

  return (
    <ul className="p-5 flex flex-wrap gap-10 overflow-y-auto h-fit max-h-full w-full justify-center">
      {rawItems.map(rawItem => {
        const actionsConfig = getItemActionsConfig?.(rawItem)

        return (
          <DataListViewItem
            key={rawItem.id}
            rawItem={rawItem}
            actionsConfig={actionsConfig}
            itemMetadataConfig={itemMetadataConfig}
          />
        )
      })}

      <div ref={sentinelRef} className="h-px w-full bg-transparent" />
    </ul>
  )
}
