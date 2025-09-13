import { getChecksChunk } from "@/firebase/utils"

import { DataView } from "@/components/core/DataView/DataView"
import {
  type DataListItemMetadataConfig,
  type FetchItems
} from "@/components/core/DataView/DataView.model"

import type { CheckRawListItem } from "@/shared/dataLists/dataLists.model"

const checkDataListItemMetadataConfig: DataListItemMetadataConfig<CheckRawListItem> =
  {
    creationTimestamp: { type: "date", label: "Creation Date" },
    odoReading: { type: "text", label: "Odometer Reading" },
    driver: { type: "text", label: "Driver" },
    faultsCount: { type: "text", label: "Faults Count" },
    hasUnresolvedFaults: { type: "boolean", label: "Has Unresolved Faults" },
    incidentsCount: { type: "text", label: "Incidents Count" },
    hasUnresolvedIncidents: {
      type: "boolean",
      label: "Has Unresolved Incidents"
    }
  }

export const Reports = () => {
  const fetchItems: FetchItems<CheckRawListItem> = async queryContext => {
    const checks = await getChecksChunk(queryContext!)

    return checks.map(check => {
      const displayedOdoReading = `${check.odoReading.value} ${
        check.odoReading.unit
      }`

      return {
        id: check.id,
        title: "",
        subtitle: check.carId,
        metadata: {
          creationTimestamp: check.creationTimestamp,
          odoReading: displayedOdoReading,
          driver: check.driverId,
          faultsCount: check.faultsCount,
          hasUnresolvedFaults: check.hasUnresolvedFaults,
          incidentsCount: check.incidentsCount,
          hasUnresolvedIncidents: check.hasUnresolvedIncidents
        }
      }
    })
  }

  return (
    <DataView
      showSearch={false}
      filtersConfig={[]}
      fetchItems={fetchItems}
      itemMetadataConfig={checkDataListItemMetadataConfig}
      serverSideFetching
    />
  )
}
