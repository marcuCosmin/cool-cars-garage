import { toast } from "react-toastify"

import { createUser, updateUser } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { closeModal } from "@/redux/modalSlice"

import { Form } from "@/components/basic/Form/Form"
import { type OpenEditModalProps } from "@/components/core/DataView/DataView.model"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  userCreateFields,
  type UserCreateData
} from "@/shared/forms/forms.const"
import { RawUserListItem } from "@/shared/dataLists/dataLists.model"
import { getUserDataFromRawUserListItem } from "./UserForm.utils"

export type UserFormProps = Pick<
  OpenEditModalProps<RawUserListItem>,
  "onSuccess"
> &
  Partial<Pick<OpenEditModalProps<RawUserListItem>, "item">>

export const UserForm = ({ item, onSuccess }: UserFormProps) => {
  const user = getUserDataFromRawUserListItem(item)
  const isEdit = !!user

  const dispatch = useAppDispatch()

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

    const newRawUserListItem: RawUserListItem = {
      title: `${data.firstName} ${data.lastName}`,
      subtitle: data.role,
      id: user?.uid as string,
      metadata: {
        email: data.email,
        birthDate: data.birthDate,
        dbsUpdate: data.dbsUpdate,
        isTaxiDriver: data.isTaxiDriver,
        badgeNumber: data.badgeNumber,
        badgeExpirationDate: data.badgeExpirationDate,
        isPSVDriver: data.isPSVDriver,
        creationTimestamp: item?.metadata.creationTimestamp as number,
        isActive: item?.metadata.isActive as boolean,
        invitationPending: item?.metadata.invitationPending
      }
    }

    onSuccess(newRawUserListItem)

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
