import { type Response } from "express"

import { firestore } from "@/firebase/config"
import { isEmailUsed } from "@/firebase/utils"

import { sendMail } from "@/utils/send-mail"
import { getFormValidationResult } from "@/utils/get-form-validation-result"
import { getCurrentTimestamp } from "@/utils/get-current-timestamp"

import type { Request } from "@/models"

import { userFormFields, type UserFormData } from "@/shared/forms/forms.const"

import type {
  DriverMetadata,
  InvitationDoc
} from "@/shared/firestore/firestore.model"

export const handleUserInvitation = async (
  req: Request<undefined, undefined, UserFormData>,
  res: Response
) => {
  const { errors, filteredData: invitationFormData } = getFormValidationResult({
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

  const { email, role, ...invitationFormMetadata } = invitationFormData

  const emailIsUsed = await isEmailUsed(email as string)

  if (emailIsUsed) {
    res.status(400).json({
      error: "The provided email is already in use"
    })

    return
  }

  const existingInvite = await firestore
    .collection("invitations")
    .where("email", "==", email)
    .get()

  if (!existingInvite.empty) {
    res.status(400).json({
      error: "An invitation for this email already exists"
    })

    return
  }

  const invitationDataMetadata: InvitationDoc["metadata"] =
    role === "driver"
      ? {
          ...(invitationFormMetadata as Omit<DriverMetadata, "role">),
          role
        }
      : {
          role
        }

  const invitationData: InvitationDoc = {
    metadata: invitationDataMetadata,
    email,
    creationTimestamp: getCurrentTimestamp()
  }

  const createdInvite = await firestore
    .collection("invitations")
    .add(invitationData)

  await sendMail({
    to: email,
    subject: "Invitation to join Cool Cars Garage",
    html: `
        <div>Hello,</div>
        <br/>
        <div>You have been invited to join <a href="${process.env.ALLOWED_ORIGIN}">Cool Cars Garage</a>.</div>
        <div>Click <a href="${process.env.ALLOWED_ORIGIN}/sign-up?invitationId=${createdInvite.id}">here</a> to accept the invitation.</div>
        <br/>
        <div>Thanks,</div>
        <b>Cool Cars Garage</b> team
      `
  })

  res.status(200).json({ message: "Invitation sent successfully" })
}
