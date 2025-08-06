import { useQuery } from "@tanstack/react-query"

import { fetchUsers } from "@/api/users"

import { useAppDispatch } from "@/redux/config"
import { openModal } from "@/redux/modalSlice"

import { DataView } from "@/components/core/DataView/DataView"
import {
  DefaultDataItem,
  type FiltersConfig
} from "@/components/core/DataView/model"

import { Loader } from "@/components/basic/Loader"
import { firebaseAuth } from "@/firebase/config"

const filtersConfig: FiltersConfig<DefaultDataItem> = {
  Council: {
    field: "council",
    type: "select",
    options: ["Wolverhampton", "Cornwall", "PSV", "Portsmouth", "Other"]
  }
}

export const Users = () => {
  const dispatch = useAppDispatch()

  const queryFn = async () => {
    const idToken = await firebaseAuth.currentUser!.getIdToken()
    const data = await fetchUsers(idToken)

    return data.users
  }

  const { isLoading } = useQuery({
    queryKey: ["users"],
    queryFn
  })

  const onAddButtonClick = () => dispatch(openModal({ type: "invite-user" }))

  if (isLoading) {
    return <Loader enableOverlay text="Loading users data" />
  }

  return (
    <DataView
      initialData={{}}
      filtersConfig={filtersConfig}
      onAddButtonClick={onAddButtonClick}
      onItemDelete={() => ""}
      onItemEdit={() => ""}
    />
  )
}
