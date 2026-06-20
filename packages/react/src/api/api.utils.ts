import { fileUploadFieldName } from "@/globals/requests/requests.const"

import { executeApiRequest } from "./api.config"

import type {
  UserEditData,
  UserCreateData,
  SignUpData,
  ResolveDefectFields
} from "@/globals/forms/forms.const"
import type {
  CarsCheckExportURLQuery,
  DeleteUserQueryParams,
  UserActiveStateUpdatePayload,
  ReiniviteUserPayload,
  FileUploadQuery,
  ResolveFaultParams,
  ResolveIncidentParams
} from "@/globals/requests/requests.model"

export const getAllUsers = async () => {
  const response = await executeApiRequest({
    path: "/users",
    method: "GET"
  })

  return response.users
}

export const getAuthToken = () =>
  executeApiRequest({
    path: "/users/generate-auth-token",
    method: "GET"
  })

export const registerUser = (payload: SignUpData) =>
  executeApiRequest({
    path: "/users/register",
    method: "POST",
    payload
  })

export const createUser = (payload: UserCreateData) =>
  executeApiRequest({
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
  executeApiRequest({
    path: "/users",
    method: "PATCH",
    payload
  })

type ResolveFaultProps = ResolveFaultParams & ResolveDefectFields
export const resolveFault = ({ faultId, ...payload }: ResolveFaultProps) =>
  executeApiRequest({
    path: `/cars/faults/${faultId}`,
    method: "PATCH",
    payload
  })

type ResolveIncidentProps = ResolveIncidentParams & ResolveDefectFields
export const resolveIncident = ({
  incidentId,
  ...payload
}: ResolveIncidentProps) =>
  executeApiRequest({
    path: `/cars/incidents/${incidentId}`,
    method: "PATCH",
    payload
  })

type UploadFileProps = FileUploadQuery & {
  file: File
}
export const uploadFile = ({ file, uploadType, resourceId }: UploadFileProps) =>
  executeApiRequest({
    path: `/files?uploadType=${uploadType}&resourceId=${resourceId}`,
    method: "POST",
    payload: { [fileUploadFieldName]: file },
    isFormData: true
  })

export const getFile = (filePath: string) =>
  executeApiRequest({
    path: `/files?filePath=${encodeURIComponent(filePath)}`,
    method: "GET",
    responseType: "blob"
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

  const response = await executeApiRequest({
    path: `/cars/checks/exports?${queryParams}`,
    method: "GET",
    responseType: "blob"
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
