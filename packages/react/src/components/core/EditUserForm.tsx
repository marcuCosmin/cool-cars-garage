import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

import { updateUser } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { closeModal } from "@/redux/modalSlice"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  editUserFormFields,
  type EditUserFormData
} from "@/shared/forms/forms.const"
import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"

export type EditUserFormProps = {
  user: RawUserListItem
}

export const EditUserForm = ({ user }: EditUserFormProps) => {
  const { subtitle, metadata } = user
  const fields = extendFormFields({
    fieldsSchema: editUserFormFields,
    additionalFieldsProps: {
      email: {
        label: "Email",
        defaultValue: metadata.email
      },
      role: {
        label: "Role",
        options: ["Admin", "Manager", "Driver"],
        defaultValue: subtitle
      },
      dbsUpdate: {
        label: "DBS Update",
        defaultValue: metadata.dbsUpdate
      },
      isTaxiDriver: {
        label: "Is Taxi Driver",
        defaultValue: metadata.isTaxiDriver
      },
      badgeNumber: {
        label: "Badge Number",
        defaultValue: metadata.badgeNumber
      },
      badgeExpirationDate: {
        label: "Badge Expiration Date",
        defaultValue: metadata.badgeExpirationDate
      }
    }
  })
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  const action = async (data: EditUserFormData) => {
    const { message } = await updateUser({ ...data, uid: user.id })

    await queryClient.invalidateQueries({ queryKey: ["users"] })

    toast.success(message)
    dispatch(closeModal())
  }

  return (
    <Form
      containerClassName="p-0 border-none"
      title="Edit user"
      action={action}
      submitLabel="Edit"
      fields={fields}
    />
  )
}
