import { firebaseAuth } from "@/firebase/config"

import type {
  UserCreateData,
  SignUpData,
  UserEditData,
  SignUpFormData
} from "@/shared/forms/forms.const"
import type {
  MarkFaultsAsResolvedPayload,
  MarkIncidentAsResolvedPayload,
  ReiniviteUserPayload,
  UserActiveStateUpdatePayload
} from "@/shared/requests/requests.model"

const baseUrl = import.meta.env.VITE_API_URL

type ExecuteApiRequestProps =
  | {
      method: "GET"
      path: "/users"
    }
  | {
      path: "/users"
      method: "PATCH"
      payload: UserEditData
    }
  | {
      path: "/users/register"
      method: "POST"
      payload: SignUpFormData
    }
  | {
      path: "/users"
      method: "POST"
      payload: UserCreateData
    }
  | {
      path: "/users/update-active-state"
      method: "POST"
      payload: UserActiveStateUpdatePayload
    }
  | {
      path: "/users/generate-auth-token"
      method: "GET"
    }
  | {
      path: "/users/create-from-invitation"
      method: "POST"
      payload: SignUpData
    }
  | {
      path: `/users?uid=${string}`
      method: "DELETE"
    }
  | {
      path: "/cars/checks/faults"
      method: "PATCH"
      payload: MarkFaultsAsResolvedPayload
    }
  | {
      path: "/cars/checks/incidents"
      method: "PATCH"
      payload: MarkIncidentAsResolvedPayload
    }
  | {
      path: "/users/reinvite"
      method: "POST"
      payload: ReiniviteUserPayload
    }
  | {
      path: `/cars/checks/exports?${string}`
      method: "GET"
    }

type ApiErrorResponse = {
  error: string
}

type ApiDataResponse = {
  message: string
}

type ApiRequestOptions = {
  method: ExecuteApiRequestProps["method"]
  headers: {
    "Content-Type": "application/json"
    "Authorization"?: string
  }
  body?: BodyInit
}

export const usersUrl = `${baseUrl}/users`
export const executeApiRequest = async <T = ApiDataResponse>(
  props: ExecuteApiRequestProps
) => {
  const { path, method } = props
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  const options: ApiRequestOptions = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  }

  if (method !== "GET" && method !== "DELETE") {
    options.body = JSON.stringify(props.payload)
  }

  if (idToken) {
    options.headers.Authorization = `Bearer ${idToken}`
  }

  const response = await fetch(`${baseUrl}${path}`, options)

  const contentType = response.headers.get("Content-Type")

  if (contentType === "application/pdf") {
    const file = await response.blob()

    return file as T
  }

  const data: T | ApiErrorResponse = await response.json()

  if (!response.ok) {
    throw new Error((data as ApiErrorResponse).error)
  }

  return data as T
}
