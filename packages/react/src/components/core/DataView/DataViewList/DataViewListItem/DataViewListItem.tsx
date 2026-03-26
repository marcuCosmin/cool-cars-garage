import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

import { extendRawItemMetadata } from "../../DataView.utils"

import type {
  DataListItemMetadataConfig,
  DataListItemActionsConfig
} from "../../DataView.model"

import { DataViewListItemMetadata } from "./DataViewListItemMetadata"
import { DataViewListItemActions } from "./DataViewListItemActions"

type DataCardProps<RawItem extends RawDataListItem> = {
  rawItem: RawItem
  actionsConfig?: DataListItemActionsConfig
  itemMetadataConfig: DataListItemMetadataConfig<RawItem>
}

export const DataListViewItem = <RawItem extends RawDataListItem>({
  rawItem,
  actionsConfig,
  itemMetadataConfig
}: DataCardProps<RawItem>) => {
  const { title, subtitle } = rawItem

  const metadata = extendRawItemMetadata<RawItem>({
    rawMetadata: rawItem.metadata,
    metadataConfig: itemMetadataConfig
  })

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-md border-primary border shadow-sm rounded-md">
      <div className="flex justify-between items-center">
        {title && <p className="font-bold text-primary">{title}</p>}

        <p className="text-sm font-bold bg-primary text-white rounded-md py-1 px-4 capitalize w-fit">
          {subtitle}
        </p>

        {!!actionsConfig?.items?.length && (
          <DataViewListItemActions {...actionsConfig} />
        )}
      </div>

      <hr />

      <DataViewListItemMetadata metadata={metadata} />
    </li>
  )
}
