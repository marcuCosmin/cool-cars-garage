import { type SelectProps } from "@/components/basic/Select"

import type { FormFieldValue } from "@/shared/forms/forms.models"

export type DefaultDataItem = Record<string, FormFieldValue> & {
  title: string
  badge: string
  id: string
}

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

type ToggleFilterProps<DataItem extends DefaultDataItem> = {
  type: "toggle"
  filterFn: (item: DataItem) => boolean
  value: boolean
} & ComponentFilterProps

export type FiltersConfig<DataItem extends DefaultDataItem> = (
  | Omit<SelectFilterProps, "value">
  | Omit<ToggleFilterProps<DataItem>, "value">
)[]

export type FiltersState<DataItem extends DefaultDataItem> = (
  | SelectFilterProps
  | ToggleFilterProps<DataItem>
)[]
