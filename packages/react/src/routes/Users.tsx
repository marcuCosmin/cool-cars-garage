import { UserPlus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { useReduxSelector } from "../redux/config"

import { Loader } from "../components/basic/Loader"
import { UserCard } from "../components/core/UserCard/UserCard"
import { InviteUserForm } from "../components/core/InviteUserForm"
import { ActionModal } from "../components/core/ActionModal"

import { fetchUsers, getAuthToken } from "../api/users"

export const Users = () => {
  const { user } = useReduxSelector(state => state.userReducer)

  const onButtonClick = async () => {
    const idToken = await user.getIdToken()
    const authToken = await getAuthToken(idToken)

    window.location.href = `coolcarsreports://?authToken=${authToken}`
  }

  const queryFn = async () => {
    const idToken = await user.getIdToken()
    const data = await fetchUsers(idToken)

    return data.users
  }

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn
  })

  if (isLoading) {
    return <Loader text="Loading users data" />
  }

  return (
    <div>
      <ActionModal
        buttonContent={
          <UserPlus
            className="fill-secondary dark:fill-primary bg-primary dark:bg-secondary rounded-full p-1.5"
            width={40}
            height={40}
          />
        }
      >
        <InviteUserForm />
      </ActionModal>

      <ul className="flex flex-wrap gap-4 w-full max-w-4xl p-5">
        {users.map(user => (
          <UserCard key={user.uid} {...user} />
        ))}
      </ul>

      <button type="button" onClick={onButtonClick}>
        Auth
      </button>
    </div>
  )
}
