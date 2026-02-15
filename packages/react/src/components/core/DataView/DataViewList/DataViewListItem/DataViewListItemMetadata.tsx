import { useState } from "react"
import { Popover } from "react-tiny-popover"
import {
  Calendar2Week,
  CheckCircle,
  BoxArrowUp,
  InfoCircle,
  XCircle,
  ArrowDownCircle
} from "react-bootstrap-icons"

import { Collapsible } from "@/components/basic/Collapsible"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

import { getParsedItemMetadataValue } from "./DataViewListItemMetadata.utils"

import type {
  DataListItem,
  ItemListMetadata,
  ItemMetadata
} from "../../DataView.model"

type DataViewMetadataListProps = {
  label: string
  fields: ItemListMetadata["fields"]
}

const DataViewMetadataList = ({ label, fields }: DataViewMetadataListProps) => {
  const Icon = metadataIconsMap.list
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen)
  const onClickOutside = () => setIsPopoverOpen(false)

  const content = (
    <div className="flex flex-col items-center bg-white dark:bg-black p-2 border border-primary rounded-sm gap-2 max-h-64 overflow-y-auto">
      {fields.map((field, index) => (
        <>
          <DataViewListItemMetadata key={index} metadata={field} isNested />
          {index < fields.length - 1 && (
            <hr className="border-primary w-[85%]" />
          )}
        </>
      ))}
    </div>
  )

  return (
    <Popover
      isOpen={isPopoverOpen}
      onClickOutside={onClickOutside}
      positions={["bottom", "top", "left", "right"]}
      content={content}
    >
      <button
        onClick={togglePopover}
        className="bg-transparent p-0 flex items-center gap-2 text-primary"
      >
        <Icon height={20} width={20} /> {label} {`(${fields.length})`}
      </button>
    </Popover>
  )
}

const metadataIconsMap = {
  text: InfoCircle,
  boolean: (value: boolean) => (value ? CheckCircle : XCircle),
  date: Calendar2Week,
  link: BoxArrowUp,
  list: ArrowDownCircle
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
        if (props.type === "list") {
          const { label, fields, type } = props

          if (!fields.length) {
            return null
          }

          const Icon = metadataIconsMap[type]

          if (!isNested) {
            return (
              <DataViewMetadataList key={index} label={label} fields={fields} />
            )
          }

          return (
            <Collapsible
              title={
                <>
                  <Icon height={20} width={20} /> {label}
                </>
              }
              buttonClassName="p-0 bg-transparent w-fit flex gap-2 text-primary"
              key={index}
            >
              {fields.map((field, index) => (
                <>
                  <DataViewListItemMetadata
                    key={index}
                    metadata={field}
                    isNested
                  />
                  {index < fields.length - 1 && (
                    <hr className="border-primary w-[85%]" />
                  )}
                </>
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
