import { type Request, type Response } from "express"

import { firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import { userFormFields, type UserFormData } from "@/shared/forms/forms.const"
import type { UserDoc } from "@/shared/firestore/firestore.model"

import { inviteUser } from "./utils"

export const handleCreateRequest = async (
  req: Request<undefined, undefined, UserFormData>,
  res: Response
) => {
  const { errors, filteredData: signUpData } = getFormValidationResult({
    schema: userFormFields,
    data: req.body
  })

  if (errors) {
    res.status(400).json({
      error: "Invalid form data",
      details: errors
    })

    return
  }

  const { email, firstName, lastName, role, ...userDocMetadata } = signUpData

  const userDocData: UserDoc = {
    firstName,
    lastName,
    role,
    isActive: true,
    creationTimestamp: getCurrentTimestamp()
  }

  if (userDocMetadata) {
    userDocData.metadata = userDocMetadata
  }

  const userDoc = await firestore.collection("users").add(userDocData)

  if (email) {
    await inviteUser({ ...userDocData, email, uid: userDoc.id })
  }

  res.status(200).json({ message: "User created successfully" })
}
