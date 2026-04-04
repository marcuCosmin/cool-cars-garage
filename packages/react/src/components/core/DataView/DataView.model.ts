import type { QueryFunctionContext } from "@tanstack/react-query"
import type { Icon } from "react-bootstrap-icons"

import type { DocumentData } from "firebase/firestore"

import type { SelectProps } from "@/components/basic/Select"
import type { DatePickerProps } from "@/components/basic/DatePicker"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"
import type { FormFieldValue } from "@/globals/forms/forms.models"

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

export type PrimitiveMetadata =
  | ItemTextMetadata
  | ItemBooleanMetadata
  | ItemDateMetadata
  | ItemLinkMetadata

type ItemListBase = {
  type: "list"
  label: string
}

type ItemListMetadataConfig = ItemListBase & {
  fields: Record<string, Omit<PrimitiveMetadata, "value">>
}

export type ItemListMetadata = ItemListBase & {
  fields: Record<string, PrimitiveMetadata>[]
}

type ItemMetadataConfig =
  | Omit<PrimitiveMetadata, "value">
  | ItemListMetadataConfig

export type ItemMetadata = PrimitiveMetadata | ItemListMetadata

export type DataListItemMetadataConfig<RawItem extends RawDataListItem> =
  Required<{
    [key in keyof RawItem["metadata"]]: ItemMetadataConfig
  }>

export type DataListItemActionProps = {
  Icon: Icon
  tooltip: string
  hidden?: boolean
  onClick: () => void
}

export type DataListItemActionsConfig = {
  isDisplayedAsDropdown?: boolean
  items: DataListItemActionProps[]
}

export type GetDataListItemActionsConfig<RawItem extends RawDataListItem> = (
  item: RawItem
) => DataListItemActionsConfig

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

type SelectFilterProps<Item extends Record<string, any>> = Pick<
  SelectProps,
  "options" | "isLoading" | "disabled"
> & {
  type: "select"
  value: string[]
  field: Extract<keyof Item, string>
} & ComponentFilterProps

export type FilterOperator = "==" | "!=" | ">" | "<" | ">=" | "<="

type ToggleFilterProps<Item extends Record<string, any>> = {
  type: "toggle"
  filterOptions: {
    field: Extract<keyof Item, string>
    operator: FilterOperator
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
  field: Extract<keyof Item, string>
} & ComponentFilterProps

type ClientFiltersConfig<RawItem extends RawDataListItem> =
  | Omit<SelectFilterProps<RawItem["metadata"]>, "value">
  | Omit<ToggleFilterProps<RawItem["metadata"]>, "value">
  | Omit<DateFilterProps<RawItem["metadata"]>, "value">

type ServerFiltersConfig<Document extends DocumentData> =
  | Omit<SelectFilterProps<Document>, "value">
  | Omit<ToggleFilterProps<Document>, "value">
  | Omit<DateFilterProps<Document>, "value">

export type FilterItem<ServerSideFetching extends boolean> =
  ServerSideFetching extends true ? DocumentData : RawDataListItem

export type FiltersConfig<
  Item extends FilterItem<ServerSideFetching>,
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
  Item extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
> = ServerSideFetching extends true
  ? ServerFiltersState<Extract<Item, DocumentData>>[]
  : ClientFiltersState<Extract<Item, RawDataListItem>>[]

export type QueryContext<
  Item extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
> = QueryFunctionContext<
  (string | FiltersState<Item, ServerSideFetching>)[],
  number | undefined
>

export type FetchItems<
  Item extends RawDataListItem,
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
> = (queryContext?: QueryContext<Filter, ServerSideFetching>) => Promise<Item[]>

export type OpenDataViewModalProps<RawItem extends RawDataListItem> = {
  item?: RawItem
  onSuccess: (newItem: RawItem) => void
}
export type OpenDataViewModal<RawItem extends RawDataListItem> = (
  props: OpenDataViewModalProps<RawItem>
) => void
