import { type Request, type Response } from "express"

import { firebaseAuth, firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import {
  getSignUpFormFields,
  type SignUpData
} from "@/shared/forms/forms.const"
import type {
  InvitationDoc,
  UserMetadata
} from "@/shared/firestore/firestore.model"

export const handleCreateRequest = async (
  req: Request<undefined, undefined, SignUpData>,
  res: Response
) => {
  try {
    const { invitationId, ...formData } = req.body

    const invitationSnapshot = await firestore
      .collection("invitations")
      .doc(invitationId)
      .get()

    if (!invitationSnapshot.exists) {
      res.status(400).json({
        error: "The provided invitation ID is invalid"
      })

      return
    }

    const { creationTimestamp, ...invitation } =
      invitationSnapshot.data() as InvitationDoc

    const { errors, filteredData: signUpData } = getFormValidationResult({
      schema: getSignUpFormFields({
        ...invitation,
        creationTimestamp
      }),
      data: formData
    })

    if (errors) {
      res.status(400).json({
        error: "Invalid form data",
        details: errors
      })

      return
    }

    if (signUpData.email !== invitation.email) {
      res.status(400).json({
        error: "Invalid email address"
      })

      return
    }

    const { email, password, firstName, lastName, birthDate } = signUpData

    const { uid } = await firebaseAuth.createUser({
      email,
      emailVerified: true,
      password,
      displayName: `${firstName} ${lastName}`
    })

    const userMetadata: UserMetadata =
      invitation.metadata.role === "driver"
        ? {
            ...invitation.metadata,
            birthDate: birthDate as number
          }
        : invitation.metadata

    await firestore.collection("users").doc(uid).set(userMetadata)

    await firestore.collection("invitations").doc(invitationId).delete()

    const authToken = await firebaseAuth.createCustomToken(uid)

    res.status(200).json({ message: "User created successfully", authToken })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
}
