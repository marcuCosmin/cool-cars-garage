import { useState } from "react"
import { toast } from "react-toastify"
import { Trash2, User as UserIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { useAppSelector } from "../../../redux/config"

import { UserField } from "./UserField"
import { Loader } from "../../basic/Loader"

import { deleteUser, type User } from "../../../api/users"

export const UserCard = ({
  email,
  displayName = "Test Displayname",
  phoneNumber,
  creationTime,
  lastSignInTime,
  uid,
  role
}: User) => {
  const user = useAppSelector(state => state.user)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const queryClient = useQueryClient()

  const onDeleteClick = () => setShowDeleteConfirmation(true)
  const onDeleteCancel = () => setShowDeleteConfirmation(false)
  const onDelete = async () => {
    try {
      setIsDeleteLoading(true)
      const idToken = await user.getIdToken()

      const error = await deleteUser({ idToken, uid })

      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["users"] })
        const currentUsers = queryClient.getQueryData<User[]>(["users"]) || []

        const newUsers = currentUsers.filter(user => user.uid !== uid)
        queryClient.setQueryData<User[]>(["users"], newUsers)

        setShowDeleteConfirmation(false)
        toast.success("User deleted successfully")
        return
      }

      toast.error(error)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      }

      toast.error("Failed to delete user: Unknown error occurred")
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <li className="relative flex flex-col w-full gap-4 p-5 max-w-sm bg-secondary dark:bg-primary shadow-primary dark:shadow-secondary shadow-sm rounded-md">
      {showDeleteConfirmation && (
        <div className="absolute top-0 right-0 flex flex-col gap-4 justify-center items-center w-full h-full rounded-md backdrop-blur-xs">
          <div className="font-bold text-md text-center">
            Are you sure you want to delete this user?
          </div>
          <div className="flex gap-4 w-1/2">
            <button className="p-1" type="button" onClick={onDelete}>
              Yes
            </button>
            <button className="p-1" type="button" onClick={onDeleteCancel}>
              No
            </button>
          </div>
        </div>
      )}

      {isDeleteLoading && <Loader enableOverlay />}

      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2">
          <UserIcon width={25} />
          {displayName}
        </h2>

        <p className="text-sm font-bold bg-primary dark:bg-secondary rounded-xl px-3 capitalize w-fit text-secondary dark:text-primary">
          {role}
        </p>

        <button
          type="button"
          className="bg-transparent w-fit p-0 text-primary dark:text-secondary"
          onClick={onDeleteClick}
        >
          <Trash2 width={18} />
        </button>
      </div>

      <hr />

      <div>
        <UserField icon="email" value={email} />
        {phoneNumber && <UserField icon="phoneNumber" value={phoneNumber} />}
      </div>

      <hr />

      <div className="text-xs">
        <UserField
          label="Creation time:"
          value={creationTime}
          level="secondary"
        />
        <UserField
          label="Last sign-in:"
          value={lastSignInTime}
          level="secondary"
        />
      </div>
    </li>
  )
}
