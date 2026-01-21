import { type Request } from "express"

import { getFirestoreDoc } from "@/firebase/utils"
import { firebaseAuth, firestore } from "@/firebase/config"

import { getFormValidationResult } from "@/utils/get-form-validation-result"

import type { Response } from "@/models"

import type { RegisterUserResponse } from "@/globals/requests/requests.model"
import { signUpFormFields, type SignUpData } from "@/globals/forms/forms.const"

export const handleUserRegistration = async (
  req: Request<undefined, RegisterUserResponse, SignUpData>,
  res: Response<RegisterUserResponse>
) => {
  const { invitationId, ...payload } = req.body
  const { errors, filteredData: registerPayload } = getFormValidationResult({
    schema: signUpFormFields,
    data: payload
  })

  if (errors) {
    res.status(400).json({
      error: "Invalid form data",
      details: errors
    })

    return
  }

  const { email, password } = registerPayload

  const invitation = await getFirestoreDoc({
    collection: "invitations",
    docId: invitationId
  })

  if (!invitation?.isActive || invitation.email !== email) {
    res.status(400).json({
      error: "Invalid invitation id"
    })

    return
  }

  await firebaseAuth.createUser({
    uid: invitation.uid,
    email: email as string,
    password: password as string
  })

  const authToken = await firebaseAuth.createCustomToken(invitation.uid)

  await firestore.collection("invitations").doc(invitation.id).delete()

  res.status(200).json({
    authToken
  })
}
