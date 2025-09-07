import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"

import { createUser, updateUser } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { closeModal } from "@/redux/modalSlice"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  userCreateFields,
  type UserCreateData,
  type UserEditData
} from "@/shared/forms/forms.const"

export type UserFormProps = {
  user?: UserEditData
}

export const UserForm = ({ user }: UserFormProps) => {
  const isEdit = !!user
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const title = isEdit ? "Edit user" : "Create user"
  const submitLabel = isEdit ? "Save" : "Create"

  const fields = extendFormFields({
    fieldsSchema: userCreateFields,
    additionalFieldsProps: {
      email: {
        label: "Email",
        defaultValue: user?.email
      },
      firstName: {
        label: "First Name",
        defaultValue: user?.firstName
      },
      lastName: {
        label: "Last Name",
        defaultValue: user?.lastName
      },
      birthDate: {
        label: "Birth Date",
        defaultValue: user?.birthDate
      },
      role: {
        label: "Role",
        options: ["Manager", "Driver"],
        defaultValue: user?.role
      },
      dbsUpdate: {
        label: "DBS Update",
        defaultValue: user?.dbsUpdate
      },
      isTaxiDriver: {
        label: "Is Taxi Driver",
        defaultValue: user?.isTaxiDriver
      },
      badgeNumber: {
        label: "Badge Number",
        defaultValue: user?.badgeNumber
      },
      badgeExpirationDate: {
        label: "Badge Expiration Date",
        defaultValue: user?.badgeExpirationDate
      },
      isPSVDriver: {
        label: "Is PSV Driver",
        defaultValue: user?.isPSVDriver
      }
    }
  })

  const action = async (data: UserCreateData) => {
    const { message } = isEdit
      ? await updateUser({ ...user, ...data })
      : await createUser(data)

    await queryClient.invalidateQueries({ queryKey: ["users"] })

    toast.success(message)
    dispatch(closeModal())
  }

  return (
    <Form
      containerClassName="p-0 border-none"
      title={title}
      action={action}
      submitLabel={submitLabel}
      fields={fields}
    />
  )
}
