import type { FieldValue } from "../../../models"

export type Data = Record<
  string,
  Record<string, FieldValue> & {
    title: string
    subtitle: string
  }
>

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

type ToggleFilterProps = {
  type: "toggle"
  filterFn: (item: Record<string, FieldValue>) => boolean
  value: boolean
}

export type FiltersConfig = Record<
  string,
  Omit<SelectFilterProps, "value"> | Omit<ToggleFilterProps, "value">
>

export type FiltersState = Record<string, SelectFilterProps | ToggleFilterProps>
