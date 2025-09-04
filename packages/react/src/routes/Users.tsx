import { toast } from "react-toastify"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteUser, getAllUsers } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import { DataView } from "@/components/core/DataView/DataView"
import {
  type DataListItemMetadataConfig,
  type FiltersConfig
} from "@/components/core/DataView/DataView.model"
import { extendDataListItems } from "@/components/core/DataView/DataView.utils"
import { Loader } from "@/components/basic/Loader"

import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"
import type { User } from "@/shared/firestore/firestore.model"

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
    phoneNumber: { type: "text", label: "Phone Number" },
    dbsUpdate: { type: "boolean", label: "DBS Update" },
    birthDate: { type: "date", label: "Birth Date" },
    isTaxiDriver: { type: "boolean", label: "Is Taxi Driver" },
    badgeNumber: { type: "text", label: "Badge Number" },
    badgeExpirationDate: { type: "date", label: "Badge Expiration Date" }
  }

export const Users = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const { isLoading, data } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers
  })

  const onAddButtonClick = () => dispatch(openModal({ type: "user" }))

  const onItemDelete = async (uid: User["uid"]) => {
    const response = await deleteUser(uid)

    await queryClient.invalidateQueries({ queryKey: ["users"] })

    toast.success(response.message)
  }
  const onItemEdit = (uid: User["uid"]) => {
    const user = data?.users.find(user => user.id === uid) as RawUserListItem
    dispatch(openModal({ type: "user" }))
  }

  if (isLoading) {
    return <Loader enableOverlay text="Loading users data" />
  }

  return (
    <DataView
      data={extendDataListItems({
        items: data?.users || [],
        metadataConfig: usersDataItemsMetadataConfig
      })}
      filtersConfig={filtersConfig}
      onAddButtonClick={onAddButtonClick}
      onItemDelete={onItemDelete}
      onItemEdit={onItemEdit}
    />
  )
}
