import {
  Calendar2Week,
  CheckCircle,
  BoxArrowUp,
  InfoCircle,
  XCircle
} from "react-bootstrap-icons"

import { Collapsible } from "@/components/basic/Collapsible"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

import { getParsedItemMetadataValue } from "./DataViewListItemMetadata.utils"

import type { DataListItem, ItemMetadata } from "../../DataView.model"

type CollapsibleIconProps = { itemsCount: number }

const CollapsibleIcon = ({ itemsCount }: CollapsibleIconProps) => (
  <div className="flex items-center justify-center border-[1.5px] text-primary border-primary rounded-full h-[20px] w-[20px]">
    {itemsCount}
  </div>
)

const metadataIconsMap = {
  text: InfoCircle,
  boolean: (value: boolean) => (value ? CheckCircle : XCircle),
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
  isNested?: boolean
}

export const DataViewListItemMetadata = ({
  metadata,
  isNested
}: DataViewListItemMetadataProps) => {
  const sortedMetadata = Object.values(metadata).sort(
    ({ label: label1 }, { label: label2 }) => label1?.localeCompare(label2)
  )

  return (
    <div
      className={`flex flex-col max-h-96 ${isNested ? "gap-1" : "gap-2 overflow-y-auto"}`}
    >
      {sortedMetadata.map((props, index) => {
        if (props.type === "collapsible") {
          const { label, fields, type } = props

          if (!fields.length) {
            return null
          }

          const Icon = metadataIconsMap[type]

          return (
            <Collapsible
              title={
                <>
                  <Icon itemsCount={fields.length} /> {label}
                </>
              }
              buttonClassName="p-0 bg-transparent w-fit flex gap-2 text-primary"
              key={index}
            >
              {fields.map((field, index) => (
                <DataViewListItemMetadata
                  key={index}
                  metadata={field}
                  isNested
                />
              ))}
            </Collapsible>
          )
        }

        const parsedValue = getParsedItemMetadataValue(props)

        const { label, type, value } = props

        if (parsedValue === null || parsedValue === undefined) {
          return null
        }

        const Icon =
          type === "boolean"
            ? metadataIconsMap[type](!!value)
            : metadataIconsMap[type]

        return (
          <p
            className="flex items-center text-primary gap-2 font-bold"
            key={index}
          >
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
