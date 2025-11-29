import { toast } from "react-toastify"

import { inviteUser, updateUser } from "@/api/utils"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { Form } from "@/components/basic/Form/Form"
import { type OpenDataViewModalProps } from "@/components/core/DataView/DataView.model"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  userInviteFields,
  type UserInviteData
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
    fieldsSchema: userInviteFields,
    additionalFieldsProps: {
      drivingLicenceNumber: {
        label: "Driving Licence Number",
        defaultValue: user?.drivingLicenceNumber
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

  const action = async (data: UserInviteData) => {
    const { message } = isEdit
      ? await updateUser({ ...user, ...data })
      : await inviteUser(data)

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
