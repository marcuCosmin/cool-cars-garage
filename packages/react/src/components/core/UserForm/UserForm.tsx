import { toast } from "react-toastify"

import { createUser, updateUser } from "@/api/utils"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Form } from "@/components/basic/Form/Form"
import { type OpenDataViewModalProps } from "@/components/core/DataView/DataView.model"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  UserEditData,
  userCreateFields,
  userEditFields,
  type UserCreateData
} from "@/shared/forms/forms.const"
import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"

import { getUserDataFromRawUserListItem } from "./UserForm.utils"

export type UserFormProps = OpenDataViewModalProps<RawUserListItem>

export const UserForm = ({ item, onSuccess }: UserFormProps) => {
  const { setModalProps } = useModalContext()
  const user = getUserDataFromRawUserListItem(item)
  const isEdit = !!user

  const title = isEdit ? "Edit user" : "Create user"
  const submitLabel = isEdit ? "Save" : "Create"

  const fields = extendFormFields({
    fieldsSchema: isEdit ? userEditFields : userCreateFields,
    additionalFieldsProps: {
      firstName: {
        label: "First Name",
        defaultValue: user?.firstName
      },
      lastName: {
        label: "Last Name",
        defaultValue: user?.lastName
      },
      email: {
        label: "Email",
        defaultValue: user?.email
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
      badgeExpirationTimestamp: {
        label: "Badge Expiration Date",
        defaultValue: user?.badgeExpirationTimestamp
      },
      badgeAuthority: {
        label: "Badge Authority",
        options: ["PSV", "Cornwall", "Wolverhampton", "Portsmouth", "Other"],
        defaultValue: user?.badgeAuthority
      },
      isPSVDriver: {
        label: "Is PSV Driver",
        defaultValue: user?.isPSVDriver
      }
    }
  })

  const action = async (data: UserCreateData | UserEditData) => {
    if (isEdit) {
      const { message } = await updateUser(data as UserEditData)

      const castedItem = item as RawUserListItem

      const { role, firstName, lastName, ...metadata } = data
      const [prevFirstName, prevLastName] = castedItem.title.split(" ")

      const newRawUserListItem: RawUserListItem = {
        ...castedItem,
        title: `${firstName || prevFirstName} ${lastName || prevLastName}`,
        subtitle: role || castedItem.subtitle,
        metadata: {
          ...castedItem.metadata,
          ...metadata
        }
      }

      onSuccess(newRawUserListItem)

      toast.success(message)
    } else {
      const { user } = await createUser(data as UserCreateData)

      const {
        firstName,
        lastName,
        role,
        uid,
        email,
        isActive,
        creationTimestamp
      } = user

      const newRawUserListItem: RawUserListItem = {
        title: `${firstName} ${lastName}`,
        subtitle: role,
        id: uid,
        metadata: {
          email,
          isActive,
          creationTimestamp,
          invitationPending: true
        }
      }

      if (role === "driver") {
        newRawUserListItem.metadata = {
          ...newRawUserListItem.metadata,
          ...user.metadata
        }
      }

      onSuccess(newRawUserListItem)
      toast.success("Invitation sent successfully!")
    }

    setModalProps(null)
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
