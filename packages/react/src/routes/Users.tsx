import { useQuery } from "@tanstack/react-query"

import { getAllUsers } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import { DataView } from "@/components/core/DataView/DataView"
import {
  DefaultDataItem,
  type FiltersConfig
} from "@/components/core/DataView/DataView.model"

import { Loader } from "@/components/basic/Loader"

const filtersConfig: FiltersConfig<DefaultDataItem> = {
  Council: {
    field: "council",
    type: "select",
    options: ["Wolverhampton", "Cornwall", "PSV", "Portsmouth", "Other"]
  }
}

export const Users = () => {
  const dispatch = useAppDispatch()

  const { isLoading, data } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers
  })

  const onAddButtonClick = () => dispatch(openModal({ type: "invite-user" }))

  if (isLoading) {
    return <Loader enableOverlay text="Loading users data" />
  }

  return (
    <DataView
      initialData={parsedData}
      filtersConfig={filtersConfig}
      onAddButtonClick={onAddButtonClick}
      onItemDelete={() => ""}
      onItemEdit={() => ""}
    />
  )
}
