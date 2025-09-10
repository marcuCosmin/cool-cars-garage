import { type Request, type Response } from "express"

import { firestore } from "@/firebase/config"
import { isEmailUsed } from "@/firebase/utils"

import { getFormValidationResult } from "@/utils/get-form-validation-result"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import {
  userCreateFields,
  type UserCreateData
} from "@/shared/forms/forms.const"
import type {
  DriverMetadata,
  UserBaseProps,
  UserDoc
} from "@/shared/firestore/firestore.model"

import { inviteUser } from "./utils"

export const handleCreateRequest = async (
  req: Request<undefined, undefined, UserCreateData>,
  res: Response
) => {
  const { errors, filteredData: userData } = getFormValidationResult({
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

  const { email, firstName, lastName, role, ...userDocMetadata } = userData

  const userBaseProps: UserBaseProps = {
    firstName,
    lastName,
    isActive: true,
    creationTimestamp: getCurrentTimestamp()
  }

  const userDocData: UserDoc =
    role === "driver"
      ? {
          ...userBaseProps,
          role,
          metadata: userDocMetadata as Required<DriverMetadata>
        }
      : { ...userBaseProps, role }

  if (email) {
    const emailIsUsed = await isEmailUsed(email)

    if (emailIsUsed) {
      res.status(400).json({
        error: "The provided email is already in use"
      })
      return
    }

    const invitationSnapshot = await firestore
      .collection("invitations")
      .where("email", "==", email)
      .get()

    if (!invitationSnapshot.empty) {
      res.status(400).json({
        error: "An invitation for this email already exists"
      })
      return
    }

    await inviteUser({ ...userDocData, email })

    res.status(200).json({ message: "User invited successfully" })
    return
  }

  const userDocSnapshot = await firestore
    .collection("users")
    .where("email", "==", email)
    .get()

  if (!userDocSnapshot.empty) {
    res.status(400).json({
      error: "The provided email is already in use"
    })
    return
  }

  await firestore.collection("users").add(userDocData)

  res.status(200).json({ message: "User created successfully" })
}
