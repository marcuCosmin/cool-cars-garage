import { type Request } from "express"

import { getFirestoreDocs, isEmailUsed } from "@/firebase/utils"
import { firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"
import { getDVLADriverData } from "@/utils/get-dvla-driver-data"
import { getDVLAJWT } from "@/utils/get-dvla-jwt"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import {
  userCreateFields,
  type UserCreateData
} from "@/shared/forms/forms.const"
import type { User, UserDoc } from "@/shared/firestore/firestore.model"
import type { CreateUserResponse } from "@/shared/requests/requests.model"

import type { Response } from "@/models"

import { inviteUser } from "./utils"

const getUserDocData = async (
  userPayloadData: Omit<UserCreateData, "email">
): Promise<UserDoc> => {
  const creationTimestamp = getCurrentTimestamp()

  if (userPayloadData.role === "driver") {
    const dvlaJwt = await getDVLAJWT()
    const dvlaData = await getDVLADriverData(dvlaJwt)

    return {
      ...dvlaData,
      ...userPayloadData,
      isActive: true,
      creationTimestamp
    } as UserDoc
  }

  const { firstName, lastName, role } = userPayloadData

  return {
    role,
    isActive: true,
    firstName: firstName as string,
    lastName: lastName as string,
    creationTimestamp
  }
}

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

  const existingInvitation = await getFirestoreDocs({
    collection: "invitations",
    queries: [["email", "==", email]]
  })

  if (existingInvitation.length) {
    res.status(400).json({
      error: "An invitation for this email already exists"
    })
    return
  }

  const userDocData = await getUserDocData(remainingUserPayloadData)

  const createdUserRef = firestore.collection("users").doc()
  await createdUserRef.set(userDocData)

  const uid = createdUserRef.id

  const { firstName, lastName, role } = userDocData

  await inviteUser({
    email,
    role,
    firstName,
    lastName,
    uid
  })

  res.status(200).json({
    user: {
      ...userDocData,
      uid
    } as User
  })
}
