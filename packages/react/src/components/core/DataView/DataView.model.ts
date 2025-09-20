import type { QueryFunctionContext } from "@tanstack/react-query"

import type { SelectProps } from "@/components/basic/Select"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"
import type { FormFieldValue } from "@/shared/forms/forms.models"
import { DatePickerProps } from "@/components/basic/DatePicker"
import { DocumentData } from "firebase/firestore"

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
  value?: string[] | boolean | number
  index: number
}) => void

type ComponentFilterProps = {
  label: string
}

type SelectFilterProps<Item extends Record<string, any>> = {
  type: "select"
  options: SelectProps["options"]
  value: string[]
  field: keyof Item
} & ComponentFilterProps

type ToggleFilterProps<Item extends Record<string, any>> = {
  type: "toggle"
  filterOptions: {
    field: keyof Item
    operator: "==" | "!=" | ">" | "<" | ">=" | "<="
    value: FormFieldValue
  }
  value: boolean
} & ComponentFilterProps

type DateFilterProps<Item extends Record<string, any>> = Pick<
  DatePickerProps,
  "value" | "includeEndOfDay"
> & {
  type: "date"
  operator: ">=" | "<="
  field: keyof Item
} & ComponentFilterProps

type ClientFiltersConfig<RawItem extends RawDataListItem> =
  | Omit<SelectFilterProps<RawItem["metadata"]>, "value">
  | Omit<ToggleFilterProps<RawItem["metadata"]>, "value">
  | Omit<DateFilterProps<RawItem["metadata"]>, "value">

type ServerFiltersConfig<Document extends DocumentData> =
  | Omit<SelectFilterProps<Document>, "value">
  | Omit<ToggleFilterProps<Document>, "value">
  | Omit<DateFilterProps<Document>, "value">

export type FiltersConfig<
  Item extends ServerSideFetching extends true ? DocumentData : RawDataListItem,
  ServerSideFetching extends boolean = false
> = ServerSideFetching extends true
  ? ServerFiltersConfig<Extract<Item, DocumentData>>[]
  : ClientFiltersConfig<Extract<Item, RawDataListItem>>[]

type ClientFiltersState<RawItem extends RawDataListItem> =
  | SelectFilterProps<RawItem["metadata"]>
  | ToggleFilterProps<RawItem["metadata"]>
  | DateFilterProps<RawItem["metadata"]>

type ServerFiltersState<Document extends DocumentData> =
  | SelectFilterProps<Document>
  | ToggleFilterProps<Document>
  | DateFilterProps<Document>

export type FiltersState<
  Item extends ServerSideFetching extends true ? DocumentData : RawDataListItem,
  ServerSideFetching extends boolean
> = ServerSideFetching extends true
  ? ServerFiltersState<Extract<Item, DocumentData>>[]
  : ClientFiltersState<Extract<Item, RawDataListItem>>[]

export type QueryContext<
  Item extends ServerSideFetching extends true ? DocumentData : RawDataListItem,
  ServerSideFetching extends boolean
> = QueryFunctionContext<
  (string | FiltersState<Item, ServerSideFetching>)[],
  number | undefined
>

export type FetchItems<
  Item extends RawDataListItem,
  FilterItem extends ServerSideFetching extends true
    ? DocumentData
    : RawDataListItem,
  ServerSideFetching extends boolean
> = (
  queryContext?: QueryContext<FilterItem, ServerSideFetching>
) => Promise<Item[]>

export type OpenEditModalProps<RawItem extends RawDataListItem> = {
  item: RawItem
  onSuccess: (newItem: RawItem) => void
}
export type OpenEditModal<RawItem extends RawDataListItem> = (
  props: OpenEditModalProps<RawItem>
) => void
