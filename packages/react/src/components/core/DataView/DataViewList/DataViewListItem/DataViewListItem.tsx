import { Tooltip } from "@/components/basic/Tooltip"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

import { extendRawItemMetadata } from "../../DataView.utils"

import type {
  DataListItemActionProps,
  DataListItemMetadataConfig
} from "../../DataView.model"

import { DataViewListItemMetadata } from "./DataViewListItemMetadata"

type DataCardProps<RawItem extends RawDataListItem> = {
  rawItem: RawItem
  actionsConfig?: DataListItemActionProps[]
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

        {!!actionsConfig?.length && (
          <ul className="flex items-center gap-4">
            {actionsConfig.map((actionConfig, index) => {
              const { tooltip, Icon, onClick, hidden } = actionConfig

              if (hidden) {
                return null
              }

              return (
                <li key={index}>
                  <Tooltip
                    label={tooltip}
                    containerTag="button"
                    containerProps={{
                      onClick,
                      className: "bg-transparent w-fit p-0 text-primary"
                    }}
                  >
                    <Icon width={20} height={20} />
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <hr />

      <DataViewListItemMetadata metadata={metadata} />
    </li>
  )
}
