import { firebaseAuth } from "@/firebase/config"

import type { InviteUserData } from "@/shared/forms/forms.const"

const baseUrl = import.meta.env.VITE_API_URL

type ExecuteApiRequestProps = {
  method: "POST"
  path: "/users/invite"
  payload: InviteUserData
}

type ApiErrorResponse = {
  error: string
}

type ApiDataResponse = {
  message: string
}

export const usersUrl = `${baseUrl}/users`
export const executeApiRequest = async ({
  path,
  method,
  payload
}: ExecuteApiRequestProps) => {
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(payload)
  })

  const data: ApiDataResponse | ApiErrorResponse = await response.json()

  if (!response.ok) {
    throw new Error((data as ApiErrorResponse).error)
  }

  return data as ApiDataResponse
}
