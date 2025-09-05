import { type Response } from "express"

import { getAuthUser, isEmailUsed } from "@/firebase/utils"
import { firebaseAuth, firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import type { Request } from "@/models"

import { userFormFields, type UserEditData } from "@/shared/forms/forms.const"

export const handleUserUpdate = async (
  req: Request<undefined, undefined, UserEditData>,
  res: Response
) => {
  const { uid, ...payload } = req.body
  const { errors, filteredData: updatedData } = getFormValidationResult({
    schema: userFormFields,
    data: payload
  })

  if (errors) {
    res.status(400).json({
      error: "Invalid form data",
      details: errors
    })

    return
  }

  const authUser = await getAuthUser(uid)

  if (!authUser) {
    res.status(400).json({ error: "Invalid uid" })
    return
  }

  const { email, ...userMetadata } = updatedData

  if (authUser.email !== email) {
    const emailIsUsed = await isEmailUsed(email as string)

    if (emailIsUsed) {
      res.status(400).json({
        error: "The provided email is already in use"
      })

      return
    }

    await firebaseAuth.updateUser(uid, {
      email
    })
  }

  await firestore.collection("users").doc(uid).set(userMetadata)

  res.status(200).json({ message: "User updated successfully" })
}
