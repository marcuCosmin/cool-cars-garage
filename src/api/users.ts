import { usersUrl } from "./config"

import type { User as FirebaseUser } from "firebase/auth"
import type { UserMetadata } from "../models"

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
