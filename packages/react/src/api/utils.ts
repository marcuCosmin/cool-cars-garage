import { executeApiRequest } from "./config"

import type {
  UserEditData,
  UserCreateData,
  SignUpData
} from "@/shared/forms/forms.const"
import type { RawUserListItem } from "@/shared/dataLists/dataLists.model"
import type {
  MarkFaultsAsResolvedPayload,
  MarkIncidentAsResolvedPayload,
  MarkIncidentAsResolvedResponse
} from "@/shared/requests/requests.model"

type GetAllUsersResponse = {
  usersList: RawUserListItem[]
}
export const getAllUsers = async () => {
  const response = await executeApiRequest<GetAllUsersResponse>({
    path: "/users",
    method: "GET"
  })

  return response.usersList
}

type GetAuthTokenResponse = {
  authToken: string
}
export const getAuthToken = () =>
  executeApiRequest<GetAuthTokenResponse>({
    path: "/users/generate-auth-token",
    method: "GET"
  })

type CreateUserFromInvitationResponse = {
  authToken: string
}

export const createUserFromInvitation = (payload: SignUpData) =>
  executeApiRequest<CreateUserFromInvitationResponse>({
    path: "/users/create-from-invitation",
    method: "POST",
    payload
  })

export const createUser = (payload: UserCreateData) =>
  executeApiRequest({
    path: "/users",
    method: "POST",
    payload
  })

type DeleteUserProps = {
  id: RawUserListItem["id"]
  email?: RawUserListItem["metadata"]["email"]
}

export const deleteUser = ({ id, email }: DeleteUserProps) =>
  executeApiRequest({
    path: `/users?uid=${id}&email=${email}`,
    method: "DELETE"
  })

export const updateUser = (payload: UserEditData) =>
  executeApiRequest({
    path: "/users",
    method: "PUT",
    payload
  })

export const markFaultsAsResolved = (payload: MarkFaultsAsResolvedPayload) =>
  executeApiRequest({
    path: "/cars/checks/faults",
    method: "PATCH",
    payload
  })

export const markIncidentAsResolved = (
  payload: MarkIncidentAsResolvedPayload
) =>
  executeApiRequest<MarkIncidentAsResolvedResponse>({
    path: "/cars/checks/incidents",
    method: "PATCH",
    payload
  })
