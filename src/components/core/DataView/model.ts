import type { FieldValue } from "../../../models"

export type Data = Record<
  string,
  Record<string, FieldValue> & {
    title: string
    subtitle: string
  }
>
export type FilterFn = (item: Record<string, FieldValue>) => boolean
export type FiltersConfig = Record<string, FilterFn>
export type FiltersState = Record<
  string,
  {
    active: boolean
    fn: FilterFn
  }
>
