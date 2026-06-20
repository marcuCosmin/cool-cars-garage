import { firebaseAuth } from "@/firebase/firebase.config"

import type {
  UserCreateData,
  SignUpData,
  UserEditData,
  SignUpFormData,
  ResolveDefectFields
} from "@/globals/forms/forms.const"
import type {
  ReiniviteUserPayload,
  UserActiveStateUpdatePayload,
  GetUsersResponse,
  CreateUserResponse,
  RegisterUserResponse,
  ResolveDefectResponse,
  FileUploadResponse,
  FileEntityType
} from "@/globals/requests/requests.model"
import type { fileUploadFieldName } from "@/globals/requests/requests.const"
import type { DistributiveOmit } from "@/globals/model"

const baseUrl = import.meta.env.VITE_API_URL

type ApiErrorResponse = {
  error: string
}

type ApiDataResponse = {
  message: string
}

type AuthTokenResponse = {
  authToken: string
}

type ApiConfig =
  | { path: "/users"; method: "GET"; response: GetUsersResponse }
  | {
      path: "/users"
      method: "POST"
      payload: UserCreateData
      response: CreateUserResponse
    }
  | {
      path: "/users"
      method: "PATCH"
      payload: UserEditData
      response: CreateUserResponse
    }
  | {
      path: "/users/register"
      method: "POST"
      payload: SignUpFormData
      response: RegisterUserResponse
    }
  | {
      path: "/users/create-from-invitation"
      method: "POST"
      payload: SignUpData
      response: ApiDataResponse
    }
  | {
      path: "/users/update-active-state"
      method: "POST"
      payload: UserActiveStateUpdatePayload
      response: ApiDataResponse
    }
  | {
      path: "/users/generate-auth-token"
      method: "GET"
      response: AuthTokenResponse
    }
  | {
      path: "/users/reinvite"
      method: "POST"
      payload: ReiniviteUserPayload
      response: ApiDataResponse
    }
  | {
      path: `/users?uid=${string}`
      method: "DELETE"
      response: ApiDataResponse
    }
  | {
      path: `/cars/faults/${string}`
      method: "PATCH"
      payload: ResolveDefectFields
      response: ResolveDefectResponse
    }
  | {
      path: `/cars/incidents/${string}`
      method: "PATCH"
      payload: ResolveDefectFields
      response: ResolveDefectResponse
    }
  | {
      path: `/cars/checks/exports?${string}`
      method: "GET"
      responseType: "blob"
      response: Blob
    }
  | {
      path: `/files?uploadType=${FileEntityType}&resourceId=${string}`
      method: "POST"
      payload: { [fileUploadFieldName]: File }
      isFormData: true
      response: FileUploadResponse
    }
  | {
      path: `/files?filePath=${string}`
      method: "GET"
      responseType: "blob"
      response: Blob
    }

type ExecuteApiRequestProps = DistributiveOmit<ApiConfig, "response">

type ApiResponse<P extends ExecuteApiRequestProps> = Extract<
  ApiConfig,
  Pick<P, "path" | "method">
>["response"]

type ApiRequestOptions = {
  method: ApiConfig["method"]
  headers?: Partial<{
    "Content-Type": "application/json"
    "Authorization": string
  }>
  body?: BodyInit
}

const getRequestOptions = async (request: ExecuteApiRequestProps) => {
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  const { method } = request

  const options: ApiRequestOptions = {
    method
  }

  if (idToken) {
    options.headers = { ...options.headers, Authorization: `Bearer ${idToken}` }
  }

  if (method === "GET" || method === "DELETE") {
    return options
  }

  if ("isFormData" in request && request.isFormData) {
    const formData = new FormData()
    Object.entries(request.payload).forEach(([key, value]) =>
      formData.append(key, value)
    )

    options.body = formData

    return options
  }

  if ("payload" in request) {
    options.headers = { ...options.headers, "Content-Type": "application/json" }
    options.body = JSON.stringify(request.payload)

    return options
  }
}

export const executeApiRequest = async <P extends ExecuteApiRequestProps>(
  props: P
): Promise<ApiResponse<P>> => {
  const options = await getRequestOptions(props)

  const response = await fetch(`${baseUrl}${props.path}`, options)

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse
    throw new Error(errorData.error)
  }

  if ("responseType" in props && props.responseType === "blob") {
    return (await response.blob()) as ApiResponse<P>
  }

  return (await response.json()) as ApiResponse<P>
}
