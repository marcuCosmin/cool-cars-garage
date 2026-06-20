import {
  CheckCircle,
  BoxArrowUp,
  InfoCircle,
  XCircle,
  ArrowDownCircle,
  CalendarWeek,
  Stopwatch,
  FileEarmarkRichtext
} from "react-bootstrap-icons"

import { Collapsible } from "@/components/basic/Collapsible"
import { Dropdown } from "@/components/basic/Dropdown/Dropdown"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

import type { DataListItem, ItemMetadata } from "../../DataView.model"

import { DataViewFileMetadataItem } from "./DataViewFileMetadataItem"
import { DataViewMetadataItem } from "./DataViewMetadataItem"

import { getParsedItemMetadataValue } from "./DataViewListItemMetadata.utils"

const metadataIconsMap = {
  text: InfoCircle,
  boolean: (value: boolean) => (value ? CheckCircle : XCircle),
  date: CalendarWeek,
  duration: Stopwatch,
  link: BoxArrowUp,
  list: ArrowDownCircle,
  file: FileEarmarkRichtext
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
            const title = (
              <>
                <Icon height={20} width={20} /> {label} {`(${fields.length})`}
              </>
            )

            return (
              <Dropdown
                title={title}
                buttonClassName="bg-transparent p-0 flex items-center gap-2 text-primary"
                popoverClassName="max-h-64 overflow-y-auto"
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
              </Dropdown>
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

        if (type === "file") {
          return (
            <DataViewFileMetadataItem
              label={label}
              parsedValue={parsedValue}
              Icon={Icon}
              value={value as string}
            />
          )
        }

        return (
          <DataViewMetadataItem
            key={index}
            Icon={Icon}
            label={label}
            parsedValue={parsedValue}
          />
        )
      })}
    </div>
  )
}
