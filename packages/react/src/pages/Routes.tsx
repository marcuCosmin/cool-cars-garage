import { DataView } from "@/components/core/DataView/DataView"

export const Routes = () => {
  const fetchItems = () => {
    return {}
  }

  return (
    <DataView
      fetchItems={fetchItems}
      itemMetadataConfig={{}}
      filtersConfig={{}}
      openModal={openDataViewModal}
    />
  )
}
