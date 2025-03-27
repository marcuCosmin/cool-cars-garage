import { useEffect, useState } from "react"
import { UserPlus } from "lucide-react"
import { useReduxSelector } from "../redux/config"

import { Loader } from "../components/basic/Loader"
import { UserCard } from "../components/core/UserCard/UserCard"
import { InviteUserForm } from "../components/core/InviteUserForm"
import { ActionModal } from "../components/core/ActionModal"

import { fetchUsers, type User } from "../api/users"

export const Users = () => {
  const { user } = useReduxSelector(state => state.userReducer)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  const onUserDelete = (uid: string) => {
    const newUsers = users.filter(user => user.uid !== uid)

    setUsers(newUsers)
  }

  useEffect(() => {
    ;(async () => {
      const idToken = await user.getIdToken()
      const data = await fetchUsers(idToken)

      setUsers(data.users)
      setLoading(false)
    })()
  }, [])

  if (loading) {
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
          <UserCard
            key={user.uid}
            {...user}
            onUserDelete={() => onUserDelete(user.uid)}
          />
        ))}
      </ul>
    </div>
  )
}
