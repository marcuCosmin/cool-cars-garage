import type {
  FiltersConfig,
  FiltersState,
  ItemMetadata,
  DataListItemMetadataConfig,
  DataListItem
} from "./DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

export const parseSearchString = (searchString: string) =>
  searchString.trim().toLowerCase()

export const filtersConfigToState = <RawItem extends RawDataListItem>(
  filtersConfig: FiltersConfig<RawItem>
): FiltersState<RawItem> =>
  filtersConfig.map(filterProps => {
    const { type } = filterProps

    switch (type) {
      case "select": {
        return {
          ...filterProps,
          value: [] as string[]
        }
      }
      case "toggle": {
        return {
          ...filterProps,
          value: false
        }
      }
    }
  })

type ExtendDataListItemsProps<RawItem extends RawDataListItem> = {
  items: RawItem[]
  metadataConfig: DataListItemMetadataConfig<RawItem>
}

export const extendDataListItems = <RawItem extends RawDataListItem>({
  items,
  metadataConfig
}: ExtendDataListItemsProps<RawItem>) => {
  const extendedItems = items.map(item => {
    const { id, title, subtitle, metadata } = item

    const extendedMetadata = Object.entries(metadata).reduce(
      (acc, [key, value]) => {
        const castedKey = key as keyof DataListItemMetadataConfig<RawItem>
        const config = metadataConfig[castedKey]

        acc[castedKey] = { ...config, value } as ItemMetadata

        return acc
      },
      {} as DataListItem<RawItem>["metadata"]
    )

    return {
      id,
      title,
      subtitle,
      metadata: extendedMetadata
    }
  })

  return extendedItems
}

export const getParsedItemMetadataValue = ({ type, value }: ItemMetadata) => {
  if (!value) {
    return null
  }

  switch (type) {
    case "text":
      return value
    case "boolean":
      return value ? "Yes" : "No"
    case "date":
      return new Date(value).toLocaleDateString("en-GB")
    case "link":
      return value
    default:
      return null
  }
}
