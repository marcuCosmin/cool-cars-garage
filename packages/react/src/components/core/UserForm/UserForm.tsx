import { toast } from "react-toastify"

import { createUser, updateUser } from "@/api/utils"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Form } from "@/components/basic/Form/Form"
import { type OpenDataViewModalProps } from "@/components/core/DataView/DataView.model"

import {
  extendFormFields,
  type AdditionalFieldsProps
} from "@/utils/extendFormFields"

import {
  userCreateFields,
  type UserCreateData
} from "@/globals/forms/forms.const"
import type { RawUserListItem } from "@/globals/dataLists/dataLists.model"

import { getUserDataFromRawUserListItem } from "./UserForm.utils"

export type UserFormProps = OpenDataViewModalProps<RawUserListItem>

export const UserForm = ({ item, onSuccess }: UserFormProps) => {
  const { setModalProps } = useModalContext()
  const user = getUserDataFromRawUserListItem(item)
  const isEdit = !!user

  const title = isEdit ? "Edit user" : "Create user"
  const submitLabel = isEdit ? "Save" : "Create"

  const additionalFieldsProps: AdditionalFieldsProps<UserCreateData> = {
    drivingLicenceNumber: {
      label: "Driving Licence Number",
      defaultValue: user?.drivingLicenceNumber,
      disabled: !!user?.drivingLicenceNumber
    },
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
      defaultValue: user?.role?.toLowerCase()
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

  const fields = extendFormFields({
    fieldsSchema: userCreateFields,
    additionalFieldsProps
  })

  const action = async (data: UserCreateData) => {
    const {
      user: {
        firstName,
        lastName,
        role,
        uid,
        email,
        isActive,
        creationTimestamp,
        ...userMetadata
      }
    } = isEdit
      ? await updateUser({ ...data, uid: user!.uid })
      : await createUser(data as UserCreateData)

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
        ...userMetadata
      }
    }

    onSuccess(newRawUserListItem)
    toast.success("Invitation sent successfully!")

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
