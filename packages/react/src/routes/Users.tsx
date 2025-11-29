import { deleteUser, getAllUsers } from "@/api/utils"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { DataView } from "@/components/core/DataView/DataView"
import type {
  OpenDataViewModal,
  DataListItemMetadataConfig,
  FiltersConfig
} from "@/components/core/DataView/DataView.model"

import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"

const filtersConfig: FiltersConfig<RawUserListItem, false> = []

const usersDataItemsMetadataConfig: DataListItemMetadataConfig<RawUserListItem> =
  {
    email: { type: "text", label: "Email" },
    drivingLicenceNumber: { type: "text", label: "Driving Licence Number" },
    penaltyPoints: { type: "text", label: "Penalty Points" },
    licenceType: { type: "text", label: "Licence Type" },
    licenceStatus: { type: "text", label: "Licence Status" },
    cpcs: {
      type: "collapsible",
      label: "CPCs",
      fields: {
        lgvExpiryTimestamp: { type: "date", label: "LGV Expiry Date" },
        pcvExpiryTimestamp: { type: "date", label: "PCV Expiry Date" }
      }
    },
    tachoCards: {
      type: "collapsible",
      label: "Tacho Cards",
      fields: {
        cardNumber: { type: "text", label: "Card Number" },
        cardExpiryTimestamp: { type: "date", label: "Card Expiry Date" }
      }
    },
    entitlements: {
      type: "collapsible",
      label: "Entitlements",
      fields: {
        categoryCode: { type: "text", label: "Category Code" },
        categoryLegalLiteral: { type: "text", label: "Category Legal Literal" },
        categoryType: { type: "text", label: "Category Type" },
        activationTimestamp: { type: "date", label: "Activation Date" },
        expiryTimestamp: { type: "date", label: "Expiry Date" }
      }
    },
    creationTimestamp: { type: "date", label: "Join Date" },
    dbsUpdate: { type: "boolean", label: "DBS Update" },
    birthTimestamp: { type: "date", label: "Birth Date" },
    isTaxiDriver: { type: "boolean", label: "Is Taxi Driver" },
    badgeNumber: { type: "text", label: "Badge Number" },
    badgeExpirationTimestamp: { type: "date", label: "Badge Expiration Date" },
    isActive: { type: "boolean", label: "Is Active" },
    isPSVDriver: { type: "boolean", label: "Is PSV Driver" },
    invitationPending: { type: "boolean", label: "Invitation Pending" }
  }

export const Users = () => {
  const { setModalProps } = useModalContext()

  const deleteItem = async ({ id, metadata }: RawUserListItem) => {
    await deleteUser({
      id,
      email: metadata.email
    })
  }

  const openDataViewModal: OpenDataViewModal<RawUserListItem> = props =>
    setModalProps({ type: "user", props })

  return (
    <DataView
      fetchItems={getAllUsers}
      itemMetadataConfig={usersDataItemsMetadataConfig}
      filtersConfig={filtersConfig}
      openModal={openDataViewModal}
      deleteItem={deleteItem}
    />
  )
}
