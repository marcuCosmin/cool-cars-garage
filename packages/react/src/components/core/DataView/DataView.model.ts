import type { QueryFunctionContext } from "@tanstack/react-query"

import type { SelectProps } from "@/components/basic/Select"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type ItemTextMetadata = {
  type: "text"
  label: string
  value?: string
}

type ItemBooleanMetadata = {
  type: "boolean"
  label: string
  value?: boolean
}

type ItemDateMetadata = {
  type: "date"
  label: string
  value?: number
}

type ItemLinkMetadata = {
  type: "link"
  label: string
  value: string
  href: string
}

type ItemMetadataConfig =
  | Omit<ItemTextMetadata, "value">
  | Omit<ItemBooleanMetadata, "value">
  | Omit<ItemDateMetadata, "value">
  | Omit<ItemLinkMetadata, "value">

export type ItemMetadata =
  | ItemTextMetadata
  | ItemBooleanMetadata
  | ItemDateMetadata
  | ItemLinkMetadata

export type DataListItemMetadataConfig<RawItem extends RawDataListItem> = {
  [key in keyof RawItem["metadata"]]: ItemMetadataConfig
}

export type DataListItem<RawItem extends RawDataListItem> = Omit<
  RawDataListItem,
  "metadata"
> & { metadata: { [key in keyof RawItem["metadata"]]: ItemMetadata } }

export type FilterChangeHandler = (props: {
  value: string[] | boolean
  index: number
}) => void

type ComponentFilterProps = {
  label: string
}

type SelectFilterProps = {
  type: "select"
  options: SelectProps["options"]
  value: string[]
  field: string
} & ComponentFilterProps

type ToggleFilterProps<RawItem extends RawDataListItem> = {
  type: "toggle"
  filterFn: (item: DataListItem<RawItem>) => boolean
  value: boolean
} & ComponentFilterProps

export type FiltersConfig<RawItem extends RawDataListItem> = (
  | Omit<SelectFilterProps, "value">
  | Omit<ToggleFilterProps<RawItem>, "value">
)[]

export type FiltersState<RawItem extends RawDataListItem> = (
  | SelectFilterProps
  | ToggleFilterProps<RawItem>
)[]

export type QueryContext<RawItem extends RawDataListItem> =
  QueryFunctionContext<(string | FiltersState<RawItem>)[], number | undefined>

export type FetchItems<RawItem extends RawDataListItem> = (
  queryContext?: QueryContext<RawItem>
) => Promise<RawItem[]>

export type OpenEditModalProps<RawItem extends RawDataListItem> = {
  item: RawItem
  onSuccess: (newItem: RawItem) => void
}
export type OpenEditModal<RawItem extends RawDataListItem> = (
  props: OpenEditModalProps<RawItem>
) => void
