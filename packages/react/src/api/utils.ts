import { executeApiRequest } from "./config"

import type { InviteUserFormData, SignUpData } from "@/shared/forms/forms.const"

import type { User } from "@/shared/firestore/firestore.model"

export const inviteUser = (payload: InviteUserFormData) =>
  executeApiRequest({
    path: "/users/invite",
    method: "POST",
    payload
  })

type GetAllUsersResponse = {
  users: User[]
}
export const getAllUsers = () =>
  executeApiRequest<GetAllUsersResponse>({
    path: "/users",
    method: "GET"
  })

type GetAuthTokenResponse = {
  authToken: string
}
export const getAuthToken = () =>
  executeApiRequest<GetAuthTokenResponse>({
    path: "/users/generate-auth-token",
    method: "GET"
  })

type CreateUserResponse = {
  authToken: string
}
export const createUser = (payload: SignUpData) =>
  executeApiRequest<CreateUserResponse>({
    path: "/users",
    method: "POST",
    payload
  })
