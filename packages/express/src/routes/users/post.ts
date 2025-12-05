import { type Request } from "express"

import { getFirestoreDocs, isEmailUsed } from "@/firebase/utils"
import { firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"
import { getDVLADriverData } from "@/utils/get-dvla-driver-data"
import { getDVLAJWT } from "@/utils/get-dvla-jwt"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import {
  userInviteFields,
  type UserInviteData
} from "@/shared/forms/forms.const"
import type { User, UserDoc } from "@/shared/firestore/firestore.model"
import type { InviteUserResponse } from "@/shared/requests/requests.model"

import type { Response } from "@/models"

import { inviteUser } from "./utils"

const getUserDocData = async (
  userPayloadData: Omit<UserInviteData, "email">
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

export const handleCreateRequest = async (
  req: Request<undefined, InviteUserResponse, UserInviteData>,
  res: Response<InviteUserResponse>
) => {
  const { errors, filteredData: userPayloadData } = getFormValidationResult({
    schema: userInviteFields,
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

  const { firstName, lastName, role } = userDocData

  const invitationId = await inviteUser({
    email,
    role,
    firstName,
    lastName
  })

  res.status(200).json({
    user: {
      ...userDocData,
      uid: invitationId
    } as User
  })
}
