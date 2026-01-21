import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import {
  EnvelopeArrowUp,
  PencilSquare,
  PersonCheckFill,
  PersonFillSlash,
  Trash3Fill
} from "react-bootstrap-icons"

import {
  deleteUser,
  getAllUsers,
  reinviteUser,
  updateUserActiveState
} from "@/api/utils"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { useAppMutation } from "@/hooks/useAppMutation"

import { DataView } from "@/components/core/DataView/DataView"

import type {
  OpenDataViewModal,
  DataListItemMetadataConfig,
  FiltersConfig,
  GetListItemActionsConfig
} from "@/components/core/DataView/DataView.model"
import { useCommonItemsActions } from "@/components/core/DataView/useCommonItemsActions"

import { capitalize } from "@/globals/utils/capitalize"

import type { RawUserListItem } from "@/globals/dataLists/dataLists.model"
import type { UserActiveStateUpdatePayload } from "@/globals/requests/requests.model"

const filtersConfig: FiltersConfig<RawUserListItem, false> = []

const usersDataItemsMetadataConfig: DataListItemMetadataConfig<RawUserListItem> =
  {
    email: { type: "text", label: "Email" },
    drivingLicenceNumber: { type: "text", label: "Licence Number" },
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
        categoryType: { type: "text", label: "Category Type" },
        activationTimestamp: { type: "date", label: "Activation Date" },
        expiryTimestamp: { type: "date", label: "Expiry Date" }
      }
    },
    creationTimestamp: { type: "date", label: "Join Date" },
    dbsUpdate: { type: "boolean", label: "DBS Update" },
    birthTimestamp: { type: "date", label: "Birth Date" },
    isTaxiDriver: { type: "boolean", label: "Is Taxi Driver" },
    badgeAuthority: { type: "text", label: "Badge Authority" },
    badgeNumber: { type: "text", label: "Badge Number" },
    badgeExpirationTimestamp: { type: "date", label: "Badge Expiration Date" },
    isActive: { type: "boolean", label: "Is Active" },
    isPSVDriver: { type: "boolean", label: "Is PSV Driver" },
    invitationPending: { type: "boolean", label: "Invitation Pending" }
  }

export const Users = () => {
  const { setModalProps } = useModalContext()
  const { handleItemDelete, handleItemEdit } =
    useCommonItemsActions<RawUserListItem>()
  const queryClient = useQueryClient()
  const { mutate: handleUserReinvitation } = useAppMutation({
    mutationFn: reinviteUser
  })

  const fetchItems = async () => {
    const users = await getAllUsers()

    return users.map(({ uid, firstName, lastName, role, ...user }) => ({
      id: uid,
      title: `${firstName} ${lastName}`,
      subtitle: capitalize(role),
      metadata: {
        ...user
      }
    }))
  }

  const handleUserActiveStateUpdate = async ({
    uid,
    isActive
  }: UserActiveStateUpdatePayload) => {
    await updateUserActiveState({ uid, isActive })

    queryClient.setQueriesData(
      {
        queryKey: [location.pathname],
        exact: false
      },
      (data: InfiniteData<RawUserListItem[]>) => {
        const pages = data.pages.map(page => {
          const index = page.findIndex(i => i.id === uid)

          if (index === -1) {
            return page
          }

          const updatedPage = page.slice()
          const updatedItem = updatedPage[index]
          updatedPage[index] = {
            ...updatedItem,
            metadata: { ...updatedItem.metadata, isActive }
          }

          return updatedPage
        })

        return {
          ...data,
          pages
        }
      }
    )
  }

  const getItemActionsConfig: GetListItemActionsConfig<
    RawUserListItem
  > = item => [
    {
      tooltip: "Edit User",
      Icon: PencilSquare,
      onClick: () =>
        setModalProps({
          type: "user",
          props: { item, onSuccess: handleItemEdit }
        }),
      hidden: !item.metadata.isActive
    },
    {
      tooltip: "Reinvite User",
      Icon: EnvelopeArrowUp,
      hidden: !item.metadata.invitationPending,
      onClick: () => handleUserReinvitation({ uid: item.id })
    },
    {
      tooltip: item.metadata.isActive ? "Disable User" : "Enable User",
      Icon: item.metadata.isActive ? PersonFillSlash : PersonCheckFill,
      hidden: item.metadata.invitationPending,
      onClick: () =>
        setModalProps({
          type: "confirmation",
          props: {
            text: `Are you sure you want to ${item.metadata.isActive ? "disable" : "enable"} user "${item.title}"?`,
            onConfirm: () =>
              handleUserActiveStateUpdate({
                uid: item.id,
                isActive: !item.metadata.isActive
              })
          }
        })
    },
    {
      tooltip: "Delete User",
      Icon: Trash3Fill,
      onClick: () =>
        setModalProps({
          type: "confirmation",
          props: {
            text: `Are you sure you want to delete user "${item.title}"?`,
            onConfirm: async () => {
              await deleteUser({ uid: item.id })
              handleItemDelete(item.id)
            }
          }
        })
    }
  ]

  const openDataViewModal: OpenDataViewModal<RawUserListItem> = props =>
    setModalProps({ type: "user", props })

  return (
    <DataView
      fetchItems={fetchItems}
      itemMetadataConfig={usersDataItemsMetadataConfig}
      filtersConfig={filtersConfig}
      openModal={openDataViewModal}
      getItemActionsConfig={getItemActionsConfig}
    />
  )
}
