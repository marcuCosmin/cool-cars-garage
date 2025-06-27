import type { FieldValue } from "../../../models"

export type DefaultDataItem = Record<string, FieldValue> & {
  title: string
  subtitle: string
}

export type OnFilterChange = (props: {
  label: string
  value: string[] | boolean
}) => void

type SelectFilterProps = {
  type: "select"
  options: string[]
  value: string[]
  field: string
}

type ToggleFilterProps<DataItem extends DefaultDataItem> = {
  type: "toggle"
  filterFn: (item: DataItem) => boolean
  value: boolean
}

export type FiltersConfig<DataItem extends DefaultDataItem> = Record<
  string,
  Omit<SelectFilterProps, "value"> | Omit<ToggleFilterProps<DataItem>, "value">
>

export type FiltersState<DataItem extends DefaultDataItem> = Record<
  string,
  SelectFilterProps | ToggleFilterProps<DataItem>
>
