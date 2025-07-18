import { usersUrl } from "./config"

import { signInUser } from "../firebase/auth"

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

export type SMSVerification = {
  validity: number
  verificationId: string
}

type SendSMSVerificationCode = (args: {
  phoneNumber: string
  idToken: string
}) => Promise<
  Partial<SMSVerification> & {
    error?: string
  }
>

export const sendSMSVerificationCode: SendSMSVerificationCode = async ({
  phoneNumber,
  idToken
}) => {
  try {
    const response = await fetch(`${usersUrl}/send-verification-sms`, {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      }
    })
    const { error, ...verification } = (await response.json()) as Awaited<
      ReturnType<SendSMSVerificationCode>
    >

    if (error) {
      return { error }
    }

    return verification
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }

    return { error: "Failed to send SMS code" }
  }
}

type UpdateUserData = {
  idToken: string
  phoneNumber: string
  verificationId: string
  code: string
}

export const updateUserPhoneNumber = async ({
  idToken,
  ...body
}: UpdateUserData) => {
  try {
    const response = await fetch(`${usersUrl}/update-phone-number`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      }
    })
    const { error } = await response.json()

    if (error) {
      return error as string
    }
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }

    return "Failed to send update user data"
  }
}

export const getAuthToken = async (idToken: string) => {
  try {
    const response = await fetch(`${usersUrl}/generate-auth-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      }
    })

    const { authToken } = await response.json()

    return authToken
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }

    return "Failed to generate custom token"
  }
}
