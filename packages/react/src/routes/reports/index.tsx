import { useQuery } from "@tanstack/react-query"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import {
  getFirestoreCollectionChunks,
  getFirestoreDocs
} from "@/firebase/utils"

import { Loader } from "@/components/basic/Loader"
import { DataView } from "@/components/core/DataView/DataView"
import {
  FiltersConfig,
  type DataListItemMetadataConfig,
  type FetchItems
} from "@/components/core/DataView/DataView.model"

import type { CheckRawListItem } from "@/shared/dataLists/dataLists.model"
import type {
  CarDoc,
  CheckDoc,
  DocWithID,
  UserDoc
} from "@/shared/firestore/firestore.model"

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
  const dispatch = useAppDispatch()
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/users-docs"],
    queryFn: () => getFirestoreDocs<UserDoc>({ collectionId: "users" }),
    staleTime: Infinity
  })
  const { data: cars, isLoading: isLoadingCars } = useQuery({
    queryKey: ["/cars-docs"],
    queryFn: () => getFirestoreDocs<CarDoc>({ collectionId: "cars" }),
    staleTime: Infinity
  })

  if (isLoadingUsers || isLoadingCars) {
    return <Loader enableOverlay />
  }

  if (!users || !cars) {
    return <div></div>
  }

  const filtersConfig: FiltersConfig<CheckDoc, true> = [
    {
      label: "Car ID",
      field: "carId",
      type: "select",
      options: cars.map(({ id }) => ({ label: id, value: id }))
    },
    {
      label: "Driver",
      field: "driverId",
      type: "select",
      options: users.map(({ firstName, lastName, id }) => ({
        label: `${firstName} ${lastName}`,
        value: id
      }))
    },
    {
      label: "Start Date",
      field: "creationTimestamp",
      operator: ">=",
      type: "date"
    },
    {
      label: "End Date",
      field: "creationTimestamp",
      operator: "<=",
      type: "date",
      includeEndOfDay: true
    },
    {
      label: "Has Faults",
      filterOptions: {
        field: "faultsCount",
        operator: ">",
        value: 0
      },
      type: "toggle"
    },
    {
      label: "Has Unresolved Faults",
      filterOptions: {
        field: "hasUnresolvedFaults",
        operator: "==",
        value: true
      },
      type: "toggle"
    },
    {
      label: "Has Incidents",
      filterOptions: {
        field: "incidentsCount",
        operator: ">",
        value: 0
      },
      type: "toggle"
    },
    {
      label: "Has Unresolved Incidents",
      filterOptions: {
        field: "hasUnresolvedIncidents",
        operator: "==",
        value: true
      },
      type: "toggle"
    }
  ]

  const fetchItems: FetchItems<
    CheckRawListItem,
    CheckDoc,
    true
  > = async queryContext => {
    const checks = await getFirestoreCollectionChunks<CheckDoc>({
      collectionId: "checks",
      queryContext: queryContext!
    })

    return checks.map(check => {
      const displayedOdoReading = `${check.odoReading.value} ${
        check.odoReading.unit
      }`

      const userData = users.find(
        user => user.id === check.driverId
      ) as DocWithID<UserDoc>
      const { firstName, lastName } = userData
      const driver = `${firstName} ${lastName}`

      return {
        id: check.id,
        title: "",
        subtitle: check.carId,
        metadata: {
          creationTimestamp: check.creationTimestamp,
          odoReading: displayedOdoReading,
          driver,
          faultsCount: check.faultsCount,
          hasUnresolvedFaults: check.hasUnresolvedFaults,
          incidentsCount: check.incidentsCount,
          hasUnresolvedIncidents: check.hasUnresolvedIncidents
        }
      }
    })
  }

  const onBulkExportClick = () =>
    dispatch(openModal({ type: "checks-bulk-export" }))

  return (
    <div>
      <div className="p-5">
        <button type="button" className="w-fit" onClick={onBulkExportClick}>
          Bulk Export
        </button>
      </div>
      <DataView
        showSearch={false}
        filtersConfig={filtersConfig}
        fetchItems={fetchItems}
        itemDetailedViewBasePath="/reports"
        itemMetadataConfig={checkDataListItemMetadataConfig}
        serverSideFetching
      />
    </div>
  )
}
