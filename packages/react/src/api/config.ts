import { firebaseAuth } from "@/firebase/config"

import type { InviteUserFormData, SignUpData } from "@/shared/forms/forms.const"

const baseUrl = import.meta.env.VITE_API_URL

type ExecuteApiRequestProps = {
  method: "POST" | "GET" | "DELETE" | "PUT"
  path:
    | "/users"
    | "/users/invite"
    | "/users/generate-auth-token"
    | `/users?${string}`
  payload?: InviteUserFormData | SignUpData
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
export const executeApiRequest = async <
  T extends Record<string, unknown> = ApiDataResponse
>({
  path,
  method,
  payload
}: ExecuteApiRequestProps) => {
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  const options: ApiRequestOptions = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  }

  if (method !== "GET") {
    options.body = JSON.stringify(payload)
  }

  if (idToken) {
    options.headers.Authorization = `Bearer ${idToken}`
  }

  const response = await fetch(`${baseUrl}${path}`, options)

  const data: T | ApiErrorResponse = await response.json()

  if (!response.ok) {
    throw new Error((data as ApiErrorResponse).error)
  }

  return data as T
}
