import { type Response } from "express"

import {
  getAuthUser,
  getFirestoreDoc,
  getFirestoreDocs,
  isEmailUsed
} from "@/firebase/utils"
import { firebaseAuth, firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import type { Request } from "@/models"

import { userEditFields, type UserEditData } from "@/shared/forms/forms.const"

export const handleUserPatchRequest = async (
  req: Request<undefined, undefined, UserEditData>,
  res: Response
) => {
  const { uid, ...payload } = req.body
  const { errors, filteredData: updatedData } = getFormValidationResult({
    schema: userEditFields,
    data: payload
  })

  if (errors) {
    res.status(400).json({
      error: "Invalid form data",
      details: errors
    })

    return
  }

  const userDoc = await getFirestoreDoc({
    collection: "users",
    docId: uid
  })

  if (!userDoc) {
    res.status(400).json({ error: "Invalid uid" })
    return
  }

  const { email, ...userMetadata } = updatedData

  const emailIsUsed = await isEmailUsed(email as string)

  const authUser = await getAuthUser(uid)

  if (authUser && authUser.email !== email) {
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

  const [invitation] = await getFirestoreDocs({
    collection: "invitations",
    queries: [["uid", "==", uid]]
  })

  if (invitation && invitation.email !== email) {
    await firestore.collection("invitations").doc(invitation.id).update({
      email
    })
  }

  await firestore.collection("users").doc(uid).update(userMetadata)

  res.status(200).json({ message: "User updated successfully" })
}
