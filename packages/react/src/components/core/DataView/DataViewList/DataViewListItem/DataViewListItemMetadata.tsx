import {
  Calendar2Week,
  CheckCircle,
  BoxArrowUp,
  InfoCircle
} from "react-bootstrap-icons"

import { Collapsible } from "@/components/basic/Collapsible"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

import { getParsedItemMetadataValue } from "./DataViewListItemMetadata.utils"

import type { DataListItem, ItemMetadata } from "../../DataView.model"

type CollapsibleIconProps = { itemsCount: number }

const CollapsibleIcon = ({ itemsCount }: CollapsibleIconProps) => (
  <div>{itemsCount}</div>
)

const metadataIconsMap = {
  text: InfoCircle,
  boolean: CheckCircle,
  date: Calendar2Week,
  link: BoxArrowUp,
  collapsible: CollapsibleIcon
} as const

type DataViewListItemMetadataProps = {
  metadata: Omit<
    DataListItem<RawDataListItem>["metadata"],
    "creationTimestamp"
  > & {
    creationTimestamp?: ItemMetadata
  }
}

export const DataViewListItemMetadata = ({
  metadata
}: DataViewListItemMetadataProps) => {
  const sortedMetadata = Object.values(metadata).sort(
    ({ label: label1 }, { label: label2 }) => label1.localeCompare(label2)
  )

  return (
    <div className="flex flex-col gap-2">
      {sortedMetadata.map(props => {
        if (props.type === "collapsible") {
          const { label, fields, type } = props
          const Icon = metadataIconsMap[type]

          return (
            <Collapsible
              title={
                <>
                  <Icon itemsCount={fields.length} /> {label}
                </>
              }
            >
              {fields.map((field, index) => (
                <DataViewListItemMetadata key={index} metadata={field} />
              ))}
            </Collapsible>
          )
        }

        const parsedValue = getParsedItemMetadataValue(props)

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
  )
}
