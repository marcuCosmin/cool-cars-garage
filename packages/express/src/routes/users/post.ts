import { firestore } from "@/backend/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import {
  userCreateFields,
  type UserCreateData
} from "@/globals/forms/forms.const"
import type { CreateUserResponse } from "@/globals/requests/requests.model"
import type {
  AuthUser,
  MechanicUser
} from "@/globals/firestore/firestore.model"

import type { Request, Response } from "@/models"

import { getUserDocData, inviteUser, isEmailUsed } from "./utils"

export const handleUserPostRequest = async (
  req: Request<undefined, CreateUserResponse, Partial<UserCreateData>>,
  res: Response<CreateUserResponse>
) => {
  const { errors, filteredData: userPayloadData } =
    await getFormValidationResult({
      schema: userCreateFields,
      data: req.body
    })

  if (errors) {
    res.status(400).json({
      error: "Invalid form data",
      details: errors
    })

    return
  }

  const { email, ...remainingUserPayloadData } = userPayloadData
  const { role } = remainingUserPayloadData

  if (role !== "mechanic") {
    const emailIsUsed = await isEmailUsed(email as string)

    if (emailIsUsed) {
      res.status(400).json({
        error: "The provided email is already in use"
      })

      return
    }
  }

  const userDocData = await getUserDocData(remainingUserPayloadData)

  const createdUserRef = firestore.collection("users").doc()
  await createdUserRef.set(userDocData)

  const uid = createdUserRef.id

  if (role !== "mechanic") {
    await inviteUser({
      email: email as string,
      role,
      uid
    })
  }

  if (role === "mechanic") {
    res.status(200).json({
      user: { ...userDocData, isActive: true, uid } as MechanicUser
    })

    return
  }

  res.status(200).json({
    user: {
      ...userDocData,
      isActive: true,
      uid,
      email: email as string
    } as AuthUser
  })
}
