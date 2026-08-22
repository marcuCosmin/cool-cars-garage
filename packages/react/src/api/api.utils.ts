import { fileUploadFieldName } from "@/globals/requests/requests.const"

import { executeApiRequest } from "./api.config"

import type {
  UserEditData,
  UserCreateData,
  SignUpData,
  ResolveDefectFields
} from "@/globals/forms/forms.const"
import type {
  DeleteUserQueryParams,
  UserActiveStateUpdatePayload,
  ReiniviteUserPayload,
  FileUploadQuery,
  ResolveFaultParams,
  ResolveIncidentParams,
  ExportableResources,
  ExportPayload
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

type ExportResourceProps<Resource extends ExportableResources> = {
  resourceId: Resource
} & ExportPayload<ExportableResources>
export const exportResource = <Resource extends ExportableResources>({
  resourceId,
  ...payload
}: ExportResourceProps<Resource>) =>
  executeApiRequest({
    path: `/exports/${resourceId}`,
    method: "POST",
    responseType: "blob",
    payload
  })
