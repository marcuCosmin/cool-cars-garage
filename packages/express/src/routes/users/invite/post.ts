import { type Request } from "express"

import { getFirestoreDocs, isEmailUsed } from "@/firebase/utils"

import { getFormValidationResult } from "@/utils/get-form-validation-result"
import { getDVLADriverData } from "@/utils/get-dvla-driver-data"
import { getDVLAJWT } from "@/utils/get-dvla-jwt"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import {
  userInviteFields,
  type UserInviteData
} from "@/shared/forms/forms.const"
import type { InvitationDoc, User } from "@/shared/firestore/firestore.model"
import type { InviteUserResponse } from "@/shared/requests/requests.model"

import type { Response } from "@/models"

import { inviteUser } from "../utils"

const getUserDocData = async (
  userPayloadData: UserInviteData
): Promise<InvitationDoc> => {
  const creationTimestamp = getCurrentTimestamp()

  if (userPayloadData.role === "driver") {
    const dvlaJwt = await getDVLAJWT()
    const dvlaData = await getDVLADriverData(dvlaJwt)

    return {
      ...dvlaData,
      ...userPayloadData,
      isActive: true,
      creationTimestamp
    } as InvitationDoc
  }

  const { firstName, lastName, role, email } = userPayloadData

  return {
    email,
    role,
    isActive: true,
    firstName: firstName as string,
    lastName: lastName as string,
    creationTimestamp
  }
}

export const handleUserInvitation = async (
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

  const { email } = userPayloadData

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

  if (existingInvitation) {
    res.status(400).json({
      error: "An invitation for this email already exists"
    })
    return
  }

  const userDocData = await getUserDocData(userPayloadData)

  const invitationId = await inviteUser(userDocData)

  res.status(200).json({
    user: {
      ...userDocData,
      uid: invitationId
    } as User
  })
}
