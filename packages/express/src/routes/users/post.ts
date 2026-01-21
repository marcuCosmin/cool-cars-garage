import { type Request } from "express"

import { firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import {
  userCreateFields,
  type UserCreateData
} from "@/globals/forms/forms.const"
import type { CreateUserResponse } from "@/globals/requests/requests.model"

import type { Response } from "@/models"

import { getUserDocData, inviteUser, isEmailUsed } from "./utils"

export const handleUserPostRequest = async (
  req: Request<undefined, CreateUserResponse, UserCreateData>,
  res: Response<CreateUserResponse>
) => {
  const { errors, filteredData: userPayloadData } = getFormValidationResult({
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

  const emailIsUsed = await isEmailUsed(email)

  if (emailIsUsed) {
    res.status(400).json({
      error: "The provided email is already in use"
    })

    return
  }

  const userDocData = await getUserDocData(remainingUserPayloadData)

  const createdUserRef = firestore.collection("users").doc()
  await createdUserRef.set(userDocData)

  const uid = createdUserRef.id

  const { role } = userDocData

  await inviteUser({
    email,
    role,
    uid
  })

  res.status(200).json({
    user: {
      ...userDocData,
      isActive: true,
      email,
      uid
    }
  })
}
