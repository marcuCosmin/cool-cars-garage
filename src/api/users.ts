import { usersUrl } from "./config"

import type { User as FirebaseUser } from "firebase/auth"
import type { UserMetadata } from "../models"
import { signInUser } from "../firebase/auth"

export type User = Pick<
  FirebaseUser,
  "displayName" | "email" | "phoneNumber" | "uid"
> &
  Pick<FirebaseUser["metadata"], "creationTime" | "lastSignInTime"> &
  UserMetadata

type FetchUsersResponse = {
  users: User[]
}

export const fetchUsers = async (idToken: string) => {
  try {
    const response = await fetch(usersUrl, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    })
    const data = await response.json()

    return data as FetchUsersResponse
  } catch {
    return { users: [] as User[] }
  }
}

type DeleteUserArgs = {
  idToken: string
  uid: string
}

export const deleteUser = async ({ idToken, uid }: DeleteUserArgs) => {
  try {
    const response = await fetch(`${usersUrl}?uid=${uid}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    })
    const { error } = await response.json()

    return error as string
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }

    return "Failed to delete user: Unknown error occurred"
  }
}

type InviteUserArgs = {
  idToken: string
  email: string
  role: string
}

export const inviteUser = async ({ idToken, email, role }: InviteUserArgs) => {
  try {
    const response = await fetch(`${usersUrl}/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      }
    })
    const { error } = await response.json()

    return error as string
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }

    return "Failed to invite user: Unknown error occurred"
  }
}

export type CreateUserArgs = {
  email: string
  password: string
  firstName: string
  lastName: string
  invitationId: string
}

export const createUser = async (body: CreateUserArgs) => {
  try {
    const response = await fetch(`${usersUrl}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    })
    const { error } = await response.json()

    if (error) {
      return error as string
    }

    const { email, password } = body

    await signInUser({ email, password })
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }

    return "Failed to create user: Unknown error occurred"
  }
}
