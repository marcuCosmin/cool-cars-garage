import { getFirestoreDocs } from "@/firebase/utils"

import { DataView } from "@/components/core/DataView/DataView"
import type {
  DataListItemMetadataConfig,
  FiltersConfig
} from "@/components/core/DataView/DataView.model"

import type { RawCarListItem } from "@/globals/dataLists/dataLists.model"

const filtersConfig: FiltersConfig<RawCarListItem, false> = []

const carsDataItemsMetadataConfig: DataListItemMetadataConfig<RawCarListItem> =
  {
    make: { type: "text", label: "Make" },
    motStatus: { type: "text", label: "MOT Status" },
    roadTaxStatus: { type: "text", label: "Road Tax Status" },
    color: { type: "text", label: "Color" },
    fuelType: { type: "text", label: "Fuel Type" },
    co2Emissions: { type: "text", label: "CO2 Emissions" },
    engineCapacity: { type: "text", label: "Engine Capacity" },
    lastIssuedV5CTimestamp: { type: "date", label: "Last Issued V5C" },
    isOffRoad: { type: "boolean", label: "Off Road" },
    hasOutstandingRecall: { type: "boolean", label: "Outstanding Recall" },
    isRental: { type: "boolean", label: "Rental" },
    plateNumber: { type: "text", label: "Plate Number" },
    type: { type: "text", label: "Type" },
    motExpiryTimestamp: { type: "date", label: "MOT Expiry" },
    roadTaxExpiryTimestamp: { type: "date", label: "Road Tax Expiry" },
    insuranceExpiryTimestamp: { type: "date", label: "Insurance Expiry" },
    plateNumberExpiryTimestamp: { type: "date", label: "Plate Number Expiry" },
    safetyChecksExpiryTimestamp: {
      type: "date",
      label: "Safety Checks Expiry"
    },
    tachographExpiryTimestamp: { type: "date", label: "Tachograph Expiry" },
    wheelChairLiftExpiryTimestamp: {
      type: "date",
      label: "Wheel Chair Lift Expiry"
    },
    cornwallMotExpiryTimestamp: { type: "date", label: "Cornwall MOT Expiry" }
  }

const fetchItems = async (): Promise<RawCarListItem[]> => {
  const cars = await getFirestoreDocs({
    collectionId: "cars"
  })

  return cars.map(({ id, council, ...metadata }) => ({
    id,
    title: id,
    subtitle: council,
    metadata
  }))
}

export const Home = () => {
  return (
    <DataView
      filtersConfig={filtersConfig}
      fetchItems={fetchItems}
      itemMetadataConfig={carsDataItemsMetadataConfig}
    />
  )
}
