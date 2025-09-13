import { deleteUser, getAllUsers } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import { DataView } from "@/components/core/DataView/DataView"
import {
  type DataListItemMetadataConfig,
  type FiltersConfig,
  type OpenEditModal
} from "@/components/core/DataView/DataView.model"

import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"

const filtersConfig: FiltersConfig<RawUserListItem> = [
  {
    label: "Council",
    field: "council",
    type: "select",
    options: ["Wolverhampton", "Cornwall", "PSV", "Portsmouth", "Other"].map(
      option => ({ label: option, value: option })
    )
  }
]

const usersDataItemsMetadataConfig: DataListItemMetadataConfig<RawUserListItem> =
  {
    email: { type: "text", label: "Email" },
    creationTimestamp: { type: "date", label: "Join Date" },
    dbsUpdate: { type: "boolean", label: "DBS Update" },
    birthDate: { type: "date", label: "Birth Date" },
    isTaxiDriver: { type: "boolean", label: "Is Taxi Driver" },
    badgeNumber: { type: "text", label: "Badge Number" },
    badgeExpirationDate: { type: "date", label: "Badge Expiration Date" },
    isActive: { type: "boolean", label: "Is Active" },
    isPSVDriver: { type: "boolean", label: "Is PSV Driver" },
    invitationPending: { type: "boolean", label: "Invitation Pending" }
  }

export const Users = () => {
  const dispatch = useAppDispatch()

  const deleteItem = async ({ id, metadata }: RawUserListItem) => {
    await deleteUser({
      id,
      email: metadata.email
    })
  }

  const openEditModal: OpenEditModal<RawUserListItem> = editModalProps =>
    dispatch(openModal({ type: "user", props: editModalProps }))

  return (
    <DataView
      fetchItems={getAllUsers}
      itemMetadataConfig={usersDataItemsMetadataConfig}
      filtersConfig={filtersConfig}
      deleteItem={deleteItem}
      openEditModal={openEditModal}
    />
  )
}
