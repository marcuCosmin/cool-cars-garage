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
  MarkDefectAsResolvedResponse,
  CarsCheckExportURLQuery
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

export const inviteUser = (payload: UserCreateData) =>
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
  executeApiRequest<MarkDefectAsResolvedResponse>({
    path: "/cars/checks/faults",
    method: "PATCH",
    payload
  })

export const markIncidentAsResolved = (
  payload: MarkIncidentAsResolvedPayload
) =>
  executeApiRequest<MarkDefectAsResolvedResponse>({
    path: "/cars/checks/incidents",
    method: "PATCH",
    payload
  })

const getExportChecksQueryParams = (payload: CarsCheckExportURLQuery) => {
  const params = new URLSearchParams()

  params.append("type", payload.type)

  if (payload.type === "individual") {
    params.append("checkId", payload.checkId)

    return params.toString()
  }

  if (payload.type === "bulk") {
    if (payload.startTimestamp) {
      params.append("startTimestamp", payload.startTimestamp.toString())
    }

    if (payload.endTimestamp) {
      params.append("endTimestamp", payload.endTimestamp.toString())
    }
  }

  return params.toString()
}

export const exportChecks = async (payload: CarsCheckExportURLQuery) => {
  const queryParams = getExportChecksQueryParams(payload)

  const response = await executeApiRequest<Blob>({
    path: `/cars/checks/exports?${queryParams}`,
    method: "GET"
  })

  return response
}
