import { executeApiRequest } from "./config"

import type {
  UserEditData,
  UserCreateData,
  SignUpData
} from "@/shared/forms/forms.const"
import type {
  MarkFaultsAsResolvedPayload,
  MarkIncidentAsResolvedPayload,
  MarkDefectAsResolvedResponse,
  CarsCheckExportURLQuery,
  CreateUserResponse,
  RegisterUserResponse,
  DeleteUserQueryParams,
  GetUsersResponse,
  UserActiveStateUpdatePayload,
  ReiniviteUserPayload
} from "@/shared/requests/requests.model"

export const getAllUsers = async () => {
  const response = await executeApiRequest<GetUsersResponse>({
    path: "/users",
    method: "GET"
  })

  return response.users
}

type GetAuthTokenResponse = {
  authToken: string
}
export const getAuthToken = () =>
  executeApiRequest<GetAuthTokenResponse>({
    path: "/users/generate-auth-token",
    method: "GET"
  })

export const registerUser = (payload: SignUpData) =>
  executeApiRequest<RegisterUserResponse>({
    path: "/users/register",
    method: "POST",
    payload
  })

export const createUser = (payload: UserCreateData) =>
  executeApiRequest<CreateUserResponse>({
    path: "/users",
    method: "POST",
    payload
  })

export const deleteUser = ({ uid }: DeleteUserQueryParams) =>
  executeApiRequest({
    path: `/users?uid=${uid}`,
    method: "DELETE"
  })

export const updateUser = (payload: UserEditData) =>
  executeApiRequest<CreateUserResponse>({
    path: "/users",
    method: "PATCH",
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

export const updateUserActiveState = async (
  payload: UserActiveStateUpdatePayload
) =>
  await executeApiRequest({
    path: "/users/update-active-state",
    method: "POST",
    payload
  })

export const reinviteUser = async (payload: ReiniviteUserPayload) =>
  await executeApiRequest({
    path: "/users/reinvite",
    method: "POST",
    payload
  })
